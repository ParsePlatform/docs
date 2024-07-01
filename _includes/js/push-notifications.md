# Push Notifications

If you haven't installed the SDK yet, please [head over to the Push QuickStart]({{ site.baseUrl }}/parse-server/guide/#push-notifications-quick-start) to get our SDK up and running.

## Introduction

Push Notifications are a great way to keep your users engaged and informed about your app. You can reach your entire user base quickly and effectively. This guide will help you through the setup process and the general usage of Parse to send push notifications.

<div class='tip info'><div>
The JavaScript SDK does not currently support receiving pushes. It can only be used to send notifications to iOS and Android applications. A common use case is to send pushes from Cloud Code.
</div></div>

## Setting Up Push

There is no setup required to use the JavaScript SDK for sending push notifications. If you haven't configured your [iOS]({{ site.baseUrl }}/ios/guide/#setting-up-push) or [Android]({{ site.baseUrl }}/android/guide/#setting-up-push) clients to use Push, take a look at their respective setup instruction using the platform toggle at the top.

## Installations

Every Parse application installed on a device registered for push notifications has an associated `Installation` object. The `Installation` object is where you store all the data needed to target push notifications. For example, in a baseball app, you could store the teams a user is interested in to send updates about their performance.

Note that `Installation` data can only be modified by the client SDKs, the data browser, or the REST API.

This class has several special fields that help you manage and target devices.

*   **`badge`**: The current value of the icon badge for iOS apps. Changes to this value on the server will be used for future badge-increment push notifications.
*   **`channels`**: An array of the channels to which a device is currently subscribed.
*   **`timeZone`**: The current time zone where the target device is located. This value is synchronized every time an `Installation` object is saved from the device.
*   **`deviceType`**: The type of device, "ios", "android", "winrt", "winphone", or "dotnet"_(readonly)_.
*   **`pushType`**: This field is reserved for directing Parse to the push delivery network to be used. If the device is registered to receive pushes via FCM, this field will be marked "gcm". If this device is not using FCM, and is using Parse's push notification service, it will be blank _(readonly)_.
*   **`installationId`**: Universally Unique Identifier (UUID) for the device used by Parse. It must be unique across all of an app's installations. _(readonly)_.
*   **`deviceToken`**: The Apple or Google generated token used to deliver messages to the APNs or FCM push networks respectively.
*   **`channelUris`**: The Microsoft-generated push URIs for Windows devices.
*   **`appName`**: The display name of the client application to which this installation belongs.
*   **`appVersion`**: The version string of the client application to which this installation belongs.
*   **`parseVersion`**: The version of the Parse SDK which this installation uses.
*   **`appIdentifier`**: A unique identifier for this installation's client application. In iOS, this is the Bundle Identifier.

## Sending Pushes

There are two ways to send push notifications using Parse: [channels](#using-channels) and [advanced targeting](#using-advanced-targeting). Channels offer a simple and easy to use model for sending pushes, while advanced targeting offers a more powerful and flexible model. Both are fully compatible with each other and will be covered in this section.

Sending notifications is often done from the Parse Dashboard push console, the [REST API](#sending-pushes) or from [Cloud Code](#sending-pushes). Since the JavaScript SDK is used in Cloud Code, this is the place to start if you want to send pushes from your Cloud Functions. However, if you decide to send notifications from the JavaScript SDK outside of Cloud Code or any of the other client SDKs, you will need to set    **Client Push Enabled** in the Push Notifications settings of your Parse app.

However, be sure you understand that enabling Client Push can lead to a security vulnerability in your app. We recommend that you enable Client Push for testing purposes only, and move your push notification logic into Cloud Code when your app is ready to go into production.

<img alt="" data-echo="{{ '/assets/images/client_push_settings.png' | prepend: site.baseurl }}"/>

You can view your past push notifications on the Parse Dashboard push console for up to 30 days after creating your push.  For pushes scheduled in the future, you can delete the push on the push console as long as no sends have happened yet.

After you send the push, the push console shows push analytics graphs.

### Using Channels

The simplest way to start sending notifications is using channels. This allows you to use a publisher-subscriber model for sending pushes. Devices start by subscribing to one or more channels, and notifications can later be sent to these subscribers. The channels subscribed to by a given `Installation` are stored in the `channels` field of the `Installation` object.

#### Subscribing to Channels

The JavaScript SDK does not currently support subscribing iOS and Android devices for pushes. Take a look at the [iOS]({{ site.baseUrl }}/ios/guide/#using-channels), [Android]({{ site.baseUrl }}/android/guide/#using-channels) or [REST]({{ site.baseUrl }}/rest/guide/#using-channels) Push guide using the platform toggle at the top.

#### Sending Pushes to Channels

With the JavaScript SDK, the following code can be used to alert all subscribers of the "Giants" and "Mets" channels about the results of the game. This will display a notification center alert to iOS users and a system tray notification to Android users.

```javascript
Parse.Push.send({
  channels: [ "Giants", "Mets" ],
  data: {
    alert: "The Giants won against the Mets 2-3."
  }
})
.then(function() {
  // Push was successful
}, function(error) {
  // Handle error
});
```


### Using Advanced Targeting

While channels are great for many applications, sometimes you need more precision when targeting the recipients of your pushes. Parse allows you to write a query for any subset of your `Installation` objects using the [querying API](#queries) and to send them a push.

Since `Installation` objects are just like any other object stored in Parse, you can save any data you want and even create relationships between `Installation` objects and your other objects. This allows you to send pushes to a very customized and dynamic segment of your user base.

#### Saving Installation Data

The JavaScript SDK does not currently support modifying `Installation` objects. Take a look at the [iOS]({{ site.baseUrl }}/ios/guide/#installations), [Android]({{ site.baseUrl }}/android/guide/#installations) or [REST]({{ site.baseUrl }}/rest/guide/#installations) Push guide for more on this topic.

#### Sending Pushes to Queries

Once you have your data stored on your `Installation` objects, you can use a query to target a subset of these devices. `Parse.Installation` queries work just like any other [Parse query](#queries).

```javascript
const query = new Parse.Query(Parse.Installation);
query.equalTo('injuryReports', true);

Parse.Push.send({
  where: query, // Set our Installation query
  data: {
    alert: "Willie Hayes injured by own pop fly."
  }
})
.then(function() {
  // Push was successful
}, function(error) {
  // Handle error
});
```

We can even use channels with our query. To send a push to all subscribers of the "Giants" channel but filtered by those who want score update, we can do the following:

```javascript
const query = new Parse.Query(Parse.Installation);
query.equalTo('channels', 'Giants'); // Set our channel
query.equalTo('scores', true);

Parse.Push.send({
  where: query,
  data: {
    alert: "Giants scored against the A's! It's now 2-2."
  }
})
.then(function() {
  // Push was successful
}, function(error) {
  // Handle error
});
```

If we store relationships to other objects in our `Installation` class, we can also use those in our query. For example, we could send a push notification to all users near a given location like this.

```javascript
// Find users near a given location
const userQuery = new Parse.Query(Parse.User);
userQuery.withinMiles("location", stadiumLocation, 1.0);

// Find devices associated with these users
const pushQuery = new Parse.Query(Parse.Installation);
pushQuery.matchesQuery('user', userQuery);

// Send push notification to query
Parse.Push.send({
  where: pushQuery,
  data: {
    alert: "Free hotdogs at the Parse concession stand!"
  }
})
.then(function() {
  // Push was successful
}, function(error) {
  // Handle error
});
```

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

```javascript
Parse.Push.send({
  channels: [ "Mets" ],
  data: {
    alert: "The Mets scored! The game is now tied 1-1.",
    badge: "Increment",
    sound: "cheering.caf",
    title: "Mets Score!"
  }
})
.then(function() {
  // Push was successful
}, function(error) {
  // Handle error
});
```

It is also possible to specify your own data in this dictionary. As explained in the Receiving Notifications section for [iOS]({{ site.baseUrl }}/ios/guide/#receiving-pushes) and [Android]({{ site.baseUrl }}/android/guide/#receiving-pushes), iOS will give you access to this data only when the user opens your app via the notification and Android will provide you this data in the `Intent` if one is specified.

```javascript
const query = new Parse.Query(Parse.Installation);
query.equalTo('channels', 'Indians');
query.equalTo('injuryReports', true);

Parse.Push.send({
  where: query,
  data: {
    action: "com.example.UPDATE_STATUS"
    alert: "Ricky Vaughn was injured in last night's game!",
    name: "Vaughn",
    newsItem: "Man bites dog"
  }
})
.then(function() {
  // Push was successful
}, function(error) {
  // Handle error
});
```

### Setting an Expiration Date

When a user's device is turned off or not connected to the internet, push notifications cannot be delivered. If you have a time sensitive notification that is not worth delivering late, you can set an expiration date. This avoids needlessly alerting users of information that may no longer be relevant.

There are two parameters provided by Parse to allow setting an expiration date for your notification. The first is `expiration_time` which takes a `Date` specifying when Parse should stop trying to send the notification. To expire the notification exactly 1 week from now, you can use the following:

```javascript
const oneWeekAway = new Date(...);

Parse.Push.send({
  where: everyoneQuery,
  expiration_time: oneWeekAway,
  data: {
    alert: "Season tickets on sale until next week!"
  }
})
.then(function() {
  // Push was successful
}, function(error) {
  // Handle error
});
```

Alternatively, you can use the `expiration_interval` parameter to specify a duration of time before your notification expires. This value is relative to the `push_time` parameter used to [schedule notifications](#scheduling-pushes). This means that a push notification scheduled to be sent out in 1 day and an expiration interval of 6 days can be received up to a week from now.

```javascript
const oneDayAway = new Date(...);
const sixDaysAwayEpoch = (new Date(...)).getTime();

Parse.Push.send({
  push_time: oneDayAway,
  expiration_interval: sixDaysAwayEpoch,
  data: {
    alert: "Season tickets on sale until next week!"
  }
})
.then(function() {
  // Push was successful
}, function(error) {
  // Handle error
});
```

### Targeting by Platform

If you build a cross platform app, it is possible you may only want to target iOS or Android devices. There are two methods provided to filter which of these devices are targeted. Note that both platforms are targeted by default.

The following examples would send a different notification to Android and iOS users.

```javascript
// Notification for Android users
const queryAndroid = new Parse.Query(Parse.Installation);
queryAndroid.equalTo('deviceType', 'android');

Parse.Push.send({
  where: queryAndroid,
  data: {
    alert: "Your suitcase has been filled with tiny robots!"
  }
});

// Notification for iOS users
const queryIOS = new Parse.Query(Parse.Installation);
queryIOS.equalTo('deviceType', 'ios');

Parse.Push.send({
  where: queryIOS,
  data: {
    alert: "Your suitcase has been filled with tiny apples!"
  }
});

// Notification for Windows 8 users
const queryWindows = new Parse.Query(Parse.Installation);
queryWindows.equalTo('deviceType', 'winrt');

Parse.Push.send({
  where: queryWindows,
  data: {
    alert: "Your suitcase has been filled with tiny glass!"
  }
});

// Notification for Windows Phone 8 users
const queryWindowsPhone = new Parse.Query(Parse.Installation);
queryWindowsPhone.equalTo('deviceType', 'winphone');

Parse.Push.send({
  where: queryWindowsPhone,
  data: {
    alert: "Your suitcase is very hip; very metro."
  }
});
```

## Scheduling Pushes

You can schedule a push in advance by specifying a `push_time`. For example, if a user schedules a game reminder for a game tomorrow at noon UTC, you can schedule the push notification by sending:

```javascript
const tomorrowDate = new Date(...);

const query = new Parse.Query(Parse.Installation);
query.equalTo('user', user);

Parse.Push.send({
  where: query,
  data: {
    alert: "You previously created a reminder for the game today"
  },
  push_time: tomorrowDate
})
.then(function() {
  // Push was successful
}, function(error) {
  // Handle error
});
```

If you also specify an `expiration_interval`, it will be calculated from the scheduled push time, not from the time the push is submitted. This means a push scheduled to be sent in a week with an expiration interval of a day will expire 8 days after the request is sent.

The scheduled time cannot be in the past, and can be up to two weeks in the future. It can be an ISO 8601 date with a date, time, and timezone, as in the example above, or it can be a numeric value representing a UNIX epoch time in seconds (UTC). To schedule an alert for 08/22/2015 at noon UTC time, you can set the `push_time` to either `2015-08-022T12:00:00` or `1440226800`.

## Receiving Pushes

The JavaScript SDK does not currently support receiving pushes. To learn more about handling received notifications in [iOS]({{ site.baseUrl }}/ios/guide/#scheduling-pushes) or [Android]({{ site.baseUrl }}/android/guide/#scheduling-pushes), use the platform toggle at the top.

## Troubleshooting

For tips on troubleshooting push notifications, check the troubleshooting sections for [iOS]({{ site.baseUrl }}/ios/guide/#troubleshooting), [Android]({{ site.baseUrl }}/android/guide/#troubleshooting), and [.NET]({{ site.baseUrl }}/dotnet/guide/#troubleshooting) using the platform toggle at the top.
