# Error Codes

The following is a list of all the error codes that can be returned by the Parse API. You may also refer to [RFC2616](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) for a list of http error codes. Make sure to check the error message for more details.

## API Issues

| Name                             | Code | Description                                                   |
|----------------------------------|------|---------------------------------------------------------------|
| `UserInvalidLoginParams`	       |  101 | Invalid login parameters. Check error message for more details.                           |
| `ObjectNotFound`	               |  101 | The specified object or session doesn't exist or could not be found. Can also indicate that you do not have the necessary permissions to read or write this object. Check error message for more details.                           |
| `InvalidQuery`	                 |  102 | There is a problem with the parameters used to construct this query. This could be an invalid field name or an invalid field type for a specific constraint. Check error message for more details.  |
| `InvalidClassName`               |  103 | Missing or invalid classname. Classnames are case-sensitive. They must start with a letter, and a-zA-Z0-9_ are the only valid characters. |
| `MissingObjectId`	               |  104 | An unspecified object id. |
| `InvalidFieldName`	             |  105 | An invalid field name. Keys are case-sensitive. They must start with a letter, and a-zA-Z0-9_ are the only valid characters. Some field names may be reserved. Check error message for more details. |
| `InvalidPointer`	               |  106 | A malformed pointer was used. You would typically only see this if you have modified a client SDK. |
| `InvalidJSON`                    |  107 | Badly formed JSON was received upstream. This either indicates you have done something unusual with modifying how things encode to JSON, or the network is failing badly. Can also indicate an invalid utf-8 string or use of multiple form encoded values. Check error message for more details.  |
| `CommandUnavailable`	           |  108 | The feature you tried to access is only available internally for testing purposes. |
| `NotInitialized`	               |  109 | You must call Parse.initialize before using the Parse library. Check the Quick Start guide for your platform. |
| `ObjectTooLarge`	               |  116 | The object is too large. |
| `ExceededConfigParamsError`      |  116 | You have reached the limit of 100 config parameters. |
| `InvalidLimitError`	             |  117 | An invalid value was set for the limit. Check error message for more details. |
| `InvalidSkipError`	             |  118 | An invalid value was set for skip. Check error message for more details. |
| `OperationForbidden`	           |  119 | The operation isn't allowed for clients due to class-level permissions. Check error message for more details. |
| `CacheMiss`	                     |  120 | The result was not found in the cache. |
| `InvalidNestedKey`	             |  121 | An invalid key was used in a nested JSONObject. Check error message for more details. |
| `InvalidACL`	                   |  123 | An invalid ACL was provided. |
| `InvalidEmailAddress`	           |  125 | The email address was invalid. |
| `DuplicateValue`	               |  137 | Unique field was given a value that is already taken. |
| `InvalidRoleName`	               |  139 | Role's name is invalid. |
| `ReservedValue`	                 |  139 | Field value is reserved. |
| `ExceededCollectionQuota`        |  140 | You have reached the quota on the number of classes in your app. Please delete some classes if you need to add a new class. |
| `ScriptFailed`	                 |  141 | Cloud Code script failed. Usually points to a JavaScript error. Check error message for more details. |
| `FunctionNotFound`	             |  141 | Cloud function not found. Check that the specified Cloud function is present in your Cloud Code script and has been deployed. |
| `JobNotFound`	                   |  141 | Background job not found. Check that the specified job is present in your Cloud Code script and has been deployed. |
| `ValidationFailed`	             |  142 | Cloud Code validation failed. |
| `WebhookError`	                 |  143 | Webhook error. |
| `InvalidImageData`	             |  150 | Invalid image data. |
| `UnsavedFileError`	             |  151 | An unsaved file. |
| `InvalidPushTimeError`	         |  152 | An invalid push time was specified. |
| `HostingError`                   |  158 | Hosting error. |
| `InvalidEventName`	             |  160 | The provided analytics event name is invalid. |
| `ClassNotEmpty`       	         |  255 | Class is not empty and cannot be dropped. |
| `AppNameInvalid`	               |  256 | App name is invalid. |
| `MissingAPIKeyError`	           |  902 | The request is missing an API key.       |
| `InvalidAPIKeyError`	           |  903 | The request is using an invalid API key. |
{: .docs_table}

## Push related errors

