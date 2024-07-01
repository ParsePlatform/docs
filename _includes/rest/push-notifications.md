# Push Notifications

Push Notifications are a great way to keep your users engaged and informed about your app. You can reach your entire user base quickly and effectively. This guide will help you through the setup process and the general usage of Parse to send push notifications.

If you haven't installed the SDK yet, please [head over to the Push QuickStart]({{ site.baseUrl }}/parse-server/guide/#push-notifications-quick-start) to get our SDK up and running.

## Installations

### Uploading Installation Data

An installation object represents an instance of your app being installed on a device. These objects are used to store subscription data for installations which have subscribed to one or more push notification channels. Installations have a flexible schema, except that the special fields below have special type and validation requirements:

*   **`badge`**: is a number field representing the last known application badge for iOS installations.
*   **`channels`**: An array of the channels to which a device is currently subscribed.
*   **`timeZone`**: The current time zone where the target device is located. This should be an [IANA time zone identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
*   **`deviceType`**: The type of device, "ios", "android", "winrt", "winphone", or "dotnet"_(readonly)_.
*   **`pushType`**: This field is reserved for directing Parse to the push delivery network to be used. If the device is registered to receive pushes via FCM, this field will be marked "gcm". If this device is not using FCM, and is using Parse's push notification service, it will be blank _(readonly)_.
*   **`installationId`**: Universally Unique Identifier (UUID) for the device used by Parse. It must be unique across all of an app's installations. _(readonly)_.
*   **`deviceToken`**: The Apple or Google generated token used to deliver messages to the APNs or FCM push networks respectively.
*   **`channelUris`**: The Microsoft-generated push URIs for Windows devices.
*   **`appName`**: The display name of the client application to which this installation belongs.
*   **`appVersion`**: The version string of the client application to which this installation belongs.
*   **`parseVersion`**: The version of the Parse SDK which this installation uses.
*   **`appIdentifier`**: A unique identifier for this installation's client application. In iOS, this is the Bundle Identifier.

Most of the time, installation data is modified by push-related methods in the client SDK. For example, calling `subscribeToChannel` or `unsubscribeFromChannel` from the client SDK will create an object for that installation if it doesn't yet exist and update its channels, and calling `getSubscribedChannels` from the client SDK will read subscription data from that installation's object. The REST methods can be used to mimic these operations. For instance, if you have an iOS device token then you can subscribe it to push notifications by creating an installation object for it with the desired `channels` list. You can also perform operations which aren't possible through the client SDK, like using a query over installations to find the set of subscribers to a given channel.

Creating an installation object is similar to creating a generic object, but the special installation fields listed above must pass validation. For example, if you have a device token provided by the Apple Push Notification service and would like to subscribe it to the broadcast channel `""`, you can use the following command:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "deviceType": "ios",
        "deviceToken": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "channels": [
          ""
        ]
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>installations
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>installations', json.dumps({
    "deviceType": "ios",
    "deviceToken": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "channels": [
        ""
    ]
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

When the creation is successful, the HTTP response is a `201 Created` and the `Location` header contains the URL for the new installation:

<pre><code class="javascript">
Status: 201 Created
Location: <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB
</code></pre>

The response body is a JSON object containing the `objectId` and the `createdAt` timestamp of the newly-created installation:

```jsonc
{
  "createdAt": "2022-01-01T12:23:45.678Z",
  "objectId": "mrmBZvsErB"
}
```

When creating Android installation objects containing FCM (Firebase Cloud Messaging) credentials, you must have at least the following fields in your installation object:

*   A `deviceType` set to `android`.
*   A `pushType` set to `gcm`.
*   A FCM registration token in the `deviceToken` field.

You could create and object with these fields using a command like this:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "deviceType": "android",
        "pushType": "gcm",
        "deviceToken": "APA91bFMvbrGg4cp3KUV_7dhU1gmwE_...",
        "channels": [
          ""
        ]
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>installations
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>installations', json.dumps({
    "deviceType": "android",
    "pushType": "gcm",
    "deviceToken": "APA91bFMvbrGg4cp3KUV_7dhU1gmwE_...",
    "channels": [
        ""
    ]
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

### Retrieving Installations

You can retrieve the contents of an installation object by sending a GET request to the URL returned in the location header when it was created. For example, to retrieve the installation created above:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The response body is a JSON object containing all the user-provided fields, plus the `createdAt`, `updatedAt`, and `objectId` fields:

```jsonc
{
  "deviceType": "ios",
  "deviceToken": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "channels": [
    ""
  ],
  "createdAt": "2022-01-01T12:23:45.678Z",
  "updatedAt": "2022-01-01T12:23:45.678Z",
  "objectId": "mrmBZvsErB"
}
```

### Updating Installations

Installation objects can be updated by sending a PUT request to the installation URL. For example, to subscribe the installation above to the "foo" push channel:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "deviceType": "ios",
        "deviceToken": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "channels": [
          "",
          "foo"
        ]
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB', json.dumps({
    "deviceType": "ios",
    "deviceToken": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "channels": [
        "",
        "foo"
    ]
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Note that there is a restriction on updating the `deviceToken` field of Installation objects. You can only update the `deviceToken` field of an Installation object if contains a non-nil `installationId` field.

### Querying Installations

You can retrieve multiple installations at once by sending a GET request to the root installations URL. This functionality is not available in the SDKs, so you must authenticate this method using the `X-Parse-Master-Key` header in your request instead of the `X-Parse-REST-API-Key` header. Your master key allows you to bypass ACLs and should only be used from within a trusted environment.

Without any URL parameters, a GET request simply lists installations:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>installations
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>installations', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The return value is a JSON object that contains a results field with a JSON array that lists the users.

```jsonc
{
  "results": [
    {
      "deviceType": "ios",
      "deviceToken": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "channels": [
        ""
      ],
      "createdAt": "2022-01-01T12:23:45.678Z",
      "updatedAt": "2022-01-01T12:23:45.678Z",
      "objectId": "mrmBZvsErB"
    },
    {
      "deviceType": "ios",
      "deviceToken": "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
      "channels": [
        ""
      ],
      "createdAt": "2022-01-01T12:23:45.678Z",
      "updatedAt": "2022-01-01T12:23:45.678Z",
      "objectId": "sGlvypFQcO"
    }
  ]
}
```

All of the options for queries that work for regular objects also work for installation objects, so check the section on [Querying Objects](#basic-queries) for more details. By doing an array query over `channels`, for example, you can find the set of devices subscribed to a given push channel.


### Deleting Installations

To delete an installation from the Parse Cloud, send a DELETE request to its URL. This functionality is not available in the client SDKs, so you must authenticate this method using the `X-Parse-Master-Key` header in your request instead of the `X-Parse-REST-API-Key` header. Your master key allows you to bypass ACLs and should only be used from within a trusted environment. For example:

<div class="language-toggle">
<pre><code class="bash">
curl -X DELETE \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('DELETE', '<span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Sending Pushes

There are two ways to send push notifications using Parse: [channels](#using-channels) and [advanced targeting](#using-advanced-targeting). Channels offer a simple and easy to use model for sending pushes, while advanced targeting offers a more powerful and flexible model. Both are fully compatible with each other and will be covered in this section.

You can view your past push notifications on the Parse Dashboard push console for up to 30 days after creating your push.  For pushes scheduled in the future, you can delete the push on the push console as long as no sends have happened yet. After you send the push, the push console shows push analytics graphs.

### Using Channels

The simplest way to start sending notifications is using channels. This allows you to use a publisher-subscriber model for sending pushes. Devices start by subscribing to one or more channels, and notifications can later be sent to these subscribers. The channels subscribed to by a given `Installation` are stored in the `channels` field of the `Installation` object.

#### Subscribing to Channels

A channel is identified by a string that starts with a letter and consists of alphanumeric characters, underscores, and dashes. It doesn't need to be explicitly created before it can be used and each `Installation` can subscribe to any number of channels at a time.

Subscribing to a channel via the REST API can be done by updating the `Installation` object. We send a PUT request to the `Installation` URL and update the `channels` field. For example, in a baseball score app, we could do:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "channels": [
          "Giants"
        ]
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB', json.dumps({
    "channels": [
        "Giants"
    ]
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Once subscribed to the "Giants" channel, your `Installation` object should have an updated `channels` field.

<img alt="" data-echo="{{ '/assets/images/installation_channel.png' | prepend: site.baseurl }}"/>

To unsubscribe from a channel you would need to update the `channels` array and remove the unsubscribed channel.

#### Sending Pushes to Channels

With the REST API, the following code can be used to alert all subscribers of the "Giants" and "Mets" channels about the results of the game. This will display a notification center alert to iOS users and a system tray notification to Android users.

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "channels": [
          "Giants",
          "Mets"
        ],
        "data": {
          "alert": "The Giants won against the Mets 2-3."
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "channels": [
        "Giants",
        "Mets"
    ],
    "data": {
        "alert": "The Giants won against the Mets 2-3."
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

### Using Advanced Targeting

While channels are great for many applications, sometimes you need more precision when targeting the recipients of your pushes. Parse allows you to write a query for any subset of your `Installation` objects using the [querying API](#queries) and to send them a push.

Since `Installation` objects are just like any other object stored in Parse, you can save any data you want and even create relationships between `Installation` objects and your other objects. This allows you to send pushes to a very customized and dynamic segment of your user base.

#### Saving Installation Data

Storing arbitrary data on an `Installation` object is done in the same way we store data on [any other object](#objects) on Parse. In our Baseball app, we could allow users to get pushes about game results, scores and injury reports.

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "scores": true,
        "gameResults": true,
        "injuryReports": true
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB', json.dumps({
    "scores": True,
    "gameResults": True,
    "injuryReports": True
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

You can even create relationships between your `Installation` objects and other classes saved on Parse. To associate an Installation with a particular user, for example, you can use a pointer to the `_User` class on the `Installation`.

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "user": {
          "__type": "Pointer",
          "className": "_User",
          "objectId": "vmRZXZ1Dvo"
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>installations/mrmBZvsErB', json.dumps({
    "user": {
        "__type": "Pointer",
        "className": "_User",
        "objectId": "vmRZXZ1Dvo"
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

#### Sending Pushes to Queries

Once you have your data stored on your `Installation` objects, you can use a query to target a subset of these devices. `Installation` queries work just like any other [Parse query](#queries).

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "where": {
          "injuryReports": true
        },
        "data": {
          "alert": "Willie Hayes injured by own pop fly."
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "where": {
        "injuryReports": True
    },
    "data": {
        "alert": "Willie Hayes injured by own pop fly."
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

We can even use channels with our query. To send a push to all subscribers of the "Giants" channel but filtered by those who want score update, we can do the following:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "where": {
          "channels": "Giants",
          "scores": true
        },
        "data": {
          "alert": "The Giants scored a run! The score is now 2-2."
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "where": {
        "channels": "Giants",
        "scores": True
    },
    "data": {
        "alert": "The Giants scored a run! The score is now 2-2."
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

If we store relationships to other objects in our `Installation` class, we can also use those in our query. For example, we could send a push notification to all users near a given location like this.

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "where": {
          "user": {
            "$inQuery": {
              "location": {
                "$nearSphere": {
                  "__type": "GeoPoint",
                  "latitude": 30.0,
                  "longitude": -20.0
                },
                "$maxDistanceInMiles": 1.0
              }
            }
          }
        },
        "data": {
          "alert": "Free hotdogs at the Parse concession stand!"
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "where": {
        "user": {
            "$inQuery": {
                "where": {
                    "location": {
                        "$nearSphere": {
                            "__type": "GeoPoint",
                            "latitude": 51.252437591552734,
                            "longitude": -1.6038470268249512
                        },
                        "$maxDistanceInMiles": 1.0
                    }
                },
                "className": "_User"
            }
        }
    },
    "data": {
        "alert": "Free hotdogs at the Parse concession stand!"
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

An in depth look at the `Installation` end point can be found in the [REST guide](#installations).

## Sending Options

Push notifications can do more than just send a message. In iOS, pushes can also include the sound to be played, the badge number to display as well as any custom data you wish to send. In Android, it is even possible to specify an `Intent` to be fired upon receipt of a notification. An expiration date can also be set for the notification in case it is time sensitive.

### Customizing your Notifications

If you want to send more than just a message, you can set other fields in the `data` dictionary. There are some reserved fields that have a special meaning.

*   **`alert`**: the notification's message.
*   **`badge`**: _(iOS only)_ the value indicated in the top right corner of the app icon. This can be set to a value or to `Increment` in order to increment the current value by 1.
*   **`sound`**: _(iOS only)_ the name of a sound file in the application bundle.
*   **`content-available`**: _(iOS only)_ If you are a writing an app using the Remote Notification Background Mode [introduced in iOS7](https://developer.apple.com/library/ios/releasenotes/General/WhatsNewIniOS/Articles/iOS7.html#//apple_ref/doc/uid/TP40013162-SW10) (a.k.a. "Background Push"), set this value to 1 to trigger a background download. You also have to set `push_type` starting iOS 13 and watchOS 6.
*   **`push_type`**: _(iOS only)_ The type of the notification. The value is `alert` or `background`. Specify `alert` when the delivery of your notification displays an alert, plays a sound, or badges your app's icon. Specify `background` for silent notifications that do not interact with the user. Defaults to `alert` if no value is set. Required when delivering notifications to devices running iOS 13 and later, or watchOS 6 and later.
*   **`priority`**: _(iOS only)_ The priority of the notification. Specify 10 to send the notification immediately. Specify 5 to send the notification based on power considerations on the user’s device. ([More detailed documentation](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns))
*   **`category`**: _(iOS only)_ the identifier of the [`UNNotification​Category`](https://developer.apple.com/reference/usernotifications/unnotificationcategory) for this push notification.
*   **`uri`**: _(Android only)_ an optional field that contains a URI. When the notification is opened, an `Activity` associated      with opening the URI is launched.
*   **`title`**: _(Android only)_ the value displayed in the Android system tray notification.

For example, to send a notification that increases the current badge number by 1 and plays a custom sound for iOS devices, and displays a particular title for Android users, you can do the following:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "channels": [
          "Mets"
        ],
        "data": {
          "alert": "The Mets scored! The game is now tied 1-1.",
          "badge": "Increment",
          "sound": "cheering.caf",
          "title": "Mets Score!"
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "channels": [
        "Mets"
    ],
    "data": {
        "alert": "The Mets scored! The game is now tied 1-1.",
        "badge": "Increment",
        "sound": "cheering.caf",
        "title": "Mets Score!"
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

It is also possible to specify your own data in this dictionary. As explained in the Receiving Notifications section for [iOS]({{ site.baseUrl }}/ios/guide/#receiving-pushes) and [Android]({{ site.baseUrl }}/android/guide/#receiving-pushes), iOS will give you access to this data only when the user opens your app via the notification and Android will provide you this data in the `Intent` if one is specified.

<div class="language-toggle">
<pre><code class="bash">
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "channels": [
        "Indians"
    ],
    "data": {
        "action": "com.example.UPDATE_STATUS",
        "alert": "Ricky Vaughn was injured during the game last night!",
        "name": "Vaughn",
        "newsItem": "Man bites dog"
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

### Setting an Expiration Date

When a user's device is turned off or not connected to the internet, push notifications cannot be delivered. If you have a time sensitive notification that is not worth delivering late, you can set an expiration date. This avoids needlessly alerting users of information that may no longer be relevant.

There are two parameters provided by Parse to allow setting an expiration date for your notification. The first is `expiration_time` which takes a date (in ISO 8601 format or Unix epoch time) specifying when Parse should stop trying to send the notification. To expire the notification exactly 1 week from now, you can use the following command.

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "expiration_time": "2015-03-19T22:05:08Z",
        "data": {
          "alert": "Season tickets on sale until March 19, 2015"
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "expiration_time": "2015-03-19T22:05:08Z",
    "data": {
        "alert": "Season tickets on sale until March 19, 2015"
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Alternatively, you can use the `expiration_interval` parameter to specify a duration of time before your notification expired. This value is relative to the `push_time` parameter used to [schedule notifications](#scheduling-pushes). This means that a push notification scheduled to be sent out in 1 day and an expiration interval of 6 days can be received up to a week from March 16th, 2015.

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "push_time": "2015-03-13T22:05:08Z",
        "expiration_interval": 518400,
        "data": {
          "alert": "Season tickets on sale until March 19, 2015"
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "push_time": "2015-03-13T22:05:08Z",
    "expiration_interval": 518400,
    "data": {
        "alert": "Season tickets on sale until March 19, 2015"
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

### Targeting by Platform

If you build a cross platform app, it is possible you may only want to target iOS or Android devices. There are two methods provided to filter which of these devices are targeted. Note that both platforms are targeted by default.

The following examples would send a different notification to Android, iOS, and Windows users.

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "where": {
          "deviceType": "android"
        },
        "data": {
          "alert": "Your suitcase has been filled with tiny robots!"
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "where": {
        "deviceType": "android"
    },
    "data": {
        "alert": "Your suitcase has been filled with tiny robots!"
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "where": {
          "deviceType": "ios"
        },
        "data": {
          "alert": "Your suitcase has been filled with tiny apples!"
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "where": {
        "deviceType": "ios"
    },
    "data": {
        "alert": "Your suitcase has been filled with tiny apples!"
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "where": {
          "deviceType": "winrt"
        },
        "data": {
          "alert": "Your suitcase has been filled with tiny glass!"
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "where": {
        "deviceType": "winrt"
    },
    "data": {
        "alert": "Your suitcase has been filled with tiny glass!"
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "where": {
          "deviceType": "winphone"
        },
        "data": {
          "alert": "Your suitcase is very hip; very metro."
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "where": {
        "deviceType": "winphone"
    },
    "data": {
        "alert": "Your suitcase is very hip; very metro."
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Scheduling Pushes

You can schedule a push in advance by specifying a `push_time`. For example, if a user schedules a game reminder for a game on March 19th, 2015 at noon UTC, you can schedule the push notification by sending:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "where": {
          "user_id": "user_123"
        },
        "push_time": "2015-03-19T12:00:00Z",
        "data": {
          "alert": "You previously created a reminder for the game today"
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>push', json.dumps({
    "where": {
        "user_id": "user_123"
    },
    "push_time": "2015-03-19T12:00:00Z",
    "data": {
        "alert": "You previously created a reminder for the game today"
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

If you also specify an `expiration_interval`, it will be calculated from the scheduled push time, not from the time the push is submitted.
This means a push scheduled to be sent in a week with an expiration interval of a day will expire 8 days after the request is sent.

The scheduled time cannot be in the past, and can be up to two weeks in the future.
It can be an ISO 8601 date with a date, time, and timezone, as in the example above, or it can be a numeric value representing a UNIX epoch time in seconds (UTC).
To schedule an alert for 08/22/2015 at noon UTC time, you can set the `push_time` to either `2015-08-022T12:00:00.000Z` or `1440226800000`.


### Local Push Scheduling

The `push_time` parameter can schedule a push to be delivered to each device according to its time zone. This technique delivers a push to all `Installation` objects with a `timeZone` member when that time zone would match the push time. For example, if an app had a device in timezone `America/New_York` and another in `America/Los_Angeles`, the first would receive the push three hours before the latter.

To schedule a push according to each device's local time, the `push_time` parameter should be an ISO 8601 date without a time zone, i.e. `2015-03-19T12:00:00`. Note that Installations without a `timeZone` will be excluded from this localized push.

## Localizing Push

Starting parse-server version 2.6.1, it is possible to localize the push notifications messages according to the _Installation's `localeIdentifier`.

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "alert": "The default alert for all languages",
          "alert-fr": "Une alerte en français"
        }
      }' \
  https://api.parse.com/1/push
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('api.parse.com', 443)
connection.connect()
connection.request('POST', '/1/push', json.dumps({
    "data": {
        "alert": "The default alert for all languages",
        "alert-fr": "Une alerte en français"
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

When setting the `alert-[lang|locale]` in the data, parse-server will find all installations that have that language or locale set. The language is usually the first part of the locale. This will have no impact on the query planning, as the localizations will be resolved just before the push is sent.

If a custom localization is found, the `alert` value is replaced by the provided alert and all the localized keys are stripped out of the `data` part of the body.
