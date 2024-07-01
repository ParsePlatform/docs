# Analytics

Parse provides a number of hooks for you to get a glimpse into the ticking heart of your app. We understand that it's important to understand what your app is doing, how frequently, and when.

While this section will cover different ways to instrument your app to best take advantage of Parse's analytics backend, developers using Parse to store and retrieve data can already take advantage of metrics on Parse.

Without having to implement any client-side logic, you can view real-time graphs and breakdowns (by device type, Parse class name, or REST verb) of your API Requests in your app's dashboard and save these graph filters to quickly access just the data you're interested in.

## App-Open & Push Analytics

Our initial analytics hook allows you to track your application being launched. By adding the following line to `applicationDidFinishLaunching:`, you'll begin to collect data on when and how often your application is opened.

<div class="language-toggle" markdown="1">
```objective_c
// in iOS
[PFAnalytics trackAppOpenedWithLaunchOptions:launchOptions];

// in OS X
[PFAnalytics trackAppOpenedWithLaunchOptions:nil];
```
```swift
// in iOS
PFAnalytics.trackAppOpened(launchOptions: launchOptions)

// in OS X
PFAnalytics.trackAppOpenedWithLaunchOptions(nil)
```
</div>

## Custom Analytics

`PFAnalytics` also allows you to track free-form events, with a handful of `NSString` keys and values. These extra dimensions allow segmentation of your custom events via your app's Dashboard.

Say your app offers search functionality for apartment listings, and you want to track how often the feature is used, with some additional metadata.

<div class="language-toggle" markdown="1">
```objective_c
NSDictionary *dimensions = @{
  // Define ranges to bucket data points into meaningful segments
  @"priceRange": @"1000-1500",
  // Did the user filter the query?
  @"source": @"craigslist",
  // Do searches happen more often on weekdays or weekends?
  @"dayType": @"weekday"
};
// Send the dimensions to Parse along with the 'search' event
[PFAnalytics trackEvent:@"search" dimensions:dimensions];
```
```swift
let dimensions = [
  // Define ranges to bucket data points into meaningful segments
  "priceRange": "1000-1500",
  // Did the user filter the query?
  "source": "craigslist",
  // Do searches happen more often on weekdays or weekends?
  "dayType": "weekday"
]
// Send the dimensions to Parse along with the 'search' event
PFAnalytics.trackEvent("search", dimensions:dimensions)
```
</div>

`PFAnalytics` can even be used as a lightweight error tracker — simply invoke the following and you'll have access to an overview of the rate and frequency of errors, broken down by error code, in your application:

<div class="language-toggle" markdown="1">
```objective_c
NSString *codeString = [NSString stringWithFormat:@"%d", [error code]];
[PFAnalytics trackEvent:@"error" dimensions:@{ @"code": codeString }];
```
```swift
let codeString = NSString(format:"%@", error.code)
PFAnalytics.trackEvent("error", dimensions:["code": codeString])
```
</div>

Note that Parse currently only stores the first eight dimension pairs per call to `trackEvent:dimensions:`.