| Name                             | Code | Description                                                   |
|----------------------------------|------|---------------------------------------------------------------|
| `IncorrectType`	                 |  111 | A field was set to an inconsistent type. Check error message for more details. |
| `InvalidChannelName`	           |  112 | Invalid channel name. A channel name is either an empty string (the broadcast channel) or contains only a-zA-Z0-9_ characters and starts with a letter. |
| `InvalidSubscriptionType`	       |  113 | Bad subscription type. Check error message for more details. |
| `InvalidDeviceToken`	           |  114 | The provided device token is invalid. |
| `PushMisconfigured`	             |  115 | Push is misconfigured in your app.  Check error message for more details. |
| `PushWhereAndChannels`	         |  115 | Can't set channels for a query-targeted push. You can fix this by moving the channels into your push query constraints. |
| `PushWhereAndType`	             |  115 | Can't set device type for a query-targeted push. You can fix this by incorporating the device type constraints into your push query. |
| `PushMissingData`	               |  115 | Push is missing a 'data' field. |
| `PushMissingChannels`	           |  115 | Non-query push is missing a 'channels' field. Fix by passing a 'channels' or 'query' field. |
| `ClientPushDisabled`	           |  115 | Client-initiated push is not enabled. Check your Parse app's push notification settings. |
| `RestPushDisabled`	             |  115 | REST-initiated push is not enabled. Check your Parse app's push notification settings. |
| `ClientPushWithURI`	             |  115 | Client-initiated push cannot use the "uri" option. |
| `PushQueryOrPayloadTooLarge`	   |  115 | Your push query or data payload is too large. Check error message for more details. |
| `InvalidExpirationError`	       |  138 | Invalid expiration value. |
| `MissingPushIdError`	           |  156 | A push id is missing. Deprecated. |
| `MissingDeviceTypeError`         |  157 | The device type field is missing. Deprecated. |
{: .docs_table}

## File related errors

| Name                             | Code | Description                                                   |
|----------------------------------|------|---------------------------------------------------------------|
| `InvalidFileName`	               |  122 | An invalid filename was used for Parse File. A valid file name contains only a-zA-Z0-9_. characters and is between 1 and 128 characters. |
| `MissingContentType`	           |  126 | Missing content type. |
| `MissingContentLength`	         |  127 | Missing content length. |
| `InvalidContentLength`	         |  128 | Invalid content length. |
| `FileTooLarge`	                 |  129 | File size exceeds maximum allowed. |
| `FileSaveError`	                 |  130 | Error saving a file. |
| `FileDeleteError`	               |  153 | File could not be deleted. |
| `FileDeleteUnnamedError`	               |  161 | Unnamed file could not be deleted. |
{: .docs_table}

## Installation related errors

| Name                             | Code | Description                                                   |
|----------------------------------|------|---------------------------------------------------------------|
| `InvalidInstallationIdError`	   |  132 | Invalid installation id. |
| `InvalidDeviceTypeError`         |  133 | Invalid device type. |
| `InvalidChannelsArrayError`	     |  134 | Invalid channels array value. |
| `MissingRequiredFieldError`	     |  135 | Required field is missing. |
| `ChangedImmutableFieldError`	   |  136 | An immutable field was changed. |
{: .docs_table}

## Purchase related errors

| Name                             | Code | Description                                                   |
|----------------------------------|------|---------------------------------------------------------------|
| `ReceiptMissing`	               |  143 | Product purchase receipt is missing. |
| `InvalidPurchaseReceipt`	       |  144 | Product purchase receipt is invalid. |
| `PaymentDisabled`                |  145 | Payment is disabled on this device. |
| `InvalidProductIdentifier`       |  146 | The product identifier is invalid. |
| `ProductNotFoundInAppStore`	     |  147 | The product is not found in the App Store. |
| `InvalidServerResponse`	         |  148 | The Apple server response is not valid. |
| `ProductDownloadFilesystemError` |  149 | The product fails to download due to file system error. |
{: .docs_table}

## User related errors

| Name                             | Code | Description                                                   |
|----------------------------------|------|---------------------------------------------------------------|
| `UsernameMissing`	               |  200 | The username is missing or empty. |
| `PasswordMissing`           	   |  201 | The password is missing or empty. |
| `UsernameTaken`             	   |  202 | The username has already been taken. |
| `UserEmailTaken`	               |  203 | Email has already been used. |
| `UserEmailMissing`           	   |  204 | The email is missing, and must be specified. |
| `UserWithEmailNotFound`          |  205 | A user with the specified email was not found. |
| `SessionMissing`	               |  206 | A user object without a valid session could not be altered. |
| `MustCreateUserThroughSignup`    |  207 | A user can only be created through signup. |
| `AccountAlreadyLinked`	         |  208 | An account being linked is already linked to another user. |
| `InvalidSessionToken`	           |  209 | The device's session token is no longer valid. The application should ask the user to log in again. |
{: .docs_table}

## Linked services errors

