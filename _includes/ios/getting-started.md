# Getting Started

The easiest way to integrate the Parse SDK into your iOS, iPadOS, macOS, watchOS, tvOS app is via Swift Package Manager (SPM).

1. Open Xcode > File > Add packages...
2. Add the following package URL:

```
https://github.com/parse-community/Parse-SDK-iOS-OSX
```

**Note: You may have to add submodules under Link Binary with Libraries**

To initialize the Parse client, add the following to your AppDelegate.swift file (AppDelegate.m for Objective-C), in the `application:didFinishLaunchingWithOptions:` method.

<div class="language-toggle" markdown="1">
```objective_c
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
 [Parse initializeWithConfiguration:[ParseClientConfiguration configurationWithBlock:^(id<ParseMutableClientConfiguration> configuration) {
        configuration.applicationId = @"parseAppId";
        configuration.clientKey = @"parseClientKey";
        configuration.server = @"parseServerUrlString";
    }]];
	return YES;
}
```
```swift
func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
        let parseConfig = ParseClientConfiguration {
            $0.applicationId = "parseAppId"
            $0.clientKey = "parseClientKey"
            $0.server = "parseServerUrlString"
        }
        Parse.initialize(with: parseConfig)
        return true
}
```
</div>

Make sure to import the Parse module at the top of any file in which you want to use the Parse SDK by including the follwing.

<div class="language-toggle" markdown="1">
```objective_c
@import ParseCore;
```
```swift
import ParseCore
```
</div>
