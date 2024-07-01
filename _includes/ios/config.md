# Config

## Parse Config

`PFConfig` is a way to configure your applications remotely by storing a single configuration object on Parse. It enables you to add things like feature gating or a simple "Message of the Day". To start using `PFConfig` you need to add a few key/value pairs (parameters) to your app on the Parse Config Dashboard.

<img alt="Configuration Editor" data-echo="{{ '/assets/images/config_editor.png' | prepend: site.baseurl }}"/>

After that you will be able to fetch the `PFConfig` on the client, like in this example:

<div class="language-toggle" markdown="1">
```objective_c
[PFConfig getConfigInBackgroundWithBlock:^(PFConfig *config, NSError *error) {
  NSNumber *number = config[@"winningNumber"];
  NSLog(@"Yay! The number is %@!", [number stringValue]);
}];
```
```swift
PFConfig.getConfigInBackgroundWithBlock {
  (config: PFConfig?, error: NSError?) -> Void in
  let number = config?["winningNumber"] as? Int
  print("Yay! The number is \(number)!")
}
```
</div>

## Retrieving Config

`PFConfig` is built to be as robust and reliable as possible, even in the face of poor internet connections. Caching is used by default to ensure that the latest successfully fetched config is always available. In the below example we use `getConfigInBackgroundWithBlock` to retrieve the latest version of config from the server, and if the fetch fails we can simply fall back to the version that we successfully fetched before via `currentConfig`.

<div class="language-toggle" markdown="1">
```objective_c
NSLog(@"Getting the latest config...");
[PFConfig getConfigInBackgroundWithBlock:^(PFConfig *config, NSError *error) {
  if (!error) {
    NSLog(@"Yay! Config was fetched from the server.");
  } else {
    NSLog(@"Failed to fetch. Using Cached Config.");
    config = [PFConfig currentConfig];
  }

  NSString *welcomeMessage = config[@"welcomeMessage"];
  if (!welcomeMessage) {
    NSLog(@"Falling back to default message.");
    welcomeMessage = @"Welcome!";
  }
  NSLog(@"Welcome Messsage = %@", welcomeMessage);
}];
```
```swift
print("Getting the latest config...");
PFConfig.getConfigInBackgroundWithBlock {
  (var config: PFConfig?, error: NSError?) -> Void in
  if error == nil {
    print("Yay! Config was fetched from the server.")
  } else {
    print("Failed to fetch. Using Cached Config.")
    config = PFConfig.currentConfig()
  }

  var welcomeMessage: NSString? = config?["welcomeMessage"] as? NSString
  if let welcomeMessage = welcomeMessage {
    print("Welcome Message = \(welcomeMessage)!")
  } else {
    print("Falling back to default message.")
    welcomeMessage = "Welcome!";
  }
};
```
</div>

## Current Config

Every `PFConfig` instance that you get is always immutable. When you retrieve a new `PFConfig` in the future from the network, it will not modify any existing `PFConfig` instance, but will instead create a new one and make it available via `[PFConfig currentConfig]`. Therefore, you can safely pass around any `PFConfig` object and safely assume that it will not automatically change.

It might be troublesome to retrieve the config from the server every time you want to use it. You can avoid this by simply using the cached `currentConfig` object and fetching the config only once in a while.

<div class="language-toggle" markdown="1">
```objective_c
// Fetches the config at most once every 12 hours per app runtime
const NSTimeInterval configRefreshInterval = 12.0 * 60.0 * 60.0;
static NSDate *lastFetchedDate;
if (lastFetchedDate == nil ||
    [lastFetchedDate timeIntervalSinceNow] * -1.0 > configRefreshInterval) {
  [PFConfig getConfigInBackgroundWithBlock:nil];
  lastFetchedDate = [NSDate date];
}
```
```swift
// Fetches the config at most once every 12 hours per app runtime
let configRefreshInterval: NSTimeInterval  = 12.0 * 60.0 * 60.0
struct DateSingleton {
    static var lastFetchedDate: NSDate? = nil
}
let date: NSDate? = DateSingleton.lastFetchedDate;
if date == nil ||
   date!.timeIntervalSinceNow * -1.0 > configRefreshInterval {
  PFConfig.getConfigInBackgroundWithBlock(nil);
  DateSingleton.lastFetchedDate = NSDate();
}
```
</div>

## Parameters

`PFConfig`  supports most of the data types supported by `PFObject`:

*   NSString
*   NSNumber
*   NSDate
*   PFFileObject
*   PFGeoPoint
*   NSArray
*   NSDictionary

We currently allow up to **100** parameters in your config and a total size of **128KB** across all parameters.
