# Push Notifications

Parse Server provides basic push notification functionality for iOS, macOS, tvOS and Android. With this feature, you can:

* Target installations by platform
* Target installations by a `ParseQuery`
* Send push notifications to Android devices through [Firebase Cloud Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging/)
* Send push notifications to iOS, tvOS and macOS devices through [Apple Push Notification Service (APNS)](https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/APNSOverview.html#//apple_ref/doc/uid/TP40008194-CH8-SW1)
* Use most of the sending options

However, there are a few caveats:

* Does not support super high throughput since it does not employ a job queue system
* Client push is not supported. You can only use `masterKey` to send push notifications
* Delivery reports are not supported
* Scheduled push is not supported

## API
We support most of the sending options. Check the detailed doc [here]({{ site.baseUrl }}/rest/guide/#sending-options). Parse Server supports the following:

* `channels` to target installations by channels
* `where` to target installations by `ParseQuery`
* `priority` under `data` for iOS push priority
* `push_type` under `data` for iOS push type
* `alert` under `data` for notification message
*  number `badge` under `data` for iOS badge number
* `sound` under `data` for iOS sound
* `content-available` under `data` for iOS background job
* `category` under `data` for iOS category
* `title ` under `data` for Android notification title
* `uri ` under `data` for Android notification launched URI
* custom data under `data` for ios and Android
* Increment `badge` under `data` for iOS and Android badge number

Here is the list of sending options we do not support yet:
* `push_time` for scheduled push


## Push Notifications Quick Start

### 1. Prepare APNS and FCM Credentials

You will need to obtain some credentials from FCM and APNS in order to send push notifications.

#### APNS (iOS)

If you are setting up push notifications on iOS, tvOS or macOS for the first time, we recommend you visit the [raywenderlich.com's Push Notifications tutorial](https://www.raywenderlich.com/11395893-push-notifications-tutorial-getting-started) or [appcoda.com's iOS Push tutorial](https://www.appcoda.com/push-notification-ios/) to help you obtain a production Apple Push Certificate. Parse Server supports the PFX (`.p12`) file exported from Keychain Access. Parse Server also supports the push certificate and key in `.pem` format. Token-based authentication instead of a certificate is supported as well.

#### FCM (Android)

To get your FCM API key, go to the [Firebase console](https://console.developers.google.com/apis/credentials) and navigate to the project. Navigate to the settings of the project, and within the "Cloud Messaging" tab, you will find it, labeled "Server key"

### 2. Configure Parse Server

When initializing Parse Server, you should pass an additional push configuration. For example

```js
var server = new ParseServer({
  databaseURI: '...',
  cloud: '...',
  appId: '...',
  masterKey: '...',
  push: {
    android: {
      apiKey: '...'
    },
    ios: {
      pfx: '/file/path/to/XXX.p12',
      passphrase: '', // optional password to your p12/PFX
      bundleId: '',
      production: false
    }
  }
});
```

The configuration format is

```js
push: {
  android: {
    apiKey: '' // The Server API Key of FCM
  },
  ios: {
    pfx: '', // The filename of private key and certificate in PFX or PKCS12 format from disk  
    passphrase: '', // optional password to your p12
    cert: '', // If not using the .p12 format, the path to the certificate PEM to load from disk
    key: '', // If not using the .p12 format, the path to the private key PEM to load from disk
    bundleId: '', // The bundle identifier associated with your app
    production: false // Specifies which APNS environment to connect to: Production (if true) or Sandbox
  }
}
```

For iOS, if you would like to use token-based authentication instead of certificates, you should use the following configuration format

```js
push: {
  ios: {
    token: {
      key: '/file/path/to/AuthKey_XXXXXXXXXX.p8',
      keyId: "XXXXXXXXXX",
      teamId: "YYYYYYYYYY" // The Team ID for your developer account
    },
    topic: 'com.domain.appname', // The bundle identifier associated with your app
    production: false
  }
}
```

If you would like to support both the dev and prod certificates, you can provide an array of configurations like

```js
push: {
  ios: [
    {
      pfx: '', // Dev PFX or P12
      bundleId: '',
      production: false // Dev
    },
    {
      pfx: '', // Prod PFX or P12
      bundleId: '',  
      production: true // Prod
    }
  ],
  tvos: [
    // ...
  ],
  osx: [
    // ...
  ]
}
```

The configuration for macOS and tvOS works exactly as for iOS. Just add an additional configuration for each platform under the appropriate key. Please note the key for macOS is `osx` and for tvOS is `tvos`. If you need to support both the dev and prod certificates, you can do that for all Apple platforms like described above.

```js
var server = new ParseServer({
  databaseURI: '...',
  cloud: '...',
  appId: '...',
  masterKey: '...',
  push: {
    android: {
      apiKey: '...'
    },
    ios: {
      pfx: '/file/path/to/XXX.p12',
      passphrase: '', // optional password to your p12/PFX
      bundleId: '',
      production: false
    },
    osx: {
      pfx: '/file/path/to/XXX.p12',
      passphrase: '', // optional password to your p12/PFX
      bundleId: '',
      production: false
    },
    tvos: {
      pfx: '/file/path/to/XXX.p12',
      passphrase: '', // optional password to your p12/PFX
      bundleId: '',
      production: false
    }
  }
});
```

If you have a list of certificates, Parse Server's strategy on choosing them is trying to match `installations`' `appIdentifier` with `bundleId` first. If it can find some valid certificates, it will use those certificates to establish the connection to APNS and send notifications. If it can not find, it will try to send the notifications with all certificates. Prod certificates first, then dev certificates.

### 3. Configure Client Apps

Configure an app which connects to Parse Server. We have provided a detailed [list of steps to configure your iOS and Android clients](#configuring-your-clients-to-receive-push-notifications).

### 4. Send Push Notifications

Currently Parse Server only supports sending push notifications by your `masterKey`. The easiest way to do that is to curl:

```curl
curl -X POST \
  -H "X-Parse-Application-Id: you_app_id" \
  -H "X-Parse-Master-Key: your_master_key" \
  -H "Content-Type: application/json" \
  -d '{
        "where": {
          "deviceType": {
            "$in": [
              "ios",
              "android"
            ]
          }
        },
        "data": {
          "title": "The Shining",
          "alert": "All work and no play makes Jack a dull boy."
        }
      }'\   http://your_server_address/parse/push
```

Push notifications can also be sent from cloud code:

```js
// With promises
Parse.Push.send({
  where: { ... },
  data: { ... }
}, { useMasterKey: true })
.then(function() {
  // Push sent!
}, function(error) {
  // There was a problem :(
});

// With Legacy Backbone callbacks
Parse.Push.send({
  where: query,
  data: {
    alert: 'Test',
    badge: 1,
    sound: 'default'
  }
}, {
  useMasterKey: true,
  success: function() {
    // Push sent!
  },
  error: function(error) {
    // There was a problem :(
  }
});
```

After sending this to your Parse Server, you should see the push notifications show up on your devices.

**Note:** The iOS simulator cannot receive push notifications. You must run iOS apps on an iOS device.

In your Parse Server logs, you can see something similar to

```jsonc
// FCM request and response
{
  "request": {
    "params": {
      "priority": "normal",
      "data": {
        "time": "2022-01-01T12:23:45.678Z",
        "push_id": "NTDgWw7kp8",
        "data": "{\"alert\":\"All work and no play makes Jack a dull boy.\"}"
      }
    }
  },
  "response": {
    "multicast_id": 5318039027588186000,
    "success": 1,
    "failure": 0,
    "canonical_ids": 0,
    "results": [
      {
        "registration_id": "APA91bEdLpZnXT76vpkvkD7uWXEAgfrZgkiH_ybkzXqhaNcRw1KHOY0s9GUKNgneGxe2PqJ5Swk1-Vf852kpHAP0Mhoj5wd1MVXpRsRr_3KTQo_dkNd_5wcQ__yWnWLxbeM3kg_JziJK",
        "message_id": "0:1455074519347821%df0f8ea7f9fd7ecd"
      }
    ]
  }
}
```

```sh
APNS Connected
APNS Notification transmitted to:7a7d2864598e1f65e6e02135245b7daf8ea510514e6376f072dc29d53facaa41
```

These logs mean that the FCM and APNS connections are working.

## Push Adapter

Parse Server provides a `PushAdapter` which abstracts the way we actually send push notifications. The default implementation is `ParsePushAdapter`, which uses FCM for Android push and APNS for iOS push. However, if you want to use other push providers, you can implement your own `PushAdapter`. Your adapter needs to implement `send(data, installations)`, which is used for sending data to the installations. You can use `ParsePushAdapter` as a reference. After you implement your `PushAdapter`, you can pass that instance to Parse Server like this

```js
var server = new ParseServer({
  databaseURI: '...',
  cloud: '...',
  appId: '...',
  masterKey: '...',
  push: {
    adapter: your_adapter
  }
});
```

By doing this, after Parse Server decodes the push API request and runs the installation query, your `PushAdapter`'s `send(data, installations)` will be called and is responsible for sending the notifications. If you provide your custom `PushAdapter`, the default `ParsePushAdapter` will be ignored.

## Future Improvements

The current solution provides a good starting point for push notifications. We have a lot of ideas to improve the feature:

* Support more platforms
* Support more sending options
* Support more push providers
* Support scheduled pushes
* Support delivery report and error handling
* Support job queue and benchmarking

If you're interested in any of these features, [don't hesitate to jump in and send a PR to the repo](https://github.com/parse-server-modules/parse-server-push-adapter). We would love to work with you!

## Notes

### Silent Notifications

If you are seeing situations where silent notifications are failing to deliver, please ensure that your payload is setting the `content-available` attribute to Int(1) (or just 1 as in javascript) and not "1". This value will be explicitly checked.

When sending a push notification to APNs you also have to set `push_type` to `background` for delivering silent notifications to devices running iOS 13 and later, or watchOS 6 or later.

### PPNS

* [PPNS Protocol Specification (for Parse IoT devices)](https://github.com/parse-community/parse-server/wiki/PPNS-Protocol-Specification)
