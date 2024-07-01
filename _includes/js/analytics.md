# Analytics

Parse provides a number of hooks for you to get a glimpse into the ticking heart of your app. We understand that it's important to understand what your app is doing, how frequently, and when.

While this section will cover different ways to instrument your app to best take advantage of Parse's analytics backend, developers using Parse to store and retrieve data can already take advantage of metrics on Parse.

Without having to implement any client-side logic, you can view real-time graphs and breakdowns (by device type, Parse class name, or REST verb) of your API Requests in your app's dashboard and save these graph filters to quickly access just the data you're interested in.


## Custom Analytics

`Parse.Analytics` also allows you to track free-form events, with a handful of `string` keys and values. These extra dimensions allow segmentation of your custom events via your app's Dashboard.

Say your app offers search functionality for apartment listings, and you want to track how often the feature is used, with some additional metadata.

```javascript
const dimensions = {
  // Define ranges to bucket data points into meaningful segments
  priceRange: '1000-1500',
  // Did the user filter the query?
  source: 'craigslist',
  // Do searches happen more often on weekdays or weekends?
  dayType: 'weekday'
};
// Send the dimensions to Parse along with the 'search' event
Parse.Analytics.track('search', dimensions);
```

`Parse.Analytics` can even be used as a lightweight error tracker &mdash; simply invoke the following and you'll have access to an overview of the rate and frequency of errors, broken down by error code, in your application:

```javascript
const codeString = '' + error.code;
Parse.Analytics.track('error', { code: codeString });
```

Note that Parse currently only stores the first eight dimension pairs per call to `Parse.Analytics.track()`.