| Name                             | Code | Description                                                   |
|----------------------------------|------|---------------------------------------------------------------|
| `LinkedIdMissing`	               |  250 | A user cannot be linked to an account because that account's id could not be found. |
| `InvalidLinkedSession`	         |  251 | A user with a linked (e.g. Facebook or Twitter) account has an invalid session. Check error message for more details. |
| `InvalidGeneralAuthData`	       |  251 | Invalid auth data value used. |
| `BadAnonymousID`	               |  251 | Anonymous id is not a valid lowercase UUID. |
| `FacebookBadToken`	             |  251 | The supplied Facebook session token is expired or invalid. |
| `FacebookBadID`	                 |  251 | A user with a linked Facebook account has an invalid session. |
| `FacebookWrongAppID`	           |  251 | Unacceptable Facebook application id. |
| `TwitterVerificationFailed`	     |  251 | Twitter credential verification failed. |
| `TwitterWrongID`	               |  251 | Submitted Twitter id does not match the id associated with the submitted access token. |
| `TwitterWrongScreenName`	       |  251 | Submitted Twitter handle does not match the handle associated with the submitted access token. |
| `TwitterConnectFailure`	         |  251 | Twitter credentials could not be verified due to problems accessing the Twitter API. |
| `UnsupportedService`	           |  252 | A service being linked (e.g. Facebook or Twitter) is unsupported. Check error message for more details. |
| `UsernameSigninDisabled`         |  252 | Authentication by username and password is not supported for this application. Check your Parse app's authentication settings. |
| `AnonymousSigninDisabled`        |  252 | Anonymous users are not supported for this application. Check your Parse app's authentication settings. |
| `FacebookSigninDisabled`         |  252 | Authentication by Facebook is not supported for this application. Check your Parse app's authentication settings. |
| `TwitterSigninDisabled`          |  252 | Authentication by Twitter is not supported for this application. Check your Parse app's authentication settings. |
| `InvalidAuthDataError`	         |  253 | An invalid authData value was passed. Check error message for more details. |
| `LinkingNotSupportedError`       |  999 | Linking to an external account not supported yet with signup_or_login. Use update instead. |
{: .docs_table}

## Client-only errors

| Name                             | Code | Description                                                   |
|----------------------------------|------|---------------------------------------------------------------|
| `ConnectionFailed`	             |  100 | The connection to the Parse servers failed.                   |
| `AggregateError`                 |  600 | There were multiple errors. Aggregate errors have an "errors" property, which is an array of error objects with more detail about each error that occurred. |
| `FileReadError `                 |  601 | Unable to read input for a Parse File on the client. |
| `XDomainRequest`                 |  602 | A real error code is unavailable because we had to use an XDomainRequest object to allow CORS requests in Internet Explorer, which strips the body from HTTP responses that have a non-2XX status code. |
{: .docs_table}

## Operational issues

| Name                             | Code | Description                                                   |
|----------------------------------|------|---------------------------------------------------------------|
| `RequestTimeout`                 |  124 | The request was slow and timed out. Typically this indicates that the request is too expensive to run. You may see this when a Cloud function did not finish before timing out, or when a `Parse.Cloud.httpRequest` connection times out.  |
| `InefficientQueryError`	         |  154 | An inefficient query was rejected by the server. Refer to the Performance Guide and slow query log. |
{: .docs_table}

## Other issues

| Name                             | Code | Description                                                     |
|----------------------------------|------|-----------------------------------------------------------------|
| `OtherCause`	                   |   -1 | An unknown error or an error unrelated to Parse occurred.       |
| `InternalServerError`	           |    1 | Internal server error. No information available.                |
| `ServiceUnavailable`	           |    2 | The service is currently unavailable.                           |
| `ClientDisconnected`	           |    4 | Connection failure.                                             |
{: .docs_table}

## Error Code Ranges

In order to provide better organization and avoid conflicts with Parse Platform's built-in `Parse.Error` codes, the following ranges are defined:

### Parse Server and Related Modules

- Error code range: `<= 4999` (including negative numbers)
- This range is reserved exclusively for errors generated by Parse Server and its directly related modules. It includes all predefined errors listed in the documentation.

### Reserved

- Error code range: `>= 5000 and <= 8999`
- This range is currently reserved for future use and should not be used by anyone.

### App Developers (Custom App Errors)

- Error code range: `>= 9000 and <= 9999`
- Developers may use this range for defining custom errors specific to their applications. This range is reserved to ensure that custom application errors do not conflict with those defined by Parse Server and its modules.

### 3rd Party Providers of Parse Platform Components

- We discourage from introducing new custom error codes in 3rd party components, as they may conflict with either of the reserved ranges mentioned above. Instead, use the general internal Parse Server error code `1` and add any specific information in the error message, or use another pre-defined error code of Parse Platform.