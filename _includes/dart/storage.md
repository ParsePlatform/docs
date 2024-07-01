# Storage

We now have 2 types of storage, secure and unsecure. We currently rely on 2 third party options:

- SharedPreferences
- Sembast

Sembast offers secured storage, whilst `SharePreferences` wraps `NSUserDefaults` (on iOS) and `SharedPreferences` (on Android).

The storage method is defined in the parameter `coreStore` in  `Parse().initialize`