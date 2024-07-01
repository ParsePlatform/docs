#### Register Device for Push Notifications

Open up your `AppDelegate.swift`, `AppDelegate.m`, or `AppDelegate.cs` file and make your app register for remote notifications by adding the following in your `application:didFinishLaunchingWithOptions:` function:

```swift
// Swift
let types: UIUserNotificationType = [.Alert, .Badge, .Sound]
let settings = UIUserNotificationSettings(forTypes: types, categories: nil)
application.registerUserNotificationSettings(settings)
application.registerForRemoteNotifications()
```

```objc
// Objective-C
UIUserNotificationType userNotificationTypes = (UIUserNotificationTypeAlert |
UIUserNotificationTypeBadge |
UIUserNotificationTypeSound);
UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:userNotificationTypes
categories:nil];
[application registerUserNotificationSettings:settings];
[application registerForRemoteNotifications];
```

```csharp
// Xamarin
UIUserNotificationType notificationTypes = (UIUserNotificationType.Alert |
UIUserNotificationType.Badge |
UIUserNotificationType.Sound);
var settings = UIUserNotificationSettings.GetSettingsForTypes(notificationTypes,
new NSSet(new string[] { }));
UIApplication.SharedApplication.RegisterUserNotificationSettings(settings);
UIApplication.SharedApplication.RegisterForRemoteNotifications();

// Handle Push Notifications
ParsePush.ParsePushNotificationReceived += (object sender, ParsePushNotificationEventArgs args) => {
  // Process Push Notification payload here.
};
```

Store the device token and handle the UI for notifications by adding the following to your main app delegate:

```swift
// Swift
func application(application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: NSData) {
    let installation = PFInstallation.currentInstallation()
    installation.setDeviceTokenFromData(deviceToken)
    installation.saveInBackground()
}

func application(application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: NSError) {
    if error.code == 3010 {
        print("Push notifications are not supported in the iOS Simulator.")
    } else {
        print("application:didFailToRegisterForRemoteNotificationsWithError: %@", error)
    }
}

func application(application: UIApplication, didReceiveRemoteNotification userInfo: [NSObject : AnyObject]) {
    PFPush.handlePush(userInfo)
}
```

```objc
// Objective-C
UIUserNotificationType userNotificationTypes = (UIUserNotificationTypeAlert |
                                                UIUserNotificationTypeBadge |
                                                UIUserNotificationTypeSound);
UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:userNotificationTypes
                                                                         categories:nil];
[application registerUserNotificationSettings:settings];
[application registerForRemoteNotifications];
```

```csharp
// Xamarin
UIUserNotificationType notificationTypes = (UIUserNotificationType.Alert |
                                            UIUserNotificationType.Badge |
                                            UIUserNotificationType.Sound);
var settings = UIUserNotificationSettings.GetSettingsForTypes(notificationTypes,
                                                              new NSSet(new string[] { }));
UIApplication.SharedApplication.RegisterUserNotificationSettings(settings);
UIApplication.SharedApplication.RegisterForRemoteNotifications();

// Handle Push Notifications
ParsePush.ParsePushNotificationReceived += (object sender, ParsePushNotificationEventArgs args) => {
  // Process Push Notification payload here.
};
```

##### Compile and run!

If you configured your app correctly, installation objects will automatically be saved to Parse Server when you run your app. You can run this curl command to verify:

```curl
curl -X GET \
  -H "X-Parse-Application-Id: YOUR_APP_ID" \
  -H "X-Parse-Master-Key: YOUR_MASTER_KEY" \
  http://your_parse_server:1337/parse/installations
```

##### Proceed to [Step 4](http://docs.parseplatform.org/parse-server/guide/#4-send-push-notifications).
