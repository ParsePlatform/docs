# Cloud Functions

Cloud Functions allow you to run custom app logic on your Parse Server. This is especially useful for running complex app logic in the cloud so that you can reduce the memory footprint of your code on the IoT device. In a Cloud Function, you can query/save Parse data, send push notifications, and log analytics events.

You write your Cloud Code in JavaScript using the Parse JavaScript SDK. See our [Cloud Code guide]({{ site.baseUrl }}/cloudcode/guide/) for details.

For example, you define a Cloud Function as below.

```cpp
Parse.Cloud.define("hello", request => {
	return request.body;
});
```

Then you can invoke this Cloud Function from your device:

```cpp
void myCloudFunctionCallback(ParseClient client, int error, int httpStatus, const char* httpResponseBody) {
	if (error == 0 && httpResponseBody != NULL) {
		// httpResponseBody holds the Cloud Function response
	}
}
parseSendRequest(client, "POST", "/parse/functions/hello", "{\"value\":\"echo\"}", myCloudFunctionCallback);
```
