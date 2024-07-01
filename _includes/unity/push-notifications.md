# Push Notifications

Push Notifications are a great way to keep your users engaged and informed about your app. You can reach your entire user base quickly and effectively. This guide will help you through the setup process and the general usage of Parse to send push notifications.

If you haven't installed the SDK yet, please [head over to the Push QuickStart]({{ site.baseUrl }}/parse-server/guide/#push-notifications-quick-start) to get our SDK up and running.

<div class='tip info'><div>
The Unity SDK can send push notifications from all runtimes, but only iOS and Android apps can receive pushes from APNS and FCM push servers.
</div></div>

## Setting Up Push

Currently, only two platforms are supported to receive push from Parse, Unity iOS and Unity Android.
* If you want to start using push on Unity iOS, start by completing the [iOS Push QuickStart]({{ site.baseUrl }}/parse-server/guide/#push-notifications-quick-start) to learn how to configure your push certificate.
* If you want to start using push on Unity Android, start by completing [Android Push QuickStart]({{ site.baseUrl }}/parse-server/guide/#push-notifications-quick-start) to learn how to configure your app.
Come back to this guide afterwards to learn more about the push features offered by Parse.


## Installations

Every Parse application installed on a device registered for push notifications has an associated `Installation` object. The `Installation` object is where you store all the data needed to target push notifications. For example, in a baseball app, you could store the teams a user is interested in to send updates about their performance. Saving the `Installation` object is also required for tracking push-related app open events.

On Unity, `Installation` objects are available through the `ParseInstallation` class, a subclass of `ParseObject`. It uses the [same API]({{ site.baseUrl }}/dotnet/guide/#objects) for storing and retrieving data. To access the current `Installation` object from your .NET app, use the `ParseInstallation.CurrentInstallation` property.

While it is possible to modify a `ParseInstallation` just like you would a `ParseObject`, there are several special fields that help manage and target devices.

*   **`channels`**:
    An `IEnumerable<string>` of the channels to which a device is currently subscribed. In .NET, this field is accessible through the `Channels` property.
*   **`timeZone`**: The current time zone where the target device is located. This field is readonly and can be accessed via the `TimeZone` property. This value is synchronized every time an `Installation` object is saved from the device.
*   **`localeIdentifier`**: The locale identifier of the device in the format [language code]-[COUNTRY CODE]. The language codes are two-letter lowercase ISO language codes (such as "en") as defined by [ISO 639-1](http://en.wikipedia.org/wiki/ISO_639-1). The country codes are two-letter uppercase ISO country codes (such as "US") as defined by [ISO 3166-1](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3). This value is synchronized every time a `ParseInstallation` object is saved from the device _(readonly)_.
*   **`deviceType`**: The type of device, "ios", "android", "winrt", "winphone", or "dotnet". This field is readonly and can be accessed via the `DeviceType` property.
*   **`pushType`**: This field is reserved for directing Parse to the push delivery network to be used. If the device is registered to receive pushes via FCM, this field will be marked "gcm". If this device is not using FCM, and is using Parse's push notification service, it will be blank _(readonly)_.
*   **`installationId`**: Unique Id for the device used by Parse. This field is readonly and can be accessed via the `InstallationId` property.
*   **`channelUris`**: The Microsoft-generated push URIs for Windows devices. This field is readonly and can be accessed via the `DeviceUris` property.
*   **`appName`**: The display name of the client application to which this installation belongs. This field is readonly and can be accessed via the `AppName` property.
*   **`appVersion`**: The version string of the client application to which this installation belongs. This field is readonly and can be accessed via the `AppVersion` property.
*   **`parseVersion`**: The version of the Parse SDK which this installation uses. This field is readonly and can be accessed via the `ParseVersion` property.
*   **`appIdentifier`**: A unique identifier for this installation's client application. This field is readonly and can be accessed via the `AppIdentifier` property. On Windows 8, this is the `Windows.ApplicationModel.Package` id; on Windows Phone 8 this is the ProductId; in other .NET applications, this is the `ApplicationIdentity` of the current `AppDomain`

## Sending Pushes

There are two ways to send push notifications using Parse: [channels](#using-channels) and [advanced targeting](#using-advanced-targeting). Channels offer a simple and easy to use model for sending pushes, while advanced targeting offers a more powerful and flexible model. Both are fully compatible with each other and will be covered in this section.

Sending notifications is often done from the Parse Dashboard push console, the [REST API]({{ site.baseUrl }}/rest/guide/#sending-pushes) or from [Cloud Code]({{ site.baseUrl }}/js/guide/#sending-pushes). However, push notifications can also be triggered by the existing client SDKs. If you decide to send notifications from the client SDKs, you will need to set **Client Push Enabled** in the Push Notifications settings of your Parse app.

However, be sure you understand that enabling Client Push can lead to a security vulnerability in your app. We recommend that you enable Client Push for testing purposes only, and move your push notification logic into Cloud Code when your app is ready to go into production.

<img alt="" data-echo="{{ '/assets/images/client_push_settings.png' | prepend: site.baseurl }}"/>

You can view your past push notifications on the Parse Dashboard push console for up to 30 days after creating your push. For pushes scheduled in the future, you can delete the push on the push console as long as no sends have happened yet. After you send the push, the push console shows push analytics graphs.

### Using Channels

The simplest way to start sending notifications is using channels. This allows you to use a publisher-subscriber model for sending pushes. Devices start by subscribing to one or more channels, and notifications can later be sent to these subscribers. The channels subscribed to by a given `Installation` are stored in the `channels` field of the `Installation` object.

#### Subscribing to Channels

A channel is identified by a string that starts with a letter and consists of alphanumeric characters, underscores, and dashes. It doesn't need to be explicitly created before it can be used and each `Installation` can subscribe to any number of channels at a time.

An installation's channels can be set using the `Channels` property of `ParseInstallation`. For example, in a baseball score app, we could do:

```cs
// When users indicate they are Giants fans, we subscribe them to that channel.
var installation = ParseInstallation.CurrentInstallation;
installation.Channels = new List<string> { "Giants" };
installation.SaveAsync();
```

Alternatively, you can insert a channel into `Channels` without affecting the existing channels using the `AddUniqueToList` method of `ParseObject` using the following:

```cs
var installation = ParseInstallation.CurrentInstallation;
installation.AddUniqueToList("channels", "Giants");
installation.SaveAsync();
```

Finally, `ParsePush` provides a shorthand for inserting a channel into `Channels` and saving:

```cs
ParsePush.SubscribeAsync("Giants");
```

Once subscribed to the "Giants" channel, your `Installation` object should have an updated `channels` field.

<img alt="" data-echo="{{ '/assets/images/installation_channel.png' | prepend: site.baseurl }}"/>

Unsubscribing from a channel is just as easy:

```cs
var installation = ParseInstallation.CurrentInstallation;
installation.RemoveAllFromList("channels" new List<string> { "Giants" });
installation.SaveAsync();
```

Or, using ParsePush:

```cs
ParsePush.UnsubscribeAsync("Giants");
```

The set of subscribed channels is cached in the `CurrentInstallation` object:

```cs
var installation = ParseInstallation.CurrentInstallation
IEnumerable<string> subscribedChannels = installation.Channels;
```

If you plan on changing your channels from Cloud Code or the data browser, note that you'll need to call `FetchAsync` prior to this line in order to get the most recent channels.

#### Sending Pushes to Channels

In the .NET SDK, the following code can be used to alert all subscribers of the "Giants" channel that their favorite team just scored. This will display a toast notification to Windows users. iOS users will receive a notification in the notification center and Android users will receive a notification in the system tray.

```cs
// Send a notification to all devices subscribed to the "Giants" channel.
var push = new ParsePush();
push.Channels = new List<string> {"Giants"};
push.Alert = "The Giants just scored!";
push.SendAsync();
```

If you want to target multiple channels with a single push notification, you can use any `IEnumerable<string>` of channels.

### Using Advanced Targeting

While channels are great for many applications, sometimes you need more precision when targeting the recipients of your pushes. Parse allows you to write a query for any subset of your `Installation` objects using the [querying API]({{ site.baseUrl }}/unity/guide/#queries) and to send them a push.

Since `ParseInstallation` is a subclass of `ParseObject`, you can save any data you want and even create relationships between `Installation` objects and your other objects. This allows you to send pushes to a very customized and dynamic segment of your user base.

#### Saving Installation Data

Storing data on an `Installation` object is just as easy as storing [any other data]({{ site.baseUrl }}/unity/guide/#objects) on Parse. In our Baseball app, we could allow users to get pushes about game results, scores and injury reports.

```cs
// Store the category of push notifications the user would like to receive.
var installation = ParseInstallation.CurrentInstallation;
installation["scores"] = true;
installation["gameResults"] = true;
installation["injuryReports"] = true;
installation.SaveAsync();
```

You can even create relationships between your `Installation` objects and other classes saved on Parse. To associate an Installation with a particular user, for example, you can simply store the current user on the `ParseInstallation`.

```cs
// Associate the device with a user
var installation = ParseInstallation.CurrentInstallation;
installation["user"] = ParseUser.CurrentUser;
installation.SaveAsync();
```

#### Sending Pushes to Queries

Once you have your data stored on your `Installation` objects, you can use a `ParseQuery` to target a subset of these devices. `Installation` queries work just like any other [Parse query]({{ site.baseUrl }}/unity/guide/#queries), but we use the special static property `ParseInstallation.Query` to create it. We set this query on our `ParsePush` object, before sending the notification.

```cs
var push = new ParsePush();
push.Query = ParseInstallation.Query
             .WhereEqualTo("injuryReports", true);
push.Alert = "Willie Hayes injured by own pop fly.";
push.SendAsync();
```

We can even use channels with our query. To send a push to all subscribers of the "Giants" channel but filtered by those who want score update, we can do the following:

```cs
var push = new ParsePush();
push.Query = ParseInstallation.Query
             .WhereEqualTo("scores", true);
push.Channels = new List<string> { "Giants" };
push.Alert = "Giants scored against the A's! It's now 2-2.";
push.SendAsync();
```

Alternatively, we can use a query that constrains "channels" directly:

```cs
var push = new ParsePush();
push.Query = ParseInstallation.Query
             .WhereEqualTo("scores", true)
             .WhereContainsAll("channels", new string[] { "Giants" });
push.Alert = "Giants scored against the A's! It's now 2-2.";
push.SendAsync();
```

If we store relationships to other objects in our `Installation` class, we can also use those in our query. For example, we could send a push notification to all users near a given location like this.

```cs
// Find users in the Seattle metro area
var userQuery = ParseUser.Query.WhereWithinDistance(
    "location",
    marinersStadium,
    ParseGeoDistance.FromMiles(1));
var push= new ParsePush();
push.Query = ParseInstallation.Query
             .WhereMatchesQuery("user", userQuery);
push.Alert = "Mariners lost? Free conciliatory hotdogs at the Parse concession stand!";
push.SendAsync();
```

## Sending Options

Push notifications can do more than just send a message. On Unity, pushes can also include a title, as well as any custom data you wish to send. An expiration date can also be set for the notification in case it is time sensitive.

### Customizing your Notifications

If you want to send more than just a message, you will need to use an `IDictionary<string, object>` to package all of the data. There are some reserved fields that have a special meaning.

*   **`alert`**: the notification's message.
*   **`badge`**: _(iOS only)_ the value indicated in the top right corner of the app icon. This can be set to a value or to `Increment` in order to increment the current value by 1.
*   **`sound`**: _(iOS only)_ the name of a sound file in the application bundle.
*   **`content-available`**: _(iOS only)_ If you are a writing an app using the Remote Notification Background Mode [introduced in iOS7](https://developer.apple.com/library/ios/releasenotes/General/WhatsNewIniOS/Articles/iOS7.html#//apple_ref/doc/uid/TP40013162-SW10) (a.k.a. "Background Push"), set this value to 1 to trigger a background download.
*   **`category`**: _(iOS only)_ the identifier of the [`UNNotification​Category`](https://developer.apple.com/reference/usernotifications/unnotificationcategory) for this push notification.
*   **`uri`**: _(Android only)_ an optional field that contains a URI. When the notification is opened, an `Activity` associated with opening the URI is launched.
*   **`title`**: _(Android, Windows 8, and Windows Phone 8 only)_ the value displayed in the Android system tray or Windows toast notification.

For example, to send a notification that contains a title, you can do the following:

```cs
var push = new ParsePush();
push.Channels = new List<string> {"Mets"};
push.Data = new Dictionary<string, object> {
  {"title", "Score Alert"}
  {"alert", "The Mets scored! The game is now tied 1-1!"},
};
push.SendAsync();
```

### Setting an Expiration Date

When a user's device is turned off or not connected to the internet, push notifications cannot be delivered. If you have a time sensitive notification that is not worth delivering late, you can set an expiration date. This avoids needlessly alerting users of information that may no longer be relevant.

There are two properties provided by the `ParsePush` class to allow setting an expiration date for your notification. The first is `Expiration` which simply takes a `DateTime?` specifying when Parse should stop trying to send the notification.

```cs
var push = new ParsePush();
push.Expiration = new DateTime(2015, 8, 14);
push.Alert = "Season tickets on sale until August 14th!";
push.SendAsync();
```

There is however a caveat with this method. Since device clocks are not guaranteed to be accurate, you may end up with inaccurate results. For this reason, the `ParsePush` class also provides the `ExpirationInterval` property which accepts a `TimeSpan`. The notification will expire after the specified interval has elapsed.

```cs
var push = new ParsePush();
push.ExpirationInterval = TimeSpan.FromDays(7);
push.Alert = "Season tickets on sale until next week!";
push.SendAsync();
```

### Targeting by Platform

If you build a cross platform app, it is possible you may only want to target one operating system. There are two methods provided to filter which of these devices are targeted. Note that all platforms are targeted by default.

The following example would send a different notification to Android, iOS, and Windows users.

```cs
// Notification for Android users
var androidPush = new ParsePush();
androidPush.Query = ParseInstallation.Query
                    .WhereContainsAll("channels", new string[] { "suitcaseOwners" })
                    .WhereEqualTo("deviceType", "android");
androidPush.SendAsync();

// Notification for iOS users
+var iosPush = new ParsePush();
iosPush.Alert = "Your suitcase has been filled with tiny apples!";
iosPush.Query = ParseInstallation.Query
                .WhereContainsAll("channels", new string[] { "suitcaseOwners" })
                .WhereEqualTo("deviceType", "ios");
iosPush.SendAsync();

// Notification for Windows 8 users
var winPush = new ParsePush();
winPush.Alert = "Your suitcase has been filled with tiny glass!";
winPush.Query = ParseInstallation.Query
                .WhereContainsAll("channels", new string[] { "suitcaseOwners" })
                .WhereEqualTo("deviceType", "winrt");
winPush.SendAsync();

// Notification for Windows Phone 8 users
var wpPush = new ParsePush();
wpPush.Alert = "Your suitcase is very hip; very metro.";
wpPush.Query = ParseInstallation.Query
               .WhereContainsAll("channels", new string[] { "suitcaseOwners" })
               .WhereEqualTo("deviceType", "winphone");
wpPush.SendAsync();
```

## Scheduling Pushes

Sending scheduled push notifications is not currently supported by the .NET SDK. Take a look at the [REST API]({{ site.baseUrl }}/rest/guide/#scheduling-pushes), [JavaScript SDK]({{ site.baseUrl }}/js/guide/#scheduling-pushes) or the Parse Dashboard push console.

## Receiving Pushes

If your app is running while a push notification is received, the `ParsePush.ParsePushNotificationReceived` event is fired. You can register for this event. This event provides `ParsePushNotificationEventArgs`.

```cs
ParsePush.ParsePushNotificationReceived += (sender, args) => {
  var payload = args.Payload;
  object objectId;
  if (payload.TryGetValue("objectId", out objectId)) {
    DisplayRichMessageWithObjectId(objectId as string);
  }
};
```

In Unity Android, we provide a helper method that you can utilize as a handler to display a notification. If the app is in background it will display a notification by default.
```cs
ParsePush.ParsePushNotificationReceived += (sender, args) => {
#if UNITY_ANDROID
	AndroidJavaClass parseUnityHelper = new AndroidJavaClass("com.parse.ParsePushUnityHelper");
	AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
	AndroidJavaObject currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity");

	// Call default behavior.
	parseUnityHelper.CallStatic("handleParsePushNotificationReceived", currentActivity, args.StringPayload);
#endif
}
```

### Tracking Pushes and App Opens

Tracking push opens is not supported on Unity now. You can track app opens with

```cs
ParseAnalytics.TrackAppOpenedAsync();
```

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

Push experiments are supported on all recent Parse SDKs (iOS v1.2.13+, Android v1.4.0+, .NET v1.2.7+). Before running experiments, you must instrument your app with [push open tracking](#receiving-pushes).

### Experiment Statistics

Parse provides guidance on how to run experiments to achieve statistically significant results.

#### Test Audience Size

When you setup a push message experiment, we'll recommend the minimum size of your test audience. These recommendations are generated through simulations based on your app's historical push open rates. For big push campaigns (e.g. 100k+ devices), this recommendation is usually small subset of your devices. For smaller campaigns (e.g. < 5k devices), this recommendation is usually all devices. Using all devices for your test audience will not leave any remaining devices for the launch group, but you can still gain valuable insight into what type of messaging works better so you can implement similar messaging in your next push campaign.

#### Confidence Interval

After you send your pushes to experiment groups, we'll also provide a statistical confidence interval when your experiment has collected enough data to have statistically significant results. This confidence interval is in absolute percentage points of push open rate (e.g. if the open rates for groups A and B are 3% and 5%, then the difference is reported as 2 percentage points). This confidence interval is a measure of how much difference you would expect to see between the two groups if you repeat the same experiment many times.

Just after a push send, when only a small number of users have opened their push notifications, the open rate difference you see between groups A and B could be due to random chance, so it might not be reproducible if you run the same experiment again. After your experiment collects more data over time, we become increasingly confident that the observed difference is a true difference. As this happens, the confidence interval will become narrower, allowing us to more accurately estimate the true difference between groups A and B. Therefore, we recommend that you wait until there is enough data to generate a statistical confidence interval before deciding which group's push is better.

## Push Localization

Localizing your app's content is a proven way to drive greater engagement. We've made it easy to localize your push messages with Push Localization. The latest version of the Parse .NET SDK will detect and store the user's language in the installation object, and via the web push console you’ll be able to send localized push messages to your users in a single broadcast.

### Setup for localized push

To take advantage of  Push Localization you will need to make sure you've published your app with the Parse .NET SDK version 1.5.5 or greater. Any users of your application running the Parse .NET SDK version 1.5.5 or greater will then be targetable by Push Localization via the web push console.

It's important to note that for developers who have users running apps with versions of the Parse .NET SDK earlier than 1.5.5 that targeting information for Localized Push will not be available and these users will receive the default message from the push console.

### Sending a localized push

Our web push console guides you through every step of setting up a Localized Push.

## Troubleshooting

Setting up Push Notifications is often a source of frustration for developers. The process is complicated and invites problems to happen along the way. If you run into issues, try some of these troubleshooting tips.

* If you're receiving push from Unity iOS, refer to [iOS Push Troubleshooting Guide]({{ site.baseUrl }}/ios/guide/#troubleshooting).
* If you're receiving push from Unity Android, refer to [Android Push Troubleshooting Guide]({{ site.baseUrl }}/android/guide/#troubleshooting).
