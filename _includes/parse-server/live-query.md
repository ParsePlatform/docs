# Live Queries

`Parse.Query` is one of the key concepts for Parse. It allows you to retrieve `Parse.Object`s by specifying some conditions, making it easy to build apps such as a dashboard, a todo list or even some strategy games. However, `Parse.Query` is based on a pull model, which is not suitable for apps that need real-time support.

Suppose you are building an app that allows multiple users to edit the same file at the same time. `Parse.Query` would not be an ideal tool since you can not know when to query from the server to get the updates.

To solve this problem, we introduce **Parse LiveQuery**. This tool allows you to subscribe to a `Parse.Query` you are interested in. Once subscribed, the server will notify clients whenever a `Parse.Object` that matches the `Parse.Query` is created or updated, in real-time.

Parse LiveQuery contains two parts, the LiveQuery server and the LiveQuery clients. In order to use live queries, you need to set up both of them.

## Server Setup

The LiveQuery server should work with a Parse Server. The easiest way to setup the LiveQuery server is to make it run with the Parse Server in the same process. When you initialize the Parse Server, you need to define which `Parse.Object` classes you want to enable LiveQuery like this:

```javascript
let api = new ParseServer({
  ...,
  liveQuery: {
    classNames: ['Test', 'TestAgain']
  }
});
```

After that, you need to initialize a LiveQuery server like this:

```javascript
// Initialize a LiveQuery server instance, app is the express app of your Parse Server
let httpServer = require('http').createServer(app);
httpServer.listen(port);
var parseLiveQueryServer = ParseServer.createLiveQueryServer(httpServer);
```

The `ws` protocol URL of the LiveQuery server is the hostname and port which the `httpServer` is listening to. For example, if the `httpServer` is listening to `localhost:8080`, the `ws` protocol of the LiveQuery server is `ws://localhost:8080/`. We will allow you to customize the path of `ws` protocol URL of the LiveQuery server later, currently it is fixed and you can not set path.

## Client Setup

We provide JavaScript, Android and iOS LiveQuery Clients for now. Lets use the JavaScript client as an example. In order to use LiveQuery, you need to initialize a `Parse.Query` object and subscribe to it.

```javascript
let query = new Parse.Query('People');
query.equalTo('name', 'Mengyan');
let subscription = await query.subscribe();
```

After you get the `subscription`, you can use it to receive the updates of the related `Parse.Object`. For example, if someone creates a `People` object whose `name` field is `Mengyan`, then you can get the `People` object like this:

```javascript
subscription.on('create', (people) => {
  console.log(people.get('name')); // This should output Mengyan
});
```

After that, if someone updates this `People` object like changing its score to 100, then you can get the `People` object like this:

```javascript
subscription.on('update', (people) => {
  console.log(people.get('score')); // This should output 100
});
```

If you are done with the LiveQuery, you can simply unsubscribe the `subscription` to finish receiving events

```javascript
subscription.unsubscribe();
```

## Events

We support five types of event:

* `create`
* `enter`
* `update`
* `leave`
* `delete`

## Further Reading

