# Sessions

Sessions represent an instance of a user logged into a device. Sessions are automatically created when users log in or sign up. They are automatically deleted when users log out. There is one distinct `Session` object for each user-installation pair; if a user issues a login request from a device they're already logged into, that user's previous `Session` object for that Installation is automatically deleted. `Session` objects are stored on Parse in the Session class, and you can view them on the Parse Dashboard Data Browser. We provide a set of APIs to manage `Session` objects in your app.

`Session` is a subclass of a Parse `Object`, so you can query, update, and delete sessions in the same way that you manipulate normal objects on Parse. Because Parse Server automatically creates sessions when you log in or sign up users, you should not manually create `Session` objects unless you are building an IoT app (e.g. Arduino or Embedded C). Deleting a `Session` will log the user out of the device that is currently using this session's token.

Unlike other Parse objects, the `Session` class does not have Cloud Code triggers. So you cannot register a `beforeSave` or `afterSave` handler for the Session class.

## `Session` Properties

The `Session` object has these special fields:

* `sessionToken` (readonly): String token for authentication on Parse API requests. In the response of `Session` queries, only your current `Session` object will contain a session token.
* `user`: (readonly) Pointer to the `User` object that this session is for.
* `createdWith` (readonly): Information about how this session was created (e.g. `{ "action": "login", "authProvider": "password"}`).
    * `action` could have values: `login`, `signup`, `create`, or `upgrade`. The `create` action is when the developer manually creates the session by saving a `Session` object.  The `upgrade` action is when the user is upgraded to revocable session from a legacy session token.
    * `authProvider` could have values: `password`, `anonymous`, `facebook`, or `twitter`.
* `expiresAt` (readonly): Approximate UTC date when this `Session` object will be automatically deleted. You can configure session expiration settings (either 1-year inactivity expiration or no expiration) in your app's Parse Dashboard settings page.
* `installationId` (can be set only once): String referring to the `Installation` where the session is logged in from. For Parse SDKs, this field will be automatically set when users log in or sign up.
All special fields except `installationId` can only be set automatically by Parse Server. You can add custom fields onto `Session` objects, but please keep in mind that any logged-in device (with session token) can read other sessions that belong to the same user (unless you disable Class-Level Permissions, see below).

## Handling Invalid Session Token Error

With revocable sessions, your current session token could become invalid if its corresponding `Session` object is deleted from your Parse Server. This could happen if you implement a Session Manager UI that lets users log out of other devices, or if you manually delete the session via Cloud Code, REST API, or Data Browser. Sessions could also be deleted due to automatic expiration (if configured in app settings). When a device's session token no longer corresponds to a `Session` object on your Parse Server, all API requests from that device will fail with “Error 209: invalid session token”.

To handle this error, we recommend writing a global utility function that is called by all of your Parse request error callbacks. You can then handle the "invalid session token" error in this global function. You should prompt the user to login again so that they can obtain a new session token. This code could look like this:

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// Objective-C
@interface ParseErrorHandlingController : NSObject

+ (void)handleParseError:(NSError *)error;

@end

@implementation ParseErrorHandlingController

+ (void)handleParseError:(NSError *)error {
  if (![error.domain isEqualToString:PFParseErrorDomain]) {
    return;
  }

  switch (error.code) {
    case kPFErrorInvalidSessionToken: {
      [self _handleInvalidSessionTokenError];
      break;
    }
    ... // Other Parse API Errors that you want to explicitly handle.
  }
}

+ (void)_handleInvalidSessionTokenError {
  //--------------------------------------
  // Option 1: Show a message asking the user to log out and log back in.
  //--------------------------------------
  // If the user needs to finish what they were doing, they have the opportunity to do so.
  //
  // UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@"Invalid Session"
  //                                                     message:@"Session is no longer valid, please log out and log in again."
  //                                                    delegate:self
  //                                           cancelButtonTitle:@"Not Now"
  //                                           otherButtonTitles:@"OK"];
  // [alertView show];

  //--------------------------------------
  // Option #2: Show login screen so user can re-authenticate.
  //--------------------------------------
  // You may want this if the logout button is inaccessible in the UI.
  //
  // UIViewController *presentingViewController = [UIApplication sharedApplication].keyWindow.rootViewController;
  // PFLogInViewController *logInViewController = [[PFLogInViewController alloc] init];
  // [presentingViewController presentViewController:logInViewController animated:YES completion:nil];
}

@end

// In all API requests, call the global error handler, e.g.
[[PFQuery queryWithClassName:@"Object"] findInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // Query succeeded - continue your app logic here.
  } else {
    // Query failed - handle an error.
    [ParseErrorHandlingController handleParseError:error];
  }
}];
```
```swift
// Swift
class ParseErrorHandlingController {
  class func handleParseError(error: NSError) {
    if error.domain != PFParseErrorDomain {
      return
    }

    switch (error.code) {
    case kPFErrorInvalidSessionToken:
      handleInvalidSessionTokenError()

    ... // Other Parse API Errors that you want to explicitly handle.
  }

  private class func handleInvalidSessionTokenError() {
    //--------------------------------------
    // Option 1: Show a message asking the user to log out and log back in.
    //--------------------------------------
    // If the user needs to finish what they were doing, they have the opportunity to do so.
    //
    // let alertView = UIAlertView(
    //   title: "Invalid Session",
    //   message: "Session is no longer valid, please log out and log in again.",
    //   delegate: nil,
    //   cancelButtonTitle: "Not Now",
    //   otherButtonTitles: "OK"
    // )
    // alertView.show()

