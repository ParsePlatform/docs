# Push Notifications

Push notifications are a great way to keep your users engaged and informed about your app. You can reach your entire user base quickly and effectively. This guide will help you through the setup process and the general usage of Parse to send push notifications.

If you haven't installed the SDK yet, [head over to the Push QuickStart]({{ site.baseUrl }}/parse-server/guide/#push-notifications-quick-start) to get our SDK up and running.

## Setting Up Push

If you want to start using push, start by completing the [Android Push Notifications QuickStart Guide]({{ site.baseUrl }}/parse-server/guide/#push-notifications-quick-start) to learn how to configure your app and send your first push notification. Come back to this guide afterwards to learn more about the push features offered by Parse.

The Parse library provides push notifications using Firebase Cloud Messaging (FCM) if Google Play Services are available. Learn more about Google Play Services [here](https://firebase.google.com/docs/cloud-messaging/).

## Installations

Every Parse application installed on a device registered for push notifications has an associated `Installation` object. The `Installation` object is where you store all the data needed to target push notifications. For example, in a baseball app, you could store the teams a user is interested in to send updates about their performance. Saving the `Installation` object is also required for tracking push-related app open events.

In Android, `Installation` objects are available through the `ParseInstallation` class, a subclass of `ParseObject`. It uses the [same API](#objects) for storing and retrieving data. To access the current `Installation` object from your Android app, use the `ParseInstallation.getCurrentInstallation()` method. The first time you save a `ParseInstallation`, Parse will add it to your `Installation` class and it will be available for targeting push notifications.

```java
// Save the current Installation to Parse.
ParseInstallation.getCurrentInstallation().saveInBackground();
```

While it is possible to modify a `ParseInstallation` just like you would a `ParseObject`, there are several special fields that help manage and target devices.

*   **`channels`**: An array of the channels to which a device is currently subscribed.
*   **`installationId`**: Unique Id for the device used by Parse _(readonly)_.
*   **`deviceType`**: The type of device, "ios", "osx", "android", "winrt", "winphone", "dotnet", or "embedded". On Android devices, this field will be set to "android" _(readonly)_.
*   **`pushType`**: This field is reserved for directing Parse to the push delivery network to be used. If the device is registered to receive pushes via FCM, this field will be marked "gcm". If Google Play Services is not available, it will be blank _(readonly)_.
*   **`deviceToken`**: The token used by FCM to keep track of registration ID. On iOS devices, this is a generated token _(readonly)_.
*   **`appName`**: The display name of the client application to which this installation belongs. This value is synchronized every time a `ParseInstallation` object is saved from the device  _(readonly)_.
*   **`appVersion`**: The version string of the client application to which this installation belongs. This value is synchronized every time a `ParseInstallation` object is saved from the device  _(readonly)_.
*   **`parseVersion`**: The version of the Parse SDK which this installation uses. This value is synchronized every time a `ParseInstallation` object is saved from the device  _(readonly)_.
*   **`timeZone`**: The current time zone where the target device is located. This value is synchronized every time a `ParseInstallation` object is saved from the device _(readonly)_.
*   **`localeIdentifier`**: The locale identifier of the device in the format [language code]-[COUNTRY CODE]. The language codes are two-letter lowercase ISO language codes (such as "en") as defined by [ISO 639-1](http://en.wikipedia.org/wiki/ISO_639-1). The country codes are two-letter uppercase ISO country codes (such as "US") as defined by [ISO 3166-1](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3). This value is synchronized every time a `ParseInstallation` object is saved from the device _(readonly)_.
*   **`badge`**: The current value of the icon badge for iOS apps. Changes to this value on the server will be used for future badge-increment push notifications.
*   **`channelUris`**: The Microsoft-generated push URIs for Windows devices _(readonly)_.
*   **`appIdentifier`**: A unique identifier for this installation's client application. This parameter is not supported in Android _(readonly)_.

The Parse Android SDK will avoid making unnecessary requests. If a `ParseInstallation` is saved on the device, a request to the Parse servers will only be made if one of the `ParseInstallation`'s fields has been explicitly updated.

## Sending Pushes

There are two ways to send push notifications using Parse: [channels](#using-channels) and [advanced targeting](#using-advanced-targeting). Channels offer a simple and easy to use model for sending pushes, while advanced targeting offers a more powerful and flexible model. Both are fully compatible with each other and will be covered in this section.

Sending notifications is often done from the Parse Dashboard push console, the [REST API]({{ site.baseUrl }}/rest/guide/#sending-pushes) or from [Cloud Code]({{ site.baseUrl }}/js/guide/#sending-pushes). However, push notifications can also be triggered by the existing client SDKs. If you decide to send notifications from the client SDKs, you will need to set **Client Push Enabled** in the Push Notifications settings of your Parse app.

However, be sure you understand that enabling Client Push can lead to a security vulnerability in your app.  We recommend that you enable Client Push for testing purposes only, and move your push notification logic into Cloud Code when your app is ready to go into production.

<img alt="" data-echo="{{ '/assets/images/client_push_settings.png' | prepend: site.baseurl }}"/>

You can view your past push notifications on the Parse Dashboard push console for up to 30 days after creating your push. For pushes scheduled in the future, you can delete the push on the push console as long as no sends have happened yet. After you send the push, the push console shows push analytics graphs.

### Using Channels

The simplest way to start sending notifications is using channels. This allows you to use a publisher-subscriber model for sending pushes. Devices start by subscribing to one or more channels, and notifications can later be sent to these subscribers. The channels subscribed to by a given `Installation` are stored in the `channels` field of the `Installation` object.

#### Subscribing to Channels

A channel is identified by a string that starts with a letter and consists of alphanumeric characters, underscores, and dashes. It doesn't need to be explicitly created before it can be used and each `Installation` can subscribe to any number of channels at a time.

Subscribing to a channel can be done using a single method call. For example, in a baseball score app, we could do:

```java
// When users indicate they are Giants fans, we subscribe them to that channel.
ParsePush.subscribeInBackground("Giants");
```

By default, the main activity for your app will be run when a user responds to notifications.

Once subscribed to the "Giants" channel, your `Installation` object should have an updated `channels` field.

<img alt="" data-echo="{{ '/assets/images/installation_channel.png' | prepend: site.baseurl }}"/>

Unsubscribing from a channel is just as easy:

```java
// When users indicate they are no longer Giants fans, we unsubscribe them.
ParsePush.unsubscribeInBackground("Giants");
```

You can also get the set of channels that the current device is subscribed to using:

```java
List<String> subscribedChannels = ParseInstallation.getCurrentInstallation().getList("channels");
```

Neither the subscribe method nor the unsubscribe method blocks the thread it is called from. The subscription information is cached on the device's disk if the network is inaccessible and transmitted to your Parse Server as soon as the network is usable. This means you don't have to worry about threading or callbacks while managing subscriptions.

#### Sending Pushes to Channels

In the Android SDK, the following code can be used to alert all subscribers of the "Giants" channel that their favorite team just scored. This will display a notification center alert to iOS users and a system tray notification to Android users.

```java
ParsePush push = new ParsePush();
push.setChannel("Giants");
push.setMessage("The Giants just scored! It's now 2-2 against the Mets.");
push.sendInBackground();
```

If you want to target multiple channels with a single push notification, you can use a `LinkedList` of channels.

```java
LinkedList<String> channels = new LinkedList<String>();
channels.add("Giants");
channels.add("Mets");

ParsePush push = new ParsePush();
push.setChannels(channels); // Notice we use setChannels not setChannel
push.setMessage("The Giants won against the Mets 2-3.");
push.sendInBackground();
```

### Using Advanced Targeting

While channels are great for many applications, sometimes you need more precision when targeting the recipients of your pushes. Parse allows you to write a query for any subset of your `Installation` objects using the [querying API](#queries) and to send them a push.

Since `ParseInstallation` is a subclass of `ParseObject`, you can save any data you want and even create relationships between `Installation` objects and your other objects. This allows you to send pushes to a very customized and dynamic segment of your user base.

#### Saving Installation Data

Storing data on a `ParseInstallation` object is just as easy as storing [any other data](#objects) on Parse. In our Baseball app, we could allow users to get pushes about game results, scores and injury reports.

```java
// Store app language and version
ParseInstallation installation = ParseInstallation.getCurrentInstallation();
installation.put("scores",true);
installation.put("gameResults",true);
installation.put("injuryReports",true);
installation.saveInBackground();
```

You can even create relationships between your `Installation` objects and other classes saved on Parse. To associate a `ParseInstallation` with a particular user, for example, you can simply store the current user on the `ParseInstallation`.

```java
// Associate the device with a user
ParseInstallation installation = ParseInstallation.getCurrentInstallation();
installation.put("user",ParseUser.getCurrentUser());
installation.saveInBackground();
```

#### Sending Pushes to Queries

Once you have your data stored on your `ParseInstallation` objects, you can use a `ParseQuery` to target a subset of these devices. `ParseInstallation` queries work just like any other [Parse query](#queries), but we use the special static method `ParseInstallation.getQuery()` to create it. We set this query on our `ParsePush` object, before sending the notification.

```java
// Create our Installation query
ParseQuery pushQuery = ParseInstallation.getQuery();
pushQuery.whereEqualTo("injuryReports", true);

// Send push notification to query
ParsePush push = new ParsePush();
push.setQuery(pushQuery); // Set our Installation query
push.setMessage("Willie Hayes injured by own pop fly.");
push.sendInBackground();
```

We can even use channels with our query. To send a push to all subscribers of the "Giants" channel but filtered by those who want score update, we can do the following:

```java
// Create our Installation query
ParseQuery pushQuery = ParseInstallation.getQuery();
pushQuery.whereEqualTo("channels", "Giants"); // Set the channel
pushQuery.whereEqualTo("scores", true);

// Send push notification to query
ParsePush push = new ParsePush();
push.setQuery(pushQuery);
push.setMessage("Giants scored against the A's! It's now 2-2.");
push.sendInBackground();
```

If we store relationships to other objects in our `ParseInstallation` class, we can also use those in our query. For example, we could send a push notification to all users near a given location like this.

```java
// Find users near a given location
ParseQuery userQuery = ParseUser.getQuery();
userQuery.whereWithinMiles("location", stadiumLocation, 1.0)

// Find devices associated with these users
ParseQuery pushQuery = ParseInstallation.getQuery();
pushQuery.whereMatchesQuery("user", userQuery);

// Send push notification to query
ParsePush push = new ParsePush();
push.setQuery(pushQuery); // Set our Installation query
push.setMessage("Free hotdogs at the Parse concession stand!");
push.sendInBackground();
```

## Sending Options

Push notifications can do more than just send a message. In Android, pushes can also include custom data you wish to send. You have complete control of how you handle the data included in your push notification as we will see in the [Receiving Notifications](#receiving-pushes) section. An expiration date can also be set for the notification in case it is time sensitive.

### Customizing your Notifications

If you want to send more than just a message, you will need to use a `JSONObject` to package all of the data. There are some reserved fields that have a special meaning in Android.

*   **`alert`**: the notification's message.
*   **`uri`**: _(Android only)_ an optional field that contains a URI. When the notification is opened, an `Activity` associated with opening the URI is launched.
*   **`title`**: _(Android, Windows 8, & Windows Phone 8 only)_ the value displayed in the Android system tray or Windows 8 toast notification.

For example, to send a notification that would increases the badge number by 1 and plays a custom sound, you can do the following. Note that you can set these properties from your Android client, but they would only take effect in the iOS version of your app. The badge and sound fields would have no effects for Android recipients.

```java
JSONObject data = new JSONObject("{\"alert\": \"The Mets scored!\",
                                   \"badge\": \"Increment\",
                                   \"sound\": \"cheering.caf\"}");

ParsePush push = new ParsePush();
push.setChannel("Mets");
push.setData(data);
push.sendPushInBackground();
```

It is also possible to specify your own data in this dictionary. As we'll see in the [Receiving Notifications](#receiving-pushes) section, you're able to use the data sent with your push to do custom processing when  a user receives and interacts with a notification.

```java
JSONObject data = new JSONObject("{\"name\": \"Vaughn\",
                                   \"newsItem\": \"Man bites dog\"}"));

ParsePush push = new ParsePush();
push.setQuery(injuryReportsQuery);
push.setChannel("Indians");
push.setData(data);
push.sendPushInBackground();
```

### Setting an Expiration Date

When a user's device is turned off or not connected to the internet, push notifications cannot be delivered. If you have a time sensitive notification that is not worth delivering late, you can set an expiration date. This avoids needlessly alerting users of information that may no longer be relevant.

There are two methods provided by the `ParsePush` class to allow setting an expiration date for your notification. The first is `setExpirationTime` which simply takes an `time` (in UNIX epoch time) specifying when Parse should stop trying to send the notification.

```java
// Send push notification with expiration date
ParsePush push = new ParsePush();
push.setExpirationTime(1424841505);
push.setQuery(everyoneQuery);
push.setMessage("Season tickets on sale until February 25th");
push.sendPushInBackground();
```

There is however a caveat with this method. Since device clocks are not guaranteed to be accurate, you may end up with inaccurate results. For this reason, the `ParsePush` class also provides the `setExpirationTimeInterval` method which accepts a `timeInterval` (in seconds). The notification will expire after the specified interval has elapsed.

```java
// Create time interval
long weekInterval = 60*60*24*7; // 1 week

// Send push notification with expiration interval
ParsePush push = new ParsePush();
push.setExpirationTimeInterval(weekInterval);
push.setQuery(everyoneQuery);
push.setMessage("Season tickets on sale until next week!");
push.sendPushInBackground();
```

### Targeting by Platform

If you build a cross platform app, it is possible you may only want to target devices of a particular operating system. Advanced Targeting allow you to filter which of these devices are targeted.

The following example would send a different notification to Android, iOS, and Windows users.

```java
ParseQuery query = ParseInstallation.getQuery();
query.whereEqualTo("channels", "suitcaseOwners");

// Notification for Android users
query.whereEqualTo("deviceType", "android");
ParsePush androidPush = new ParsePush();
androidPush.setMessage("Your suitcase has been filled with tiny robots!");
androidPush.setQuery(query);
androidPush.sendPushInBackground();

// Notification for iOS users
query.whereEqualTo("deviceType", "ios");
ParsePush iOSPush = new ParsePush();
iOSPush.setMessage("Your suitcase has been filled with tiny apples!");
iOSPush.setQuery(query);
iOSPush.sendPushInBackground();

// Notification for Windows 8 users
query.whereEqualTo("deviceType", "winrt");
ParsePush winPush = new ParsePush();
winPush.setMessage("Your suitcase has been filled with tiny glass!");
winPush.setQuery(query);
winPush.sendPushInBackground();

// Notification for Windows Phone 8 users
query.whereEqualTo("deviceType", "winphone");
ParsePush wpPush = new ParsePush();
wpPush.setMessage("Your suitcase is very hip; very metro.");
wpPush.setQuery(query);
wpPush.sendPushInBackground();
```

## Scheduling Pushes

You can schedule a push in advance by specifying a push time with `ParsePush.setPushTime(long)`. For example, if a user schedules a game reminder for a game tomorrow at noon UTC, you can schedule the push notification by sending:

```java
long tomorrowTime = ...; // in seconds

// Send push notification with expiration interval
ParsePush push = new ParsePush();
push.setPushTime(tomorrowTime);
push.setMessage("You previously created a reminder for the game today");
push.sendPushInBackground();
```

If you also specify an expiration interval, it will be calculated from the scheduled push time, not from the time the push is submitted. This means a push scheduled to be sent in a week with an expiration interval of a day will expire 8 days after the request is sent.

The scheduled time cannot be in the past, and can be up to two weeks in the future.

## Receiving Pushes

Make sure you've gone through the [Android Push QuickStart]({{ site.baseUrl }}/parse-server/guide/#push-notifications-quick-start) to set up your app to receive pushes.

When a push notification is received, the “title” is displayed in the status bar and the “alert” is displayed alongside the “title” when the user expands the notification drawer. If you choose to subclass `com.parse.ParsePushBroadcastReceiver`, be sure to replace that name with your class' name in the registration.

Note that some Android emulators (the ones without Google API support) don't support FCM, so if you test your app in an emulator make sure to select an emulator image that has Google APIs installed.

### Customizing Notifications

Now that your app is all set up to receive push notifications, you can start customizing the display of these notifications.

#### Customizing Notification Icons

The [Android style guide](https://material.io/guidelines/style/icons.html) recommends apps use a push icon that is monochromatic and flat. The default push icon is your application's launcher icon, which is unlikely to conform to the style guide. To provide a custom push icon, add the following metadata tag to your app's `AndroidManifest.xml`:

```java
<meta-data android:name="com.parse.push.notification_icon" android:resource="@drawable/push_icon"/>
```

...where `push_icon` is the name of a drawable resource in your package. If your application needs more than one small icon, you can override `getSmallIconId` in your `ParsePushBroadcastReceiver` subclass.

If your push has a unique context associated with an image, such as the avatar of the user who sent a message, you can use a large push icon to call attention to the notification. When a notification has a large push icon, your app's static (small) push icon is moved to the lower right corner of the notification and the large icon takes its place. See the [Android UI documentation](https://developer.android.com/guide/topics/ui/notifiers/notifications.html#CreateNotification) for examples. To provide a large icon, you can override `getLargeIcon` in your `ParsePushBroadcastReceiver` subclass.

#### Responding with a Custom Activity

If your push has no "uri" parameter, `onPushOpen` will invoke your application's launcher activity. To customize this behavior, you can override `getActivity` in your `ParsePushBroadcastReceiver` subclass.

#### Responding with a URI

If you provide a "uri" field in your push, the `ParsePushBroadcastReceiver` will open that URI when the notification is opened. If there are multiple apps capable of opening the URI, a dialog will displayed for the user. The `ParsePushBroadcastReceiver` will manage your back stack and ensure that clicking back from the Activity handling URI will navigate the user back to the activity returned by `getActivity`.

### Managing the Push Lifecycle

The push lifecycle has three phases:

1.  A notification is received and the `com.parse.push.intent.RECEIVE` Intent is fired, causing the `ParsePushBroadcastReceiver` to call `onPushReceive`. If either "alert" or "title" are specified in the push, then a Notification is constructed using `getNotification`. This Notification uses a small icon generated using `getSmallIconId`, which defaults to the icon specified by the `com.parse.push.notification_icon` metadata in your `AndroidManifest.xml`. The Notification's large icon is generated from `getLargeIcon` which defaults to null. The notification's `contentIntent` and `deleteIntent` are `com.parse.push.intent.OPEN` and `com.parse.push.intent.DELETE` respectively.
2.  If the user taps on a Notification, the `com.parse.push.intent.OPEN` Intent is fired. The `ParsePushBroadcastReceiver` calls `onPushOpen`. The default implementation automatically sends an analytics event back to Parse tracking that this notification was opened. If the push contains a "uri" parameter, an activity is launched to navigate to that URI, otherwise the activity returned by `getActivity` is launched.
3.  If the user dismisses a Notification, the `com.parse.push.intent.DELETE` Intent is fired. The `ParsePushBroadcastReceiver` calls `onPushDismiss`, which does nothing by default

All of the above methods may be subclassed to customize the way your application handles push notifications. When subclassing the methods `onPushReceive`, `onPushOpen`, `onPushDismiss`, or `getNotification`, consider delegating to `super` where appropriate. For example, one might override `onPushReceive` to trigger a background operation for "silent" pushes and then delegate to `super` for all other pushes. This provides the most benefit from Parse Push and makes your code forward-compatible.

### Tracking Pushes and App Opens

The default implementation of `onPushOpen` will automatically track user engagement from pushes. If you choose not to use the `ParsePushBroadcastReceiver` or override the `onPushOpen` implementation, you may need to track your app open event manually. To do this, add the following to the `onCreate` method of the `Activity` or the `onReceive` method of the `BroadcastReceiver` which handles the `com.parse.push.intent.OPEN` Intent:

```java
ParseAnalytics.trackAppOpened(getIntent());
```

To track push opens, you should always pass the `Intent` to `trackAppOpened`. Passing `null` to `trackAppOpened` will track _only_ a standard app-opened event, not the push-opened event. If you don't track the push-opened event, you will not be able to use advanced analytics features such as push-open graphs and A/B testing.

Please be sure to set up your application to [save the Installation object](#installations). Push open tracking only works when your application's devices are associated with saved `Installation` objects.

You can view the open rate for a specific push notification on your Parse Dashboard push console. You can also view your application's overall app open and push open graphs on the Parse analytics console.  Our push open analytics graphs are rendered in real time, so you can easily verify that your application is sending the correct analytics events before your next release.

## Push Experiments

You can A/B test your push notifications to figure out the best way to keep your users engaged. With A/B testing, you can simultaneously send two versions of your push notification to different devices, and use each version's push open rates to figure out which one is better.  You can test by either message or send time.

### A/B Testing

Our web push console guides you through every step of setting up an A/B test.

For each push campaign sent through the Parse web push console, you can allocate a subset of your devices to be in the experiment's test audience, which Parse will automatically split into two equally-sized experiment groups. For each experiment group, you can specify a different push message. The remaining devices will be saved so that you can send the winning message to them later. Parse will randomly assign devices to each group to minimize the chance for a test to affect another test's results (although we still don't recommend running multiple A/B tests over the same devices on the same day).

<img alt="" data-echo="{{ '/assets/images/experiment_enable.png' | prepend: site.baseurl }}"/>

After you send the push, you can come back to the push console to see in real time which version resulted in more push opens, along with other metrics such as statistical confidence interval. It's normal for the number of recipients in each group to be slightly different because some devices that we had originally allocated to that experiment group may have uninstalled the app. It's also possible for the  random group assignment to be slightly uneven when the test audience size is small. Since we calculate open rate separately for each group based on recipient count, this should not significantly affect your experiment results.

<img alt="" data-echo="{{ '/assets/images/experiment_results.png' | prepend: site.baseurl }}"/>

If you are happy with the way one message performed, you can send that to the rest of your app's devices (i.e. the “Launch Group”). This step only applies to A/B tests where you vary the message.

<img alt="" data-echo="{{ '/assets/images/experiment_launch.png' | prepend: site.baseurl }}"/>

Push experiments are supported on all recent Parse SDKs (iOS v1.2.13+, Android v1.4.0+, .NET v1.2.7+). Before running experiments, you must instrument your app with [push open tracking](#tracking-pushes-and-app-opens).

### Experiment Statistics

Parse provides guidance on how to run experiments to achieve statistically significant results.

#### Test Audience Size

When you setup a push message experiment, we'll recommend the minimum size of your test audience. These recommendations are generated through simulations based on your app's historical push open rates. For big push campaigns (e.g. 100k+ devices), this recommendation is usually small subset of your devices. For smaller campaigns (e.g. < 5k devices), this recommendation is usually all devices. Using all devices for your test audience will not leave any remaining devices for the launch group, but you can still gain valuable insight into what type of messaging works better so you can implement similar messaging in your next push campaign.

#### Confidence Interval

After you send your pushes to experiment groups, we'll also provide a statistical confidence interval when your experiment has collected enough data to have statistically significant results. This confidence interval is in absolute percentage points of push open rate (e.g. if the open rates for groups A and B are 3% and 5%, then the difference is reported as 2 percentage points). This confidence interval is a measure of how much difference you would expect to see between the two groups if you repeat the same experiment many times.

Just after a push send, when only a small number of users have opened their push notifications, the open rate difference you see between groups A and B could be due to random chance, so it might not be reproducible if you run the same experiment again. After your experiment collects more data over time, we become increasingly confident that the observed difference is a true difference. As this happens, the confidence interval will become narrower, allowing us to more accurately estimate the true difference between groups A and B. Therefore, we recommend that you wait until there is enough data to generate a statistical confidence interval before deciding which group's push is better.

## Push Localization

Localizing your app's content is a proven way to drive greater engagement. We've made it easy to localize your push messages with Push Localization. The latest version of the Parse Android SDK will detect and store the user's language in the installation object, and via the web push console you’ll be able to send localized push messages to your users in a single broadcast.

### Setup for localized push

To take advantage of Push Localization you will need to make sure you've published your app with the Parse Android SDK version 1.10.1 or greater. Any users of your application running the Parse Android SDK version 1.10.1 or greater will then be targetable by Push Localization via the web push console.

It's important to note that for developers who have users running apps with versions of the Parse Android SDK earlier than 1.10.1 that targeting information for Localized Push will not be available and these users will receive the default message from the push console.

### Sending a localized push

Our web push console guides you through every step of setting up a Localized Push.

## Troubleshooting

Setting up Push Notifications is often a source of frustration for developers. The process is complicated and invites problems to happen along the way. If you run into issues, try some of these troubleshooting tips.

It's important to break down the system into components when troubleshooting push notification issues. You can start by asking yourself the following questions:

* Is the push notification listed in your push logs?
* Are you targeting your push notification to the correct audience?
* Are your devices registering for push notifications?
* Is your app set up to receive these notifications?

If you're unsure about the answer to any of the above questions, read on!

### Confirm that the push campaign was created

Having everything set up correctly in your Parse app won't help if your request to send a push notification does not reach Parse. The first step in debugging a push issue is to confirm that the push campaign is listed in your push logs. You can find these logs by visiting your app's [Dashboard](https://github.com/parse-community/parse-dashboard) and clicking on Push.

If the push notification campaign is not showing up on that list, the issue is quite simple to resolve. Go back to your push notification sending code and make sure to check for any error responses. If you're using any of the client SDKs, make sure to listen for and catch any errors that may be returned. For example, you could log errors like so:

```java
push.sendPushInBackground(new SendCallback() {
  public void done(ParseException e) {
    if (e == null) {
      Log.d("push", "The push campaign has been created.");
    } else {
      Log.d("push", "Error sending push:" + e.getMessage());
    }
  }
});
```

Please note that SDKs that use a Client Key, such as the Android SDK, can only send push notifications if Client Push is enabled in your Parse app's Push Notification settings. Otherwise, you'll only be able to send pushes from the web console, the REST API, or by using the JavaScript SDK from Cloud Code. We strongly encourage developers to turn off Client Push before releasing their app publicly unless your use case allows for any amount of arbitrary pushes to be sent by any of your users. You can read our security guide for more information.

### Verify your Targeting

You have confirmed that the push notification is making it to your push logs. Now what? The next step is to verify if your push notification targeting is correct. Say, if you're debugging why notifications are not reaching a specific device, it's important to make sure that this device is actually included in the targeting of this push notification. You can't deliver something that is not addressed correctly.

In order to do this, you'll have to confirm that the device's `ParseInstallation` object is included in your push notification targeting criteria. This is quite straightforward if you're using channels: all you need to verify is that your device's `ParseInstallation` is subscribed to the channel by checking the channels array. If you're using advanced targeting, e.g. you're using a push query with constraints, you'll have to work a bit more to determine if your targeting is on point.

Basically, you will need to run the same push query you're using for your targeting, and verify that your installation of interest is included in the result set. As you can only query the installation class programmatically using the Master Key, you will need to use one of the Master Key capable SDKs (JavaScript SDK, .NET) or the REST API. Ideally, you would use the same SDK that you're currently using to send the push notifications.

#### Debugging using the REST API

The REST API is quite easy to use for this sort of purpose as you can easily recreate the push query using the information provided in your push notification logs. If you look closely at the “Full Target” value in your push campaign log item, you may notice that it matches the query format for a REST API query. You can grab an example of what a [REST API query]({{ site.baseUrl }}/rest/guide/#query-constraints) over `ParseInstallation`s would look like from the REST API docs. Don't forget to use the `X-Parse-Master-Key` header to ensure that the Master Key is used to run this query.

```bash
# Query over installations
curl -X GET \
-H "X-Parse-Application-Id: {YOUR_APPLICATION_ID}" \
-H "X-Parse-Master-Key: {YOUR_MASTER_KEY}" \
-G \
--data-urlencode 'limit=1000' \
--data-urlencode 'where={ "city": "San Francisco", "deviceType": { "$in": [ "ios", "android", "winphone", "embedded" ] } }' \
https://YOUR.PARSE-SERVER.HERE/parse/installations
```

If you type the above into a console, you should be able to see the first 1,000 objects that match your query. Note that constraints are always ANDed, so if you want to further reduce the search scope, you can add a constraint that matches the specific installation for your device:

```bash
# Query over installations
curl -X GET \
-H "X-Parse-Application-Id: {YOUR_APPLICATION_ID}" \
-H "X-Parse-Master-Key: {YOUR_MASTER_KEY}" \
-G \
--data-urlencode 'limit=1' \
--data-urlencode 'where={ “objectId”: {YOUR_INSTALLATION_OBJECT_ID}, "city": "San Francisco", "deviceType": { "$in": [ "ios", "android", "winphone", "embedded" ] } }' \
https://YOUR.PARSE-SERVER.HERE/parse/installations
```

If the above query returns no results, it is likely that your installation does not meet the targeting criteria for your campaign.

### Check your Device Configuration

Your push campaign is created and the device is included in the targeting, but you're still not receiving push notifications. What gives?

You can check the Push Delivery Report for the cause of failed deliveries: Mismatch Sender ID happens when the registered sender is not the same as the one currently sending the notifications, Not Registered is returned when the registration key is deemed invalid, either by misconfiguration or if the user have uninstalled the app.

If everything looks great so far, but push notifications are not showing up on your phone, there are a few more things you can check.

*   [Upgrade to the latest SDK](https://github.com/parse-community/Parse-SDK-Android). This documentation covers the push API introduced in the 1.17.0 version of the Android Parse SDK. Please upgrade if you are getting compiler errors following these instructions.
*   Make sure you've used the correct App ID and client key, and that `Parse.initialize()` is being called. `Parse.initialize()` lets the service know which application it is listening for; this code must be in your `Application.onCreate` rather than `Activity.onCreate` for a particular `Activity`, so that any activation technique will know how to use Parse.
*   Check that the push registration call is being called successfully. Your device must successfully register a ParseInstallation object with a valid FCM Registration id in the "deviceToken" field
*   Check that the device is set to accept push notifications from your app.
*   Note that, by design, force-killed apps will not be able to receive push notifications. Launch the app again to reenable push notifications.
*   Check the number of subscribers in your Parse Push Console. Does it match the expected number of subscribers? Your push might be targeted incorrectly.
*   If testing in the emulator, try cleaning and rebuilding your project and restarting your AVD.
*   Turn on verbose logging with `Parse.setLogLevel(Parse.LOG_LEVEL_VERBOSE)`. The error messages will be a helpful guide to what may be going on.
*   If you see the message "Finished (with error)" in your Dashboard, check your verbose logs. If you are performing pushes from a device, check that client-side push is enabled in your dashboard.
*   In your logs, you may see an error message, "Could not construct writer" or other issues related to a broken pipe. When this occurs, the framework will continue to try reconnecting. It should not crash your app.

If your app has been released for a while, it is expected that a percentage of your user base will have opted out of push notifications from your app or uninstalled your app from their device. Parse does not automatically delete installation objects in either of these cases. When a push campaign is sent out, Parse will detect uninstalled installations and exclude them from the total count of push notifications sent. The recipient estimate on the push composer is based on the estimated number of installations that match your campaign's targeting criteria. With that in mind, it is possible for the recipient estimate to be higher than the number of push notifications that is sent as reported by the push campaign status page.
