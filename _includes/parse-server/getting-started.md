# Getting Started

Parse Server is an open source backend that can be deployed to any infrastructure that can run Node.js. You can find the source on the [GitHub repo](https://github.com/parse-community/parse-server).

* Parse Server uses MongoDB or PostgreSQL as a database.
* You can deploy and run Parse Server on your own infrastructure.
* You can develop and test your app locally using Node.

The following guide describes how to set up Parse Server on your personal computer for local development. If you want to be able to access Parse Server from anywhere and make your app accessible publicly, you would want to deploy Parse Server to a cloud service provider like Amazon Web Services, Google Cloud, Microsoft Azure, Heroku or DigitalOcean. These providers vary in set-up complexity, configuration efforts, pricing model and required knowledge to secure your deployment. You can find guides for how to deploy Parse Server for specific providers in [Deploying Parse Server]({{ site.baseUrl }}/parse-server/guide/#deploying-parse-server) section.

⚠️ Before making Parse Server accessible publicly, we strongly recommend to review all of your Parse Server configuration and read our [best practice]({{ site.baseUrl }}/parse-server/guide/#best-practice) guide. Failing to properly adapt your Parse Server configuration for a publicly accessible environment may make your deployment vulnerable to malicious intrusions, data leaks and unexpected cost increases.

**Prerequisites**

* Node
* MongoDB (to use Parse Server with MongoDB)
* PostgreSQL (to use Parse Server with PostgreSQL)

Ensure that the Node.js version is compatible with your version of Parse Server, for details see the [compatibility table](https://github.com/parse-community/parse-server#compatibility).

The fastest and easiest way to get started is to run MongoDB and Parse Server locally. Use the bootstrap script to set up Parse Server in the current directory.

```bash
sh <(curl -fsSL https://raw.githubusercontent.com/parse-community/parse-server/master/bootstrap.sh)
npm install -g mongodb-runner
mongodb-runner start
npm start
```

You can use any arbitrary string as your application id and master key. These will be used by your clients to authenticate with the Parse Server.

That's it! You are now running a standalone version of Parse Server on your machine.

## Saving your first object

Now that you're running Parse Server, it is time to save your first object. We'll use the [REST API]({{ site.baseUrl }}/rest/guide), but you can easily do the same using any of the [Parse SDKs]({{ site.baseUrl }}/). Run the following:

```bash
curl -X POST \
-H "X-Parse-Application-Id: APPLICATION_ID" \
-H "Content-Type: application/json" \
-d '{"score":123,"playerName":"Sean Plott","cheatMode":false}' \
http://localhost:1337/parse/classes/GameScore
```

You should get a response similar to this:

```jsonc
{
  "objectId": "2ntvSpRGIK",
  "createdAt": "2022-01-01T12:23:45.678Z"
}
```

You can now retrieve this object directly (make sure to replace `2ntvSpRGIK` with the actual `objectId` you received when the object was created):

```bash
curl -X GET \
  -H "X-Parse-Application-Id: APPLICATION_ID" \
  http://localhost:1337/parse/classes/GameScore/2ntvSpRGIK
```

```jsonc
// Response
{
  "objectId": "2ntvSpRGIK",
  "score": 123,
  "playerName": "Sean Plott",
  "cheatMode": false,
  "updatedAt": "2022-01-01T12:23:45.678Z",
  "createdAt": "2022-01-01T12:23:45.678Z"
}
```

Keeping tracks of individual object ids is not ideal, however. In most cases you will want to run a query over the collection, like so:

```bash
curl -X GET \
  -H "X-Parse-Application-Id: APPLICATION_ID" \
  http://localhost:1337/parse/classes/GameScore
```

```jsonc
// The response will provide all the matching objects within the `results` array:
{
  "results": [
    {
      "objectId": "2ntvSpRGIK",
      "score": 123,
      "playerName": "Sean Plott",
      "cheatMode": false,
      "updatedAt": "2022-01-01T12:23:45.678Z",
      "createdAt": "2022-01-01T12:23:45.678Z"
    }
  ]
}

```

To learn more about using, saving, and querying objects on Parse Server, check out the [documentation]({{ site.baseUrl }}/) for the SDK you will be using in your app.

## Connect your app to Parse Server

Parse provides SDKs for all the major platforms. Refer to the rest of the Parse Server guide to [learn how to connect your app to Parse Server](#using-parse-sdks-with-parse-server).

## Running Parse Server elsewhere

Once you have a better understanding of how the project works, please refer to the [Deploying Parse Server section](#deploying-parse-server) to learn more about additional ways of running Parse Server.