    //--------------------------------------
    // Option #2: Show login screen so user can re-authenticate.
    //--------------------------------------
    // You may want this if the logout button is inaccessible in the UI.
    //
    // let presentingViewController = UIApplication.sharedApplication().keyWindow?.rootViewController
    // let logInViewController = PFLogInViewController()
    // presentingViewController?.presentViewController(logInViewController, animated: true, completion: nil)
  }
}

// In all API requests, call the global error handler, e.g.
let query = PFQuery(className: "Object")
query.findObjectsInBackgroundWithBlock { (objects: [AnyObject]!, error: NSError!) -> Void in
  if error == nil {
    // Query Succeeded - continue your app logic here.
  } else {
    // Query Failed - handle an error.
    ParseErrorHandlingController.handleParseError(error)
  }
}
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
public class ParseErrorHandler {
  public static void handleParseError(ParseException e) {
    switch (e.getCode()) {
      case INVALID_SESSION_TOKEN: handleInvalidSessionToken()
        break;

      ... // Other Parse API errors that you want to explicitly handle
    }
  }

  private static void handleInvalidSessionToken() {
    //--------------------------------------
    // Option 1: Show a message asking the user to log out and log back in.
    //--------------------------------------
    // If the user needs to finish what they were doing, they have the opportunity to do so.
    //
    // new AlertDialog.Builder(getActivity())
    //   .setMessage("Session is no longer valid, please log out and log in again.")
    //   .setCancelable(false).setPositiveButton("OK", ...).create().show();

    //--------------------------------------
    // Option #2: Show login screen so user can re-authenticate.
    //--------------------------------------
    // You may want this if the logout button could be inaccessible in the UI.
    //
    // startActivityForResult(new ParseLoginBuilder(getActivity()).build(), 0);
  }
}

// In all API requests, call the global error handler, e.g.
query.findInBackground(new FindCallback<ParseObject>() {
  public void done(List<ParseObject> results, ParseException e) {
    if (e == null) {
      // Query successful, continue other app logic
    } else {
      // Query failed
      ParseErrorHandler.handleParseError(e);
    }
  }
});
```
{% endif %}

{% if page.language == "js" %}
```js
function handleParseError(err) {
  switch (err.code) {
    case Parse.Error.INVALID_SESSION_TOKEN:
      Parse.User.logOut();
      ... // If web browser, render a log in screen
      ... // If Express.js, redirect the user to the log in route
      break;

    ... // Other Parse API errors that you want to explicitly handle
  }
}

// For each API request, call the global error handler
query.find().then(function() {
  ...
}, function(err) {
  handleParseError(err);
});
```
{% endif %}

{% if page.language == "cs" %}
```cs
public class ParseErrorHandler {
  public static void HandleParseError(ParseException e) {
    switch (e.Code) {
      case ParseException.ErrorCode.InvalidSessionToken:
        HandleInvalidSessionToken()
        break;

      ... // Other Parse API errors that you want to explicitly handle
    }
  }

  private static void HandleInvalidSessionToken() {
    //--------------------------------------
    // Option 1: Show a message asking the user to log out and log back in.
    //--------------------------------------
    // If the user needs to finish what they were doing, they have the opportunity to do so.

    //--------------------------------------
    // Option #2: Show login screen so user can re-authenticate.
    //--------------------------------------
    // You may want this if the logout button is inaccessible in the UI.
  }
});

// In all API requests, call the global error handler, e.g.
query.FindAsync().ContinueWith(t => {
  if (t.IsFaulted) {
    // Query Failed - handle an error.
    ParseErrorHandler.HandleParseError(t.Exception.InnerException as ParseException);
  } else {
    // Query Succeeded - continue your app logic here.
  }
});
```
{% endif %}

{% if page.language == "php" %}
```php
public class ParseErrorHandler {
  public static handleParseError(ParseException $e) {
    $code = $e->getCode();
    switch ($code) {
      case: 209: // INVALID_SESSION_TOKEN
        ParseUser::logOut();
        ... // Redirect the to login page.
        break;

      ... // Other Parse API errors that you want to explicitly handle
    }
  }
});

// For each API request, call the global error handler
try {
  $results = $query->find();
  // ...
} catch (ParseException $e) {
  ParseErrorHandler::handleParseError($e)
}
```
{% endif %}

{% if page.language == "bash" %}
```bash
// No command line example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

## `Session`  Security

`Session` objects can only be accessed by the user specified in the user field. All `Session` objects have an ACL that is read and write by that user only. You cannot change this ACL. This means querying for sessions will only return objects that match the current logged-in user.

When you log in a user via a `User` login method, Parse will automatically create a new unrestricted `Session` object in your Parse Server. Same for signups and Facebook/Twitter logins.

You can configure Class-Level Permissions (CLPs) for the Session class just like other classes on Parse. CLPs restrict reading/writing of sessions via the `Session` API, but do not restrict Parse Server's automatic session creation/deletion when users log in, sign up, and log out. We recommend that you disable all CLPs not needed by your app. Here are some common use cases for Session CLPs:

* **Find**, **Delete** — Useful for building a UI screen that allows users to see their active session on all devices, and log out of sessions on other devices. If your app does not have this feature, you should disable these permissions.
* **Create** — Useful for apps that provision user sessions for other devices from the phone app. You should disable this permission when building apps for mobile and web. For IoT apps, you should check whether your IoT device actually needs to access user-specific data. If not, then your IoT device does not need a user session, and you should disable this permission.
* **Get**, **Update**, **Add Field** — Unless you need these operations, you should disable these permissions.
