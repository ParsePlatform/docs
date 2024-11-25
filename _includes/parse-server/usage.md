# Usage

Parse Server is meant to be mounted on an [Express](http://expressjs.com/) app. Express is a web framework for Node.js. The fastest way to get started is to clone the [Parse Server repo](https://github.com/parse-community/parse-server), which at its root contains a sample Express app with the Parse API mounted.

The constructor returns an API object that conforms to an [Express Middleware](http://expressjs.com/en/api.html#app.use). This object provides the REST endpoints for a Parse app. Create an instance like so:

```js
const api = new ParseServer({
  databaseURI: 'mongodb://your.mongo.uri',
  cloud: './cloud/main.js',
  appId: 'myAppId',
  fileKey: 'myFileKey',
  masterKey: 'mySecretMasterKey',
  push: { ... }, // See the Push wiki page
  filesAdapter: ...,
});
```

A few of the [Parse Server Options](https://parseplatform.org/parse-server/api/master/ParseServerOptions.html) are as follows:

* `databaseURI`: Connection string for your database.
* `cloud`: Path to your app’s Cloud Code.
* `appId`: A unique identifier for your app.
* `fileKey`: A key that specifies a prefix used for file storage. For migrated apps, this is necessary to provide access to files already hosted on Parse.
* `masterKey`: A key that overrides all permissions. Keep this secret.
* `clientKey`: The client key for your app. (optional)
* `restAPIKey`: The REST API key for your app. (optional)
* `javascriptKey`: The JavaScript key for your app. (optional)
* `dotNetKey`: The .NET key for your app. (optional)
* `push`: An object containing push configuration. See [Push](#push-notifications)
* `filesAdapter`: An object that implements the [FilesAdapter](https://github.com/parse-community/parse-server/blob/master/src/Adapters/Files/FilesAdapter.js) interface. For example, [the S3 files adapter](#configuring-file-adapters)
* `auth`: Configure support for [3rd party authentication](#oauth-and-3rd-party-authentication).
* `maxUploadSize`: Maximum file upload size. Make sure your server does not restrict max request body size (e.g. nginx.conf `client_max_body_size 100m;`)

Next, Parse Server can be started with the `.start` method. This ensures that the database connection is establised, cloud code is registered, and any other startup actions.

In order to access an express middleware for `app.use`, you can all `.app` value. This will mount the Parse API at a specified path in your Express app:

```js
const express = require('express');
const ParseServer = require('parse-server').ParseServer;

const app = express();
const api = new ParseServer({ ... });
(async() => {
  await api.start();
})();

// Serve the Parse API at /parse URL prefix
app.use('/parse', api.app);

const port = 1337;
app.listen(port, function() {
  console.log('parse-server-example running on port ' + port + '.');
});
```

And with that, you will have a Parse Server running on port 1337, serving the Parse API at `/parse`.
