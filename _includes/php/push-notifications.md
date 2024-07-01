# Push Notifications

## Introduction

Push Notifications are a great way to keep your users engaged and informed about your app. You can reach your entire user base quickly and effectively. This guide will help you through the setup process and the general usage of Parse to send push notifications.

<div class='tip info'><div>
The PHP SDK does not currently support receiving pushes. It can only be used to send notifications to iOS and Android applications and to check the status of recent pushes.
</div></div>

## Setting Up Push

There is no setup required to use the PHP SDK for sending push notifications. If you haven't configured your [iOS]({{ site.baseUrl }}/ios/guide/#setting-up-push) or [Android]({{ site.baseUrl }}/android/guide/#setting-up-push) clients to use Push, take a look at their respective setup instruction using the platform toggle at the top.

## Installations

Every Parse application installed on a device registered for push notifications has an associated `Installation` object. The `Installation` object is where you store all the data needed to target push notifications. For example, in a baseball app, you could store the teams a user is interested in to send updates about their performance.

Note that `Installation` data can only be modified by the client SDKs, the data browser, or the REST API.

This class has several special fields that help you manage and target devices.

*   **`badge`**: The current value of the icon badge for iOS apps. Changes to this value on the server will be used for future badge-increment push notifications.
*   **`channels`**: An array of the channels to which a device is currently subscribed.
*   **`timeZone`**: The current time zone where the target device is located. This value is synchronized every time an `Installation` object is saved from the device _(readonly)_.
*   **`deviceType`**: The type of device, "ios" or "android" _(readonly)_.
*   **`installationId`**: Unique Id for the device used by Parse _(readonly)_.
*   **`deviceToken`**: The Apple generated token used for iOS devices _(readonly)_.

## Sending Pushes

There are two ways to send push notifications using Parse: [channels](#using-channels) and [advanced targeting]({{ site.baseUrl }}/php/guide/#using-advanced-targeting). Channels offer a simple and easy to use model for sending pushes, while advanced targeting offers a more powerful and flexible model. Both are fully compatible with each other and will be covered in this section.

You can view your past push notifications on the Parse Dashboard push console for up to 30 days after creating your push. For pushes scheduled in the future, you can delete the push on the web console as long as no sends have happened yet. After you send the push, the web console shows push analytics graphs.

### Using Channels

The simplest way to start sending notifications is using channels. This allows you to use a publisher-subscriber model for sending pushes. Devices start by subscribing to one or more channels, and notifications can later be sent to these subscribers. The channels subscribed to by a given `Installation` are stored in the `channels` field of the `Installation` object.

#### Subscribing to Channels

The PHP SDK does not currently support subscribing iOS and Android devices for pushes. Take a look at the [iOS]({{ site.baseUrl }}/ios/guide/#using-channels), [Android]({{ site.baseUrl }}/android/guide/#using-channels) or [REST]({{ site.baseUrl }}/rest/guide/#using-channels) Push guide using the platform toggle at the top.

#### Sending Pushes to Channels

With the PHP SDK, the following code can be used to alert all subscribers of the "Giants" and "Mets" channels about the results of the game. This will display a notification center alert to iOS users and a system tray notification to Android users.

```php
$data = array("alert" => "Hi!");

ParsePush::send(array(
  "channels" => ["PHPFans"],
  "data" => $data
), true);
```

### Using Advanced Targeting

While channels are great for many applications, sometimes you need more precision when targeting the recipients of your pushes. Parse allows you to write a query for any subset of your `Installation` objects using the [querying API]({{ site.baseUrl }}/php/guide/#queries) and to send them a push.

Since `Installation` objects are just like any other object stored in Parse, you can save any data you want and even create relationships between `Installation` objects and your other objects. This allows you to send pushes to a very customized and dynamic segment of your user base.

#### Saving Installation Data

The PHP SDK currently supports modifying `Installation` objects via the `ParseInstallation` class, but it is not the primary function of this sdk. If you do need to modify installation objects take a look at the [iOS]({{ site.baseUrl }}/ios/guide/#using-advanced-targeting), [Android]({{ site.baseUrl }}/android/guide/#using-advanced-targeting) or [REST]({{ site.baseUrl }}/rest/guide/#using-advanced-targeting) Push guide using the platform toggle at the top.

Generally if you need to saving installation data it will be a modification to an existing installation. Considering this it is recommended you read the related SDK docs for that installation first before you start modifying them, as mentioned above.

#### Sending Pushes to Queries

Once you have your data stored on your `Installation` objects, you can use a query to target a subset of these devices. `Parse.Installation` queries work just like any other [Parse query]({{ site.baseUrl }}/php/guide/#queries).

```php
$query = ParseInstallation::query();
$query->equalTo("design", "rad");
ParsePush::send(array(
  "where" => $query,
  "data" => $data
), true);
```

We can even use channels with our query. To send a push to all subscribers of the "Giants" channel but filtered by those who want score update, we can do the following:

```php
$query = ParseInstallation::query();
$query->equalTo("channels", "Giants");
$query->equalTo("scores", true);

ParsePush::send(array(
  "where" => $query,
  "data" => array(
    "alert" => "Giants scored against the A's! It's now 2-2."
  )
), true);
```

If we store relationships to other objects in our `Installation` class, we can also use those in our query. For example, we could send a push notification to all users near a given location like this.

```php
// Find users near a given location
$userQuery = ParseUser::query();
$userQuery->withinMiles("location", $stadiumLocation, 1.0);

// Find devices associated with these users
$pushQuery = ParseInstallation::query();
$pushQuery->matchesQuery('user', $userQuery);

// Send push notification to query
ParsePush::send(array(
  "where" => $pushQuery,
  "data" => array(
    "alert" => "Free hotdogs at the Parse concession stand!"
  )
), true);
```

#### Sending Pushes to Audiences

If you want to keep track of your sends when using queries you can use the `ParseAudience` class (available in sdk versions **1.4.0** and up).
You can create and configure your Audience objects with a name and query.

When you indicate it's being used in a push the `lastUsed` and `timesUsed` values are updated for you.

```php
$iosQuery = ParseInstallation::getQuery();
$iosQuery->equalTo("deviceType", "ios");

// create & save your audience
$audience = ParseAudience::createAudience(
    'MyiOSAudience',
    $iosQuery
);
$audience->save(true);

// send a push using the query in this audience and it's id
// The 'audience_id' is what allows parse to update 'lastUsed' and 'timesUsed'
// You could use any audience_id with any query and it will still update that audience
ParsePush::send([
    'data'          => [
        'alert' => 'hello ios users!'
    ],
    'where'         => $audience->getQuery(),
    'audience_id'   => $audience->getObjectId()
], true);

// fetch changes to this audience
$audience->fetch(true);

// get last & times used for tracking
$timesUsed = $audience->getTimesUsed();
$lastUsed = $audience->getLastUsed();
```

Audiences provide you with a convenient way to group your queries and keep track of how often and when you send to them.

## Sending Options

Push notifications can do more than just send a message. In iOS, pushes can also include the sound to be played, the badge number to display as well as any custom data you wish to send. In Android, it is even possible to specify an `Intent` to be fired upon receipt of a notification. An expiration date can also be set for the notification in case it is time sensitive.

### Customizing your Notifications

If you want to send more than just a message, you can set other fields in the `data` dictionary. There are some reserved fields that have a special meaning.

*   **`alert`**: the notification's message.
*   **`badge`**: _(iOS only)_ the value indicated in the top right corner of the app icon. This can be set to a value or to `Increment` in order to increment the current value by 1.
*   **`sound`**: _(iOS only)_ the name of a sound file in the application bundle.
*   **`content-available`**: _(iOS only)_ If you are a writing an app using the Remote Notification Background Mode [introduced in iOS7](https://developer.apple.com/library/ios/releasenotes/General/WhatsNewIniOS/Articles/iOS7.html#//apple_ref/doc/uid/TP40013162-SW10) (a.k.a. "Background Push"), set this value to 1 to trigger a background download.
*   **`category`**: _(iOS only)_ the identifier of the [`UNNotification​Category`](https://developer.apple.com/reference/usernotifications/unnotificationcategory) for this push notification.
*   **`uri`**: _(Android only)_ an optional field that contains a URI. When the notification is opened, an `Activity` associated      with opening the URI is launched.
*   **`title`**: _(Android only)_ the value displayed in the Android system tray notification.

For example, to send a notification that increases the current badge number by 1 and plays a custom sound for iOS devices, and displays a particular title for Android users, you can do the following:

```php
ParsePush::send(array(
  "channels" => [ "Mets" ],
  "data" => array(
    "alert" => "The Mets scored! The game is now tied 1-1.",
    "badge" => "Increment",
    "sound" => "cheering.caf",
    "title" => "Mets Score!"
  )
), true);
```

It is also possible to specify your own data in this dictionary. As explained in the Receiving Notifications section for [iOS]({{ site.baseUrl }}/ios/guide/#receiving-pushes) and [Android]({{ site.baseUrl }}/android/guide/#receiving-pushes), iOS will give you access to this data only when the user opens your app via the notification and Android will provide you this data in the `Intent` if one is specified.

```php
$query = ParseInstallation::query();
$query->equalTo('channels', 'Indians');
$query->equalTo('injuryReports', true);

ParsePush::send(array(
  "where" => $query,
  "data" => array(
    "action" => "com.example.UPDATE_STATUS"
    "alert" => "Ricky Vaughn was injured in last night's game!",
    "name" => "Vaughn",
    "newsItem" => "Man bites dog"
  )
), true);
```

### Setting an Expiration Date

When a user's device is turned off or not connected to the internet, push notifications cannot be delivered. If you have a time sensitive notification that is not worth delivering late, you can set an expiration date. This avoids needlessly alerting users of information that may no longer be relevant.

There are two parameters provided by Parse to allow setting an expiration date for your notification. The first is `expiration_time` which takes a `DateTime` specifying when Parse should stop trying to send the notification.

Alternatively, you can use the `expiration_interval` parameter to specify a duration of time before your notification expires. This value is relative to the `push_time` parameter used to [schedule notifications]({{ site.baseUrl }}/js/guide/#scheduling-pushes). This means that a push notification scheduled to be sent out in 1 day and an expiration interval of 6 days can be received up to a week from now.

### Targeting by Platform

If you build a cross platform app, it is possible you may only want to target iOS or Android devices. There are two methods provided to filter which of these devices are targeted. Note that both platforms are targeted by default.

The following examples would send a different notification to Android and iOS users.

```php
// Notification for Android users
$queryAndroid = ParseInstallation::query();
$queryAndroid->equalTo('deviceType', 'android');

ParsePush::send(array(
  "where" => $queryAndroid,
  "data" => array(
    "alert" => "Your suitcase has been filled with tiny robots!"
  )
), true);

// Notification for iOS users
$queryIOS = ParseInstallation::query();
$queryIOS->equalTo('deviceType', 'ios');

ParsePush::send(array(
  "where" => $queryIOS,
  "data" => array(
    "alert" => "Your suitcase has been filled with tiny apples!"
  )
), true);

// Notification for Windows 8 users
$queryWindows = ParseInstallation::query();
$queryWindows->equalTo('deviceType', 'winrt');

ParsePush::send(array(
  "where" => $queryWindows,
  "data" => array(
    "alert" => "Your suitcase has been filled with tiny surfaces!"
  )
), true);

// Notification for Windows Phone 8 users
$queryWP8 = ParseInstallation::query();
$queryWP8->equalTo('deviceType', 'winphone');

ParsePush::send(array(
  "where" => $queryWP8,
  "data" => array(
    "alert" => "Your suitcase is very hip; very metro."
  )
), true);
```

## Scheduling Pushes

You can schedule a push in advance by specifying a `push_time` parameter of type `DateTime`.

If you also specify an `expiration_interval`, it will be calculated from the scheduled push time, not from the time the push is submitted. This means a push scheduled to be sent in a week with an expiration interval of a day will expire 8 days after the request is sent.

The scheduled time cannot be in the past, and can be up to two weeks in the future. It can be an ISO 8601 date with a date, time, and timezone, as in the example above, or it can be a numeric value representing a UNIX epoch time in seconds (UTC).

## Receiving Push Status

If the version of ParseServer you are running supports it you can retrieve a `PushStatus` object from the response.

From that you can fetch the status message of the push request, number of pushes sent, number failed, and more.

```php
$data = array("alert" => "Hi!");

$response = ParsePush::send(array(
  "channels" => ["PHPFans"],
  "data" => $data
), true);

// check if a push status id is present
if(ParsePush::hasStatus($response)) {

    // Retrieve PushStatus object
    $pushStatus = ParsePush::getStatus($response);

    // get push status string
    $status = $pushStatus->getPushStatus();

    if($status == "succeeded") {
        // handle a successful push request

    } else if($status == "running") {
        // handle a running push request

    } else {
        // push request did not succeed

    }

    // get # pushes sent
    $sent = $pushStatus->getPushesSent();

    // get # pushes failed
    $failed = $pushStatus->getPushesFailed();

}
```

## Receiving Pushes

The PHP SDK does not currently support receiving pushes. To learn more about handling received notifications in [iOS]({{ site.baseUrl }}/ios/guide/#receiving-pushes) or [Android]({{ site.baseUrl }}/android/guide/#receiving-pushes), use the platform toggle at the top.

## Troubleshooting

For tips on troubleshooting push notifications, check the troubleshooting sections for [iOS]({{ site.baseUrl }}/ios/guide/#troubleshooting), [Android]({{ site.baseUrl }}/android/guide/#troubleshooting), and [.NET]({{ site.baseUrl }}/dotnet/guide/#troubleshooting) using the platform toggle at the top.
