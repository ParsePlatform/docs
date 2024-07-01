# Push Notifications

Push Notifications are a great way to keep your users engaged and informed about your app. You can reach your entire user base quickly and effectively. This guide will help you through the setup process and the general usage of Parse to send push notifications.

If you haven't installed the SDK yet, please [head over to the Push QuickStart]({{ site.baseUrl }}/parse-server/guide/#push-notifications-quick-start) to get our SDK up and running.

Please note that client push is not available with Parse Server due to it being a significant security risk, it is recommended that to trigger push notifications from your iOS app you run a cloud function that sends the push using the `masterKey`. If you must use client push, you could fork Parse Server and enable it or alternatively [Back4App](https://www.back4app.com) offer it as an option for testing purposes only.

## Setting Up Push

If you want to start using push, start by completing the [Push Notifications QuickStart]({{ site.baseUrl }}/parse-server/guide/#push-notifications-quick-start) to learn how to configure your app. Come back to this guide afterwards to learn more about the push features offered by Parse.

## Installations

Every Parse application installed on a device registered for push notifications has an associated PFInstallation object. The PFInstallation object is where you store all the data needed to target push notifications. For example, in a baseball app, you could store the teams a user is interested in to send updates about their performance. Saving the PFInstallation object is also required for tracking push-related app open events.

In iOS or OS X, `Installation` objects are available through the `PFInstallation` class, a subclass of `PFObject`. It uses the [same API](#objects) for storing and retrieving data. To access the current `Installation` object from your app, use the `[PFInstallation currentInstallation]` method. The first time you save a `PFInstallation`, Parse will add it to your `Installation` class, and it will be available for targeting push notifications as long as its `deviceToken` field is set.

First, make your app register for remote notifications by adding the following in your `application:didFinishLaunchingWithOptions:` method (if you haven't already):

<div class="language-toggle" markdown="1">
```objective_c
UIUserNotificationType userNotificationTypes = (UIUserNotificationTypeAlert | UIUserNotificationTypeBadge | UIUserNotificationTypeSound);
UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:userNotificationTypes  categories:nil];
[application registerUserNotificationSettings:settings];
[application registerForRemoteNotifications];
```
```swift
let userNotificationTypes: UIUserNotificationType = [.Alert, .Badge, .Sound]

let settings = UIUserNotificationSettings(forTypes: userNotificationTypes, categories: nil)
application.registerUserNotificationSettings(settings)
application.registerForRemoteNotifications()
```
</div>

We will then update our `PFInstallation` with the `deviceToken` once the device is registered for push notifications:

<div class="language-toggle" markdown="1">
```objective_c
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  // Store the deviceToken in the current Installation and save it to Parse
  PFInstallation *currentInstallation = [PFInstallation currentInstallation];
  [currentInstallation setDeviceTokenFromData:deviceToken];
  [currentInstallation saveInBackground];
}
```
```swift
func application(application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: NSData) {
  // Store the deviceToken in the current Installation and save it to Parse
  let installation = PFInstallation.currentInstallation()
  installation.setDeviceTokenFromData(deviceToken)
  installation.saveInBackground()
}
```
</div>

While it is possible to modify a `PFInstallation` just like you would a `PFObject`, there are several special fields that help manage and target devices.

*   **`channels`**: An array of the channels to which a device is currently subscribed.
*   **`badge`**: The current value of the icon badge for iOS/OS X apps. Changing this value on the `PFInstallation` will update the badge value on the app icon. Changes should be saved to the server so that they will be used for future badge-increment push notifications.
*   **`installationId`**: Unique Id for the device used by Parse _(readonly)_.
*   **`deviceType`**: The type of device, "ios", "tvos", "osx", "android", "winrt", "winphone", "dotnet", or "embedded". On iOS, tvOS and OS X devices, this field will be set to "ios", "tvos" and "osx", respectively _(readonly)_.
*   **`deviceToken`**: The Apple generated token used for iOS/OS X devices. On Android devices, this is the token used by FCM to keep track of registration ID _(readonly)_.
*   **`appName`**: The display name of the client application to which this installation belongs. In iOS/OS X, this value is obtained from `kCFBundleNameKey`. This value is synchronized every time a `PFInstallation` object is saved from the device _(readonly)_.
*   **`appVersion`**: The version string of the client application to which this installation belongs. In iOS/OS X, this value is obtained from `kCFBundleVersionKey`. This value is synchronized every time a `PFInstallation` object is saved from the device _(readonly)_.
*   **`appIdentifier`**: A unique identifier for this installation's client application. In iOS/OS X, this value is obtained from `kCFBundleIdentifierKey`. This value is synchronized every time a `PFInstallation` object is saved from the device _(readonly)_.
*   **`parseVersion`**: The version of the Parse SDK which this installation uses. This value is synchronized every time a `PFInstallation` object is saved from the device _(readonly)_.
*   **`timeZone`**: The current time zone where the target device is located. This value is synchronized every time a `PFInstallation` object is saved from the device _(readonly)_.
*   **`localeIdentifier`**: The locale identifier of the device in the format [language code]-[COUNTRY CODE]. The language codes are two-letter lowercase ISO language codes (such as "en") as defined by [ISO 639-1](http://en.wikipedia.org/wiki/ISO_639-1). The country codes are two-letter uppercase ISO country codes (such as "US") as defined by [ISO 3166-1](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3). This value is synchronized every time a `PFInstallation` object is saved from the device _(readonly)_.
*   **`pushType`**: This field is reserved for directing Parse to the push delivery network to be used for Android devices. This parameter is not supported in iOS/OS X devices _(readonly)_.
*   **`channelUris`**: The Microsoft-generated push URIs for Windows devices _(readonly)_.

The Parse SDK will avoid making unnecessary requests. If a `PFInstallation` is saved on the device, a request to the Parse servers will only be made if one of the `PFInstallation`'s fields has been explicitly updated.

## Sending Pushes

There are two ways to send push notifications using Parse: [channels](#using-channels) and [advanced targeting](#using-advanced-targeting). Channels offer a simple and easy to use model for sending pushes, while advanced targeting offers a more powerful and flexible model. Both are fully compatible with each other and will be covered in this section.

Sending notifications is often done from the Parse Dashboard push console, the [REST API]({{ site.baseUrl }}/rest/guide/#sending-pushes) or from [Cloud Code]({{ site.baseUrl }}/js/guide/#sending-pushes).

You can view your past push notifications on the Parse Dashboard push console for up to 30 days after creating your push. For pushes scheduled in the future, you can delete the push on the push console as long as no sends have happened yet. After you send the push, the push console shows push analytics graphs.

### Using Channels

The simplest way to start sending notifications is using channels. This allows you to use a publisher-subscriber model for sending pushes. Devices start by subscribing to one or more channels, and notifications can later be sent to these subscribers. The channels subscribed to by a given `Installation` are stored in the `channels` field of the `Installation` object.

#### Subscribing to Channels

A channel is identified by a string that starts with a letter and consists of alphanumeric characters, underscores, and dashes. It doesn't need to be explicitly created before it can be used and each `Installation` can subscribe to any number of channels at a time.

Adding a channel subscription can be done using the `addUniqueObject:` method in `PFObject`. For example, in a baseball score app, we could do:
<div class="language-toggle" markdown="1">
```objective_c
// When users indicate they are Giants fans, we subscribe them to that channel.
PFInstallation *currentInstallation = [PFInstallation currentInstallation];
[currentInstallation addUniqueObject:@"Giants" forKey:@"channels"];
[currentInstallation saveInBackground];
```
```swift
// When users indicate they are Giants fans, we subscribe them to that channel.
let currentInstallation = PFInstallation.currentInstallation()
currentInstallation.addUniqueObject("Giants", forKey: "channels")
currentInstallation.saveInBackground()
```
</div>

Once subscribed to the "Giants" channel, your `Installation` object should have an updated `channels` field.

<img alt="Installation object's channels" data-echo="{{ '/assets/images/installation_channel.png' | prepend: site.baseurl }}"/>

Unsubscribing from a channel is just as easy:

<div class="language-toggle" markdown="1">
```objective_c
// When users indicate they are no longer Giants fans, we unsubscribe them.
PFInstallation *currentInstallation = [PFInstallation currentInstallation];
[currentInstallation removeObject:@"Giants" forKey:@"channels"];
[currentInstallation saveInBackground];
```
```swift
// When users indicate they are Giants fans, we subscribe them to that channel.
let currentInstallation = PFInstallation.currentInstallation()
currentInstallation.removeObject("Giants", forKey: "channels")
currentInstallation.saveInBackground()
```
</div>

The set of subscribed channels is cached in the `currentInstallation` object:

<div class="language-toggle" markdown="1">
```objective_c
NSArray *subscribedChannels = [PFInstallation currentInstallation].channels;
```
```swift
let subscribedChannels = PFInstallation.currentInstallation().channels
```
</div>

If you plan on changing your channels from Cloud Code or the data browser, note that you'll need to call some form of `fetch` prior to this line in order to get the most recent channels.

### Using Advanced Targeting

While channels are great for many applications, sometimes you need more precision when targeting the recipients of your pushes. Parse allows you to write a query for any subset of your `Installation` objects using the [querying API](#queries) and to send them a push.

Since `PFInstallation` is a subclass of `PFObject`, you can save any data you want and even create relationships between `Installation` objects and your other objects. This allows you to send pushes to a very customized and dynamic segment of your user base.

#### Saving Installation Data

Storing data on an `Installation` object is just as easy as storing [any other data](#objects) on Parse. In our Baseball app, we could allow users to get pushes about game results, scores and injury reports.

<div class="language-toggle" markdown="1">
```objective_c
// Store app language and version
PFInstallation *installation = [PFInstallation currentInstallation];
[installation setObject:@YES forKey:@"scores"];
[installation setObject:@YES forKey:@"gameResults"];
[installation setObject:@YES forKey:@"injuryReports"];
[installation saveInBackground];
```
```swift
// Store app language and version
let installation = PFInstallation.currentInstallation()
installation["scores"] = true
installation["gameResults"] = true
installation["injuryReports"] = true
installation.saveInBackground()
```
</div>

You can even create relationships between your `Installation` objects and other classes saved on Parse. To associate a PFInstallation with a particular user, for example, you can simply store the current user on the `PFInstallation`.

<div class="language-toggle" markdown="1">
```objective_c
// Associate the device with a user
PFInstallation *installation = [PFInstallation currentInstallation];
installation[@"user"] = [PFUser currentUser];
[installation saveInBackground];
```
```swift
// Associate the device with a user
let installation = PFInstallation.currentInstallation()
installation["user"] = PFUser.currentUser()
installation.saveInBackground()
```
</div>

## Receiving Pushes

It is possible to send arbitrary data along with your notification message, which is explained in the [Sending Options](https://docs.parseplatform.org/js/guide/#sending-options) section in the JavaScript docs. We can use this data to modify the behavior of your app when a user opens a notification. For example, upon opening a notification saying that a friend commented on a user's picture, it would be nice to display this picture. This could be done by sending the `objectId` of the picture in the push payload and then fetching the image once the user opens the notification.

Due to the package size restrictions imposed by Apple, you need to be careful in managing the amount of extra data sent, since it will cut down on the maximum size of your message. For this reason, it is recommended that you keep your extra keys and values as small as possible.

### Responding to the Payload

When an app is opened from a notification, the data is made available in the `application:didFinishLaunchingWithOptions:` methods through the `launchOptions` dictionary.

<div class="language-toggle" markdown="1">
```objective_c
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  . . .
  // Extract the notification data
  NSDictionary *notificationPayload = launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey];

  // Create a pointer to the Photo object
  NSString *photoId = [notificationPayload objectForKey:@"p"];
  PFObject *targetPhoto = [PFObject objectWithoutDataWithClassName:@"Photo"   objectId:photoId];

  // Fetch photo object
  [targetPhoto fetchIfNeededInBackgroundWithBlock:^(PFObject *object, NSError *error) {
    // Show photo view controller
    if (!error) {
      PhotoVC *viewController = [[PhotoVC alloc] initWithPhoto:object];
      [self.navController pushViewController:viewController animated:YES];
    }
  }];
}
```
```swift
func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
  . . .
  // Extract the notification data
  if let notificationPayload = launchOptions?[UIApplicationLaunchOptionsRemoteNotificationKey] as? NSDictionary {

      // Create a pointer to the Photo object
      let photoId = notificationPayload["p"] as? NSString
      let targetPhoto = PFObject(withoutDataWithClassName: "Photo", objectId: photoId)

      // Fetch photo object
      targetPhoto.fetchIfNeededInBackgroundWithBlock {
        (object: PFObject?, error:NSError?) -> Void in
          if error == nil {
              // Show photo view controller
              let viewController = PhotoVC(photo: object);
              self.navController.pushViewController(viewController, animated: true);
          }
      }
  }
}
```
</div>

If your app is already running when the notification is received, the data is made available in the `application:didReceiveRemoteNotification:fetchCompletionHandler:` method through the `userInfo` dictionary.

<div class="language-toggle" markdown="1">
```objective_c
- (void)application:(UIApplication *)application
  didReceiveRemoteNotification:(NSDictionary *)userInfo  fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))handler {
  // Create empty photo object
  NSString *photoId = [userInfo objectForKey:@"p"];
  PFObject *targetPhoto = [PFObject objectWithoutDataWithClassName:@"Photo"   objectId:photoId];

  // Fetch photo object
  [targetPhoto fetchIfNeededInBackgroundWithBlock:^(PFObject *object, NSError *error) {
    // Show photo view controller
    if (error) {
      handler(UIBackgroundFetchResultFailed);
    } else if ([PFUser currentUser]) {
      PhotoVC *viewController = [[PhotoVC alloc] initWithPhoto:object];
      [self.navController pushViewController:viewController animated:YES];
      handler(UIBackgroundFetchResultNewData);
    } else {
      handler(UIBackgroundFetchResultNoData);
    }
  }];
}
```
```swift
func application(application: UIApplication,  didReceiveRemoteNotification userInfo: [NSObject : AnyObject],  fetchCompletionHandler completionHandler: (UIBackgroundFetchResult) -> Void) {
  if let photoId: String = userInfo["p"] as? String {
    let targetPhoto = PFObject(withoutDataWithClassName: "Photo", objectId: photoId)
    targetPhoto.fetchIfNeededInBackgroundWithBlock { (object: PFObject?, error: NSError?) -> Void in
      // Show photo view controller
      if error != nil {
        completionHandler(UIBackgroundFetchResult.Failed)
      } else if PFUser.currentUser() != nil {
        let viewController = PhotoVC(withPhoto: object)
        self.navController.pushViewController(viewController, animated: true)
        completionHandler(UIBackgroundFetchResult.NewData)
      } else {
        completionHandler(UIBackgroundFetchResult.NoData)
      }
    }
  }
  handler(UIBackgroundFetchResult.NoData)
}
```
</div>

You can read more about handling push notifications in Apple's [Local and Push Notification Programming Guide](https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/index.html).

### Tracking Pushes and App Opens

To track your users' engagement over time and the effect of push notifications, we provide some hooks in the `PFAnalytics` class. You can view the open rate for a specific push notification on the Parse Dashboard push console. You can also view overall app open and push open graphs are on the Parse analytics console.  Our analytics graphs are rendered in real time, so you can easily verify that your application is sending the correct analytics events before your next release.

This section assumes that you've already set up your application to [save the Installation object](#installations). Push open tracking only works when your application's devices are associated with saved `Installation` objects.

First, add the following to your `application:didFinishLaunchingWithOptions:` method to collect information about when your application was launched, and what triggered it. The extra checks ensure that, even with iOS 7's more advanced background push features, a single logical app-open or push-open event is counted as such.

<div class="language-toggle" markdown="1">
```objective_c
if (application.applicationState != UIApplicationStateBackground) {
  // Track an app open here if we launch with a push, unless
  // "content_available" was used to trigger a background push (introduced
  // in iOS 7). In that case, we skip tracking here to avoid double
  // counting the app-open.
  BOOL preBackgroundPush = ![application respondsToSelector:@selector(backgroundRefreshStatus)];
  BOOL oldPushHandlerOnly = ![self respondsToSelector:@selector(application:didReceiveRemoteNotification:fetchCompletionHandler:)];
  BOOL noPushPayload = ![launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  if (preBackgroundPush || oldPushHandlerOnly || noPushPayload) {
    [PFAnalytics trackAppOpenedWithLaunchOptions:launchOptions];
  }
}
```
```swift
if application.applicationState != UIApplicationState.Background {
  // Track an app open here if we launch with a push, unless
  // "content_available" was used to trigger a background push (introduced
  // in iOS 7). In that case, we skip tracking here to avoid double
  // counting the app-open.
  let oldPushHandlerOnly = !self.respondsToSelector(Selector("application:didReceiveRemoteNotification:fetchCompletionHandler:"))
  let noPushPayload: AnyObject? = launchOptions?[UIApplicationLaunchOptionsRemoteNotificationKey]?
  if oldPushHandlerOnly || noPushPayload != nil {
    PFAnalytics.trackAppOpenedWithLaunchOptions(launchOptions)
  }
}
```
</div>

Second, if your application is running or backgrounded, the `application:didReceiveRemoteNotification:` method handles the push payload instead. If the user acts on a push notification while the application is backgrounded, the application will be brought to the foreground. To track this transition as the application being "opened from a push notification," perform one more check before calling any tracking code:

<div class="language-toggle" markdown="1">
```objective_c
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
  if (application.applicationState == UIApplicationStateInactive) {
    // The application was just brought from the background to the foreground,
    // so we consider the app as having been "opened by a push notification."
    [PFAnalytics trackAppOpenedWithRemoteNotificationPayload:userInfo];
  }
}
```
```swift
func application(application: UIApplication, didReceiveRemoteNotification userInfo: [NSObject : AnyObject]) {
    if application.applicationState == .Inactive  {
        // The application was just brought from the background to the foreground,
        // so we consider the app as having been "opened by a push notification."
        PFAnalytics.trackAppOpenedWithRemoteNotificationPayload(userInfo)
    }
}
```
</div>

Finally, if using iOS 7 any of its new push features (including the new "content-available" push functionality), be sure to also implement the iOS 7-only handler:

<div class="language-toggle" markdown="1">
```objective_c
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  if (application.applicationState == UIApplicationStateInactive) {
    [PFAnalytics trackAppOpenedWithRemoteNotificationPayload:userInfo];
  }
}
```
```swift
func application(application: UIApplication,  didReceiveRemoteNotification userInfo: [NSObject : AnyObject],  fetchCompletionHandler completionHandler: (UIBackgroundFetchResult) -> Void) {
  if application.applicationState == .Inactive {
    PFAnalytics.trackAppOpenedWithRemoteNotificationPayload(userInfo)
  }
}
```
</div>

#### Tracking on OS X

If your OS X application supports receiving push notifications and you'd like to track application opens related to pushes, add hooks to the `application:didReceiveRemoteNotification:` method (as in iOS) and the following to `applicationDidFinishLaunching:`

<div class="language-toggle" markdown="1">
```objective_c
- (void)applicationDidFinishLaunching:(NSNotification *)notification {
  // ... other Parse setup logic here
  [PFAnalytics trackAppOpenedWithRemoteNotificationPayload:[notification userInfo]];
}
```
```swift
func applicationDidFinishLaunching(notification: NSNotification) {
  // ... other Parse setup logic here
  PFAnalytics.trackAppOpenedWithRemoteNotificationPayload(notification.userInfo)
}
```
</div>

#### Tracking Local Notifications (iOS only)

To track analytics around local notifications, note that `application:didReceiveLocalNotification:` is called _in addition to_ `application:didFinishLaunchingWithOptions:`, if implemented. Please be careful to prevent tracking duplicate events.

#### Clearing the Badge

A good time to clear your app's badge is usually when your app is opened. Setting the badge property on the current installation will update the application icon badge number and ensure that the latest badge value will be persisted to the server on the next save. All you need to do is:

<div class="language-toggle" markdown="1">
```objective_c
- (void)applicationDidBecomeActive:(UIApplication *)application {
  PFInstallation *currentInstallation = [PFInstallation currentInstallation];
  if (currentInstallation.badge != 0) {
    currentInstallation.badge = 0;
    [currentInstallation saveEventually];
  }
  // ...
}
```
```swift
func applicationDidBecomeActive(application: UIApplication) {
  let currentInstallation = PFInstallation.currentInstallation()
  if currentInstallation.badge != 0 {
    currentInstallation.badge = 0
    currentInstallation.saveEventually()
  }
  // ...
}
```
</div>

The [UIApplicationDelegate documentation](https://developer.apple.com/reference/uikit/uiapplicationdelegate) contains more information on hooks into an app’s life cycle; the ones which are most relevant for resetting the badge count are  `applicationDidBecomeActive:`,  `application:didFinishLaunchingWithOptions:`,  and `application:didReceiveRemoteNotification:`.

## Push Experiments

You can A/B test your push notifications to figure out the best way to keep your users engaged. With A/B testing, you can simultaneously send two versions of your push notification to different devices, and use each version's push open rates to figure out which one is better.  You can test by either message or send time.

### A/B Testing

Our web push console guides you through every step of setting up an A/B test.

For each push campaign sent through the Parse web push console, you can allocate a subset of your devices to be in the experiment's test audience, which Parse will automatically split into two equally-sized experiment groups. For each experiment group, you can specify a different push message. The remaining devices will be saved so that you can send the winning message to them later. Parse will randomly assign devices to each group to minimize the chance for a test to affect another test's results (although we still don't recommend running multiple A/B tests over the same devices on the same day).

<img alt="Enabling experiments" data-echo="{{ '/assets/images/experiment_enable.png' | prepend: site.baseurl }}"/>

After you send the push, you can come back to the push console to see in real time which version resulted in more push opens, along with other metrics such as statistical confidence interval. It's normal for the number of recipients in each group to be slightly different because some devices that we had originally allocated to that experiment group may have uninstalled the app. It's also possible for the  random group assignment to be slightly uneven when the test audience size is small. Since we calculate open rate separately for each group based on recipient count, this should not significantly affect your experiment results.

<img alt="Getting experiment results" data-echo="{{ '/assets/images/experiment_results.png' | prepend: site.baseurl }}"/>

If you are happy with the way one message performed, you can send that to the rest of your app's devices (i.e. the “Launch Group”). This step only applies to A/B tests where you vary the message.

<img alt="Launching push experiment" data-echo="{{ '/assets/images/experiment_launch.png' | prepend: site.baseurl }}"/>

Push experiments are supported on all recent Parse SDKs (iOS v1.2.13+, OS X v1.7.5+, Android v1.4.0+, .NET v1.2.7+). Before running experiments, you must instrument your app with [push open tracking](#tracking-pushes-and-app-opens).

### Experiment Statistics

Parse provides guidance on how to run experiments to achieve statistically significant results.

#### Test Audience Size

When you setup a push message experiment, we'll recommend the minimum size of your test audience. These recommendations are generated through simulations based on your app's historical push open rates. For big push campaigns (e.g. 100k+ devices), this recommendation is usually small subset of your devices. For smaller campaigns (e.g. < 5k devices), this recommendation is usually all devices. Using all devices for your test audience will not leave any remaining devices for the launch group, but you can still gain valuable insight into what type of messaging works better so you can implement similar messaging in your next push campaign.

#### Confidence Interval

After you send your pushes to experiment groups, we'll also provide a statistical confidence interval when your experiment has collected enough data to have statistically significant results. This confidence interval is in absolute percentage points of push open rate (e.g. if the open rates for groups A and B are 3% and 5%, then the difference is reported as 2 percentage points). This confidence interval is a measure of how much difference you would expect to see between the two groups if you repeat the same experiment many times.

Just after a push send, when only a small number of users have opened their push notifications, the open rate difference you see between groups A and B could be due to random chance, so it might not be reproducible if you run the same experiment again. After your experiment collects more data over time, we become increasingly confident that the observed difference is a true difference. As this happens, the confidence interval will become narrower, allowing us to more accurately estimate the true difference between groups A and B. Therefore, we recommend that you wait until there is enough data to generate a statistical confidence interval before deciding which group's push is better.

## Push Localization

Localizing your app's content is a proven way to drive greater engagement. We've made it easy to localize your push messages with Push Localization. The latest version of the Parse iOS SDK will detect and store the user's language in the installation object, and via the web push console you’ll be able to send localized push messages to your users in a single broadcast.

### Setup for localized push

To take advantage of  Push Localization you will need to make sure you've published your app with the Parse iOS SDK version 1.8.1 or greater. Any users of your application running the Parse iOS SDK version 1.8.1 or greater will then be targetable by Push Localization via the web push console.

It's important to note that for developers who have users running apps with versions of the Parse iOS SDK earlier than 1.8.1 that targeting information for Localized Push will not be available and these users will receive the default message from the push console.

### Sending a localized push

Our web push console guides you through every step of setting up a Localized Push.

## Troubleshooting

Setting up Push Notifications is often a source of frustration for developers. The process is complicated and invites problems to happen along the way. We have created a [tutorial which covers all the necessary steps to configure your app for push notifications](/tutorials/ios-push-notifications). If you run into issues, try some of the following troubleshooting tips.

It's important to break down the system into components when troubleshooting push notification issues. You can start by asking yourself the following questions:

* Is the push notification listed in your push logs?
* Are you targeting your push notification to the correct audience?
* Are your devices registering for push notifications?
* Is your app set up to receive these notifications?

If you're unsure about the answer to any of the above questions, read on!

### Confirm that the push campaign was created

Having everything set up correctly in your Parse app won't help if your request to send a push notification does not reach Parse. The first step in debugging a push issue is to confirm that the push campaign is listed in your push logs. You can find these logs by visiting your app's Dashboard and clicking on Push.

If the push notification campaign is not showing up on that list, the issue is quite simple to resolve. Go back to your push notification sending code and make sure to check for any error responses.

### Verify your Targeting

You have confirmed that the push notification is making it to your push logs. Now what? The next step is to verify if your push notification targeting is correct. Say, if you're debugging why notifications are not reaching a specific device, it's important to make sure that this device is actually included in the targeting of this push notification. You can't deliver something that is not addressed correctly.

In order to do this, you'll have to confirm that the device's Installation object is included in your push notification targeting criteria. This is quite straightforward if you're using channels: all you need to verify is that your device's Installation is subscribed to the channel by checking the channels array. If you're using advanced targeting, e.g. you're using a push query with constraints, you'll have to work a bit more to determine if your targeting is on point.

Basically, you will need to run the same push query you're using for your targeting, and verify that your installation of interest is included in the result set. As you can only query the installation class programmatically using the Master Key, you will need to use one of the Master Key capable SDKs (JavaScript SDK, .NET) or the REST API. Ideally, you would use the same SDK that you're currently using to send the push notifications.

#### Debugging using the REST API

The REST API is quite easy to use for this sort of purpose as you can easily recreate the push query using the information provided in your push notification logs. If you look closely at the “Full Target” value in your push campaign log item, you may notice that it matches the query format for a REST API query. You can grab an example of what a [REST API query]({{ site.baseUrl }}/rest/guide/#query-constraints) over Installations would look like from the REST API docs. Don't forget to use the `X-Parse-Master-Key` header to ensure that the Master Key is used to run this query.

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

You can check the Push Delivery Report for the cause of failed deliveries: Invalid Tokens happens when the user have uninstalled the app or if it is misconfigured, No Certificates is returned when all available certificates were rejected by Apple.

This is a good time to go through your project settings and make sure everything is in order.

* Make sure you are using the correct Bundle Identifier in the `Info.plist` file in your Xcode project. This should match your push certificate bundle identifier as well as your Installation object's bundle identifier.
* Make sure you set the correct provisioning profile in `Project > Build Settings` in Xcode.
* Clean your project and restart Xcode.
* Try regenerating the provisioning profile by navigating to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/overview.action), changing the App ID set on the provisioning profile, and changing it back. You will need to reinstall the profile as described in step two of the tutorial (Creating the Provisioning Profile) and set it in your Project's Build Settings.
* Open the Xcode Organizer and delete all expired and unused provisioning profiles from both your computer and your iOS device.
* When enabling push notifications for an existing App ID in the Apple iOS Provisioning Portal, make sure to regenerate the provisioning profile, then add the updated profile to the Xcode Organizer.
* Distribution push notifications need to be enabled prior to submitting an app to the App Store. Make sure you have followed Section 7 of the tutorial, "Preparing for the App Store", prior to submitting your app. If you skipped any of these steps, you might need to submit a new binary to the App Store.
* Double check that your app can receive distribution push notifications when signed with an Ad Hoc profile. This configuration is the closest you can get to an App Store provisioned app.

If everything compiles and runs with no errors, but you are still not receiving pushes:

* Check that the device token registration call is being called successfully when the user opts in to push notifications. Your device must successfully register an Installation object with a valid device token.
* Make sure that your app has been given permission to receive notifications. You can verify this in your iOS device's `Settings > Notification > YourAppName`.
* If your app has been granted permission to receive push notifications, make sure that you are code signing your app with the correct provisioning profile.
* If you have uploaded a Development Push Notification Certificate to Parse, you will only receive push notifications if you built your app with a Development Provisioning Profile.
* If you have uploaded a Production Push Notification Certificate, you should sign your app with a Distribution Provisioning Profile. Ad Hoc and App Store Distribution Provisioning Profiles should both work when your app is configured with a Production Push Notification Certificate.
* Make sure that all of the push certificates that you've uploaded to Parse are valid. Check and see if there are any expired push certificates that may be preventing your push from being delivered to all your recipients successfully.

If your app has been released for a while, it is expected that a percentage of your user base will have opted out of push notifications from your app or uninstalled your app from their device. Parse does not automatically delete installation objects in either of these cases. When a push campaign is sent out, Parse will detect uninstalled installations and exclude them from the total count of push notifications sent. The recipient estimate on the push composer is based on the estimated number of installations that match your campaign's targeting criteria. With that in mind, it is possible for the recipient estimate to be higher than the number of push notifications that is sent as reported by the push campaign status page.

### Handling Push Notifications

If everything looks great so far, but push notifications are not showing up on your phone, there are a few more things you can check. For example, if your app is in the foreground when the push notification is received, an alert will not be displayed by default. You will need to handle the incoming push notification and perform the necessary action as documented in [Responding to the Payload]({{ site.baseUrl }}/ios/guide/#responding-to-the-payload).

If your app is not running in the foreground and the push notification is not showing up, make sure that you're specifying an "alert" key in your payload. Otherwise, the push notification will be treated as a silent push notification.

When using `content-available` to send silent push notifications, keep in mind that APNS may throttle push notifications sent to the same device token within a short period of time.
