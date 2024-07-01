# Keys

Parse Server does not require the use of client-side keys. This includes the client key, JavaScript key, .NET key, and REST API key. The Application ID is sufficient to secure your app.

However, you have the option to specify any of these four keys upon initialization. Upon doing so, Parse Server will enforce that any clients passing a key matches. The behavior is consistent with hosted Parse.

## Read-Only masterKey

Starting `parse-server` 2.6.5, it is possible to specify a `readOnlyMasterKey`. When using this key instead of the masterKey, the server will perform all `read` operations as if they were executing with the `masterKey` but will fail to execute any `write` operation.

This key is especially powerful when used with `parse-dashboard`. Please refer to [Parse Dashboard](https://github.com/parse-community/parse-dashboard/)'s documentation for more information.
