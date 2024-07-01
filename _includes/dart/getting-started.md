# Getting Started

- To install the Parse Dart SDK add it to your app as a dependency via the [pub.dev](https://pub.dev/packages/parse_server_sdk/install) registry.

Once you have the SDK added as a dependency, initialize the SDK as early as possible in your application (e.g. in your application class) like this:

```dart
await Parse().initialize(
    keyApplicationId,
    keyParseServerUrl,
);
```

If you want to use secure storage or use the Flutter web/desktop SDK, please change to the below instance of  `CoreStorage` as it has no dependencies on Flutter. `CoreStoreSembastImp` does not encrypt the data on the web and Web is not safe anyway. Encrypt fields manually as needed.

```dart
await Parse().initialize(
  	keyParseApplicationId, 
  	keyParseServerUrl,
        coreStore: await CoreStoreSembastImp.getInstance("/data"));
```

It's possible to add other parameters to work with your instance of Parse Server:

```dart
await Parse().initialize(
    keyApplicationId,
    keyParseServerUrl,
    clientKey: keyParseClientKey, // Required for some setups
    debug: true, // When enabled, prints logs to console
    liveQueryUrl: keyLiveQueryUrl, // Required if using LiveQuery 
    autoSendSessionId: true, // Required for authentication and ACL
    securityContext: securityContext, // Again, required for some setups
    coreStore: CoreStoreMemoryImp()); // Non persistent mode (default): Sdk will store everything in memory instead of using Sembast as an internal DB.
```

⚠️ The master key should only be used in safe environments and never on client side. Using this package on a server should be fine.

## Early Web Support

Due to Cross-Origin Resource Sharing (CORS) restrictions, web support requires adding `X-Parse-Installation-Id` as an allowed header in the Parse Server configuration:

- When running directly via docker, set the env var `PARSE_SERVER_ALLOW_HEADERS=X-Parse-Installation-Id`.
- When running via express, set the [Parse Server option](https://parseplatform.org/parse-server/api/master/ParseServerOptions.html) `allowHeaders: ['X-Parse-Installation-Id']`.

## Desktop Support (macOS)

The security entitlements posed by the macOS framework require that your app is granted permission to open outgoing network connections, so that the Parse Flutter SDK can communicate with Parse Server. To grant this permission, add the following code:

```swift
<key>com.apple.security.network.client</key>
<true/>
```

to the following files:

```
/macOS/Runner/Release.entitlements
/macOS/Runner/DebugProfile.entitlements
```

## Network client

By default, this SDK uses the `ParseHTTPClient`. Another option is use `ParseDioClient`. This client supports the most features (for example a progress callback at the file upload), but a benchmark has shown that dio is slower than http on web.

If you want to use the `ParseDioClient`, which uses the dio network library, you can provide a custom `ParseClientCreator` at the initialization of the SDK:

```dart
await Parse().initialize(
  //...
  clientCreator: ({bool? sendSessionId, SecurityContext? securityContext}) => ParseDioClient(sendSessionId: sendSessionId, securityContext: securityContext),
);
```