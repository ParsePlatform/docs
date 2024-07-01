# Config

The SDK supports [Parse Config](https://docs.parseplatform.org/cloudcode/guide/#config). A map of config parameters can be retrieved from Parse Server with:

```dart
var response = await ParseConfig().getConfigs();
```

To add a new parameter to Parse Config:

```dart
ParseConfig().addConfig('TestConfig', 'testing');
```