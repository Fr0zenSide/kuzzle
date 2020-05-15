/*
 * Kuzzle, a backend software, self-hostable and ready to use
 * to power modern apps
 *
 * Copyright 2015-2020 Kuzzle
 * mailto: support AT kuzzle.io
 * website: http://kuzzle.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const _ = require('lodash');
<<<<<<< HEAD:lib/core/abstractManifest.js
const path = require('path');
const semver = require('semver');

const errorsManager = require('../util/errors').wrap('plugin', 'manifest');
=======
const kerror = require('../../kerror').wrap('plugin', 'manifest');
const path = require('path');
const semver = require('semver');
>>>>>>> 2-dev:lib/core/shared/abstractManifest.js

/**
 * Abstract class used to load a manifest.json file.
 * Used as a base for plugins and protocols.
 *
 * @param {Kuzzle} kuzzle       - Kuzzle instance
 * @param {string} pluginPath   - Absolute path to the plugin directory
 */
class AbstractManifest {
  constructor(kuzzle, pluginPath) {
    Reflect.defineProperty(this, '_kuzzle', {
      value: kuzzle
    });
    this.path = pluginPath;

    this.manifestPath = path.resolve(this.path, 'manifest.json');
    this.name = null;
    this.kuzzleVersion = null;
    this.raw = null;
  }

  get kuzzle () { return this._kuzzle; }

  load() {
    try {
      this.raw = require(this.manifestPath);
<<<<<<< HEAD:lib/core/abstractManifest.js
    }
    catch (e) {
      throw errorsManager.get('cannot_load', this.manifestPath, e.message);
=======
    } catch (e) {
      throw kerror.get('cannot_load', this.manifestPath, e.message);
>>>>>>> 2-dev:lib/core/shared/abstractManifest.js
    }

    if (_.isNil(this.raw.kuzzleVersion)) {
      throw kerror.get('missing_version', this.manifestPath);
    }

    this.kuzzleVersion = this.raw.kuzzleVersion;

    if (!semver.satisfies(this.kuzzle.config.version, this.kuzzleVersion)) {
      throw kerror.get(
        'version_mismatch',
        this.path,
        this.kuzzle.config.version,
        this.kuzzleVersion);
    }

    if (!_.isNil(this.raw.name)) {
      if (typeof this.raw.name !== 'string' || this.raw.name.length === 0) {
        throw kerror.get('invalid_name_type', this.manifestPath);
      }

      this.name = this.raw.name;
    }
    else {
      throw kerror.get('missing_name', this.manifestPath);
    }
  }

  /**
   * This object can be stringified and exported, most notably by the
   * server:info API route
   * It's important that only relevant properties are stringified, to
   * prevent circular JSONs (especially with the kuzzle object ref) and
   * to prevent leaking important information
   *
   * @return {Object}
   */
  toJSON() {
    return {
      kuzzleVersion: this.kuzzleVersion,
      name: this.name,
      path: this.path
    };
  }
}

module.exports = AbstractManifest;