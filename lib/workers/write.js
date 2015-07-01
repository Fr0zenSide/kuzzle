var
  q = require('q'),
  _ = require('lodash'),
  async = require('async');

module.exports = {

  kuzzle: null,
  taskQueue: 'worker-write-queue',

  init: function (kuzzle) {
    this.kuzzle = kuzzle;
    this.kuzzle.services.list.broker.listen(this.taskQueue, onListenCB.bind(this));
  }
};

function onListenCB (data) {
  var
    roomWriteResponse;

  if (data.persist === false) {
    return false;
  }

  if (typeof this.kuzzle.services.list.writeEngine[data.action] !== 'function') {
    return false;
  }

  roomWriteResponse = 'write_response_' + data.internalId;

  this.kuzzle.services.list.writeEngine[data.action](_.clone(data))
    .then(function (result) {
      // when we have the response from writeEngine, add it to the broker
      this.kuzzle.services.list.broker.add(roomWriteResponse, {error: null, result: _.extend(data, result)});

      // notify rooms for the created/updated/deleted document
      updateDocument.call(this, data, result)
        .then(function (updatedData) {
          this.kuzzle.services.list.broker.add(this.kuzzle.notifier.taskQueue, updatedData);
        }.bind(this))
        .catch(function (error) {
        });
    }.bind(this))
    .catch(function (error) {
      this.kuzzle.services.list.broker.add(roomWriteResponse, {error: error});
      this.kuzzle.log.error(error);
    }.bind(this));
}

function updateDocument (data, writeResponse) {
  var
    deferred = q.defer(),
    requestGet;

  // Actions: create, update, delete
  if (writeResponse._id) {
    data._id = writeResponse._id;
  }

  // Actions: *ByQuery
  if (writeResponse.ids) {
    data.ids = writeResponse.ids;
  }

  // We'll notify using the updated version of the document
  if (data.action === 'update') {
    requestGet = {
      collection: data.collection,
      id: writeResponse._id
    };

    this.kuzzle.services.list.readEngine.get(requestGet)
      .then(function (result) {
        deferred.resolve({data: result});
      })
      .catch(function (error) {
        deferred.reject(error);
      }.bind(this));
  }

  deferred.resolve(data);
  return deferred.promise;
}