You can check the [LiveQuery protocol specification](https://github.com/parse-community/parse-server/wiki/Parse-LiveQuery-Protocol-Specification) to learn more about each event type.

For more details about the JavaScript LiveQuery Client SDK, check out the [open source code](https://github.com/parse-community/Parse-SDK-JS) and the [Live Query section in the JavaScript Guide]({{ site.baseUrl }}/js/guide/#live-queries).

For the iOS LiveQuery Client SDK, check out the [open source code](https://github.com/parse-community/ParseLiveQuery-iOS-OSX).

## LiveQuery Protocol

The LiveQuery Protocol is the key to the Parse LiveQuery. The clients and server communicate through WebSocket using this protocol. Clients can follow the protocol to connect to the LiveQuery server, subscribe/unsubscribe a `Parse.Query` and get updates from the LiveQuery server.

The LiveQuery protocol is a simple protocol that encapsulates messages in JSON strings and runs over a WebSocket connection. You can find the specification in the For the specification, check out the [Parse Server wiki page](https://github.com/parse-community/parse-server/wiki/Parse-LiveQuery-Protocol-Specification).

## LiveQuery Server

### Configuring the server

The full configuration of the LiveQuery server should look like this:

```javascript
{
  appId: 'myAppId',
  masterKey: 'myMasterKey',
  keyPairs: {
    "restAPIKey": "",
    "javascriptKey": "",
    "clientKey": "",
    "windowsKey": "",
    "masterKey": ""
  },
  serverURL: 'serverURL',
  websocketTimeout: 10 * 1000,
  cacheTimeout: 60 * 600 * 1000,
  logLevel: 'VERBOSE'
}
```

**Options**

* `appId` - Required. This string should match the `appId` in use by your Parse Server. If you deploy the LiveQuery server alongside Parse Server, the LiveQuery server will try to use the same `appId`.
* `masterKey` - Required. This string should match the `masterKey` in use by your Parse Server. If you deploy the LiveQuery server alongside Parse Server, the LiveQuery server will try to use the same `masterKey`.
* `serverURL` - Required. This string should match the `serverURL` in use by your Parse Server. If you deploy the LiveQuery server alongside Parse Server, the LiveQuery server will try to use the same `serverURL`.
* `keyPairs` - Optional. A JSON object that serves as a whitelist of keys. It is used for validating clients when they try to connect to the LiveQuery server. Check the following Security section and our protocol specification for details.
* `websocketTimeout` - Optional. Number of milliseconds between ping/pong frames. The WebSocket server sends ping/pong frames to the clients to keep the WebSocket alive. This value defines the interval of the ping/pong frame from the server to clients. Defaults to 10 * 1000 ms (10 s).
* `cacheTimeout` - Optional. Number in milliseconds. When clients provide the `sessionToken` to the LiveQuery server, the LiveQuery server will try to fetch its `ParseUser`'s objectId from parse server and store it in the cache. The value defines the duration of the cache. Check the following Security section and our protocol specification for details. Defaults to 30 * 24 * 60 * 60 * 1000 ms (~30 days).
* `logLevel` - Optional. This string defines the log level of the LiveQuery server. We support `VERBOSE`, `INFO`, `ERROR`, `NONE`. Defaults to `INFO`.

### Basic Architecture

<img alt="" data-echo="{{ '/assets/images/lq_local.png' | prepend: site.baseurl }}"/>

The LiveQuery server is a separate server from Parse Server. As shown in the picture, it mainly contains four components at the runtime.

* **The Publisher**. It is responsible for publishing the update of a `Parse.Object`. When a `Parse.Object` changes, it will publish a message to the subscribers. The message contains the original `Parse.Object` and the new `Parse.Object`. The Publisher is inside the Parse Server at the runtime.
* **The Subscriber**. It is responsible for receiving the messages which are sent from the Publisher. After it gets the messages, it can pass them to the LiveQuery component for processing.
* **The WebSocketServer**. It is responsible for maintaining the WebSocket connections with clients. It can pass the subscribe/unsubscribe messages from clients to the LiveQuery component. When the LiveQuery component finds a `Parse.Object` fulfills a `Parse.Query`, it will get the event message from LiveQuery component and send it to the clients.
* **The LiveQuery**. It is the key component of the LiveQuery Server. It maintains the subscription status of clients. After it gets the `Parse.Object` updates from the Subscriber, it can do the query matching and generate the event messages for clients.

### Scalability

Based on your usage, different components of the LiveQuery server may become the bottleneck. If you app has high throughput, the Publisher/Subscriber may have problems. If you subscribe to many complex `Parse.Query`s, the LiveQuery component may cause issues. If you need to maintain lots of clients, the WebSocketServer may be the bottleneck. Thus, we highly recommend you to do the load testing for your app if you want to use LiveQuery server in production.

In general, our suggestion to make the LiveQuery server scalable is to separate the Parse Server with the LiveQuery server and add more LiveQuery server instances based on your need. To help you do this, we use Redis to implement a Publisher and Subscriber. If you want to use that, the only thing you need to do is to provide the Redis server address when you initialize the Parse Server and LiveQuery server like this:

```javascript
let api = new ParseServer({
  ...,
  liveQuery: {
    classNames: ['Test', 'TestAgain'],
    redisURL: 'redis://localhost:6379'
  }
});

...

let httpServer = require('http').createServer(app);
httpServer.listen(port);
var parseLiveQueryServer = ParseServer.createLiveQueryServer(httpServer,  {
  ...,
  redisURL: 'redis://localhost:6379'
});
```
This redis database should be different from the redis database used for `RedisCacheAdapter`.

The architecture of the whole LiveQuery system after you use Redis should be like this:

<img alt="" data-echo="{{ '/assets/images/lq_multiple.png' | prepend: site.baseurl }}"/>

For example, if you use Heroku to deploy your Live Query server, after you setup the Redis with the LiveQuery server, you can simply add more dynos to make your app more scalable like this:

<img alt="" data-echo="{{ '/assets/images/lq_heroku.png' | prepend: site.baseurl }}"/>

### Security with LiveQuery

The LiveQuery server provides two ways to secure your app. The first one is key matching. If you provide key pairs when you initialize the LiveQuery server, when clients try to connect to LiveQuery server, they have to provide the necessary key pairs. Otherwise, the connection will be refused.

The second one is ACL. For what is ACL, you can check the definition [here](http://blog.parse.com/learn/engineering/parse-security-iii-are-you-on-the-list/). When clients try to connect and subscribe to the LiveQuery server, they can provide their `sessionToken`. If you give your `Parse.Object` proper ACL, when the LiveQuery server get the updates of the `Parse.Object`, it will try to match `Parse.Object`'s ACL with the `sessionToken` of clients or their subscriptions. The event will be only sent to clients whose `sessionToken` matches the `Parse.Object`'s ACL.

## LiveQuery Clients

The JavaScript LiveQuery client is provided as part of the Parse JavaScript SDK as of version 1.8.0. A separate LiveQuery client library is available for iOS / OS X and Android.

* [Parse JavaScript SDK](https://github.com/parse-community/Parse-SDK-JS)
* [Parse LiveQuery iOS / OS X](https://github.com/parse-community/ParseLiveQuery-iOS-OSX)
* [Parse LiveQuery Android](https://github.com/parse-community/ParseLiveQuery-Android)

## LiveQuery With NGINX

Please refer to the [NGINX documentation](https://www.nginx.com/blog/websocket-nginx/) in order to allow a proper handling of the LiveQuery server that relies on web sockets
