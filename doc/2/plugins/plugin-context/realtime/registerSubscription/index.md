---
code: true
type: page
title: registerSubscription
---

# registerSubscription

Registers a new realtime subscription over an existing connection. All the notifications triggered by the newly created subscription will be sent to the client with the given connection ID. The subscription works exaclty like the one created by the [`realtime:subscribe` API endpoint](/api/controllers/realtime/subscribe/index.md).

---

## Arguments

```js
registerSubscription(connectionId, index, collection, filters, [object])
```

<br/>

| Argument | Type | Description |
|----------|------|-------------|
| `connectionId` | `String` | The connection ID to route the subscription notifications to |
| `index` | `String` | The index containing the collection to subscribe to |
| `collection` | `String` | The collection to subscribe to |
| `filters` | `Object` | The subscription filters, expressed in [Koncorde]() syntax |
| `options` | `Object` | The options to pass to the subscription |

### `options`

The options are the same of the [`realtime:subscribe` API endpoint](/api/controllers/realtime/subscribe/index.md).

- `scope`: accepted values: `all`, `in`, `out`, `none` (default: `all`). Subscribe to either new documents entering the scope of the subscription filters (`in`), to documents leaving it (`out`), or both (`all`). Alternatively, document notifications can be ignored entirely (`none`)
- `users`: accepted values: `all`, `in`, `out`, `none` (default: `none`). Receive real-time notifications about users subscribing to the same filters (`in`), about users leaving the subscription (`out`), or both (`all`). If set to `none`, no notifications are sent about users
- `volatile`: subscription information, used in [user join/leave notifications](/core/2/api/essentials/volatile-data)

---

## Return

Resolves to the room ID associated with the registered subscription.

---

## Example

```js
async customAction(request) {
  const filters = {
    equals: {
      myAttribute: 'my-value'
    }
  }
  const options = {}
  const roomId = await this.context.accessors.registerSubscription(
        request.context.connection.id,
        'myindex',
        'mycollection',
        filters,
        options
      );

  return { roomId }
}
```

---

## Use cases

The most common use-case of this method is to implement the realtime subscriptions on the server-side. Instead of leaving the client-side with the freedom (and the responsibility) of specifying the filters for a subscription, you can open a custom API endpoint in your plugin and call `registerSubscription` inside it by passing the same connection ID of the incoming Request. When the client hits this endpoint, they will start receiving the notifications from the newly created subscription. This way, the client will only be aware of a `subscribeToSomething` business-specific endpoint, but won't see the set of filters the endpoint encapsulates. 

::: info
Note that the same restriction can be achieved by adding a pipe on the `realtime:subscribe` API endpoint. The pipe would check the filters object and make the request fail if the filters are not allowed. This approach has two main downsides:
* you always need to be extremely careful when adding code to pipes that may result in failing requests, that's why code in pipes should always stay as light as possible;
* even if you are ensuring security through the pipe, you still have to specify the filters in the client-side, while you may want to leave this responsibility to the server-side.
:::
