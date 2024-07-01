# Cloud Code

The SDK supports calling [Cloud Functions](https://docs.parseplatform.org/cloudcode/guide/#cloud-functions).

Execute a Cloud Function that returns a `ParseObject`:

```dart
final ParseCloudFunction function = ParseCloudFunction('hello');
final ParseResponse result =
    await function.executeObjectFunction<ParseObject>();
if (result.success) {
  if (result.result is ParseObject) {
    final ParseObject parseObject = result.result;
    print(parseObject.className);
  }
}
```

Execute a Cloud Function with parameters:

```dart
final ParseCloudFunction function = ParseCloudFunction('hello');
final Map<String, String> params = <String, String>{'plan': 'paid'};
function.execute(parameters: params);
```
