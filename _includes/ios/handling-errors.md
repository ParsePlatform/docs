# Handling Errors

Parse has a few simple patterns for surfacing errors and handling them in your code.

There are two types of errors you may encounter. The first is those dealing with logic errors in the way you're using the SDK. These types of errors result in an `NSException` being raised. For an example take a look at the following code:

<div class="language-toggle" markdown="1">
```objective_c
PFUser *user = [PFUser user];
[user signUp];
```
```swift
let user = PFUser()
user.signUp
```
</div>

This will throw an `NSInternalInconsistencyException` because `signUp` was called without first setting the required properties (`username` and `password`).

The second type of error is one that occurs when interacting with Parse Server over the network. These errors are either related to problems connecting to the cloud or problems performing the requested operation. Let's take a look at another example:

<div class="language-toggle" markdown="1">
```objective_c
- (void)getMyNote {
    PFQuery *query = [PFQuery queryWithClassName:@"Note"];
    [query getObjectInBackgroundWithId:@"thisObjectIdDoesntExist"
                                target:self
                              selector:@selector(callbackForGet:error:)];
}
```
```swift
func getMyNote() -> Void {
    let query = PFQuery(className: "Note")
    query.getObjectInBackgroundWithId("thisObjectIdDoesntExist", target: self, selector: Selector("callbackForGet:error:"))
}
```
</div>

In the above code, we try to fetch an object with a non-existent `objectId`. Parse Server will return an error with an error code set in `code` and message in the error's `userInfo`. Here's how to handle it properly in your callback:

<div class="language-toggle" markdown="1">
```objective_c
- (void)callbackForGet:(PFObject *)result error:(NSError *)error {
    if (result) {
        NSLog(@"Everything went fine!");
    } else {
        if ([error code] == kPFErrorObjectNotFound) {
            NSLog(@"Uh oh, we couldn't find the object!");
        } else if (error) {
            NSLog(@"Error: %@", [error userInfo][@"error"]);
        }
    }
}
```
```swift
func callbackForGet(result: PFObject?, error: NSError?) -> Void {
    if let result = result {
        print("Everything went fine!")
    } else {
        if let error = error {
            if error._code == PFErrorCode.errorObjectNotFound.rawValue {
                print("Uh oh, we couldn't find the object!")
            } else {
                let errorString = error._userInfo!["error"] as? NSString
                print("Error: \(errorString)")
            }
        }
    }
}
```
</div>

The query might also fail because the device couldn't connect to your Parse Server. Here's the same callback but with a bit of extra code to handle that scenario explicitly:

<div class="language-toggle" markdown="1">
```objective_c
- (void)callbackForGet:(PFObject *)result error:(NSError *)error {
    if (result) {
        NSLog(@"Everything went fine!");
    } else {
        if ([error code] == kPFErrorObjectNotFound) {
            NSLog(@"Uh oh, we couldn't find the object!");
        // Now also check for connection errors:
        } else if ([error code] == kPFErrorConnectionFailed) {
            NSLog(@"Uh oh, we couldn't even connect to the Parse Cloud!");
        } else if (error) {
            NSLog(@"Error: %@", [error userInfo][@"error"]);
        }
    }
}
```
```swift
func callbackForGet(result: PFObject?, error: NSError?) -> Void {
    if let result = result {
        print("Everything went fine!")
    } else {
        if let error = error {
            if error._code == PFErrorCode.errorObjectNotFound.rawValue {
                print("Uh oh, we couldn't find the object!")
                // Now also check for connection errors:
            } else if error._code == PFErrorCode.errorConnectionFailed.rawValue {
                print("Uh oh, we couldn't even connect to the Parse Cloud!")
            } else {
                let errorString = error._userInfo!["error"] as? NSString
                print("Error: \(errorString)")
            }
        }
    }
}
```
</div>

When the callback expects a `NSNumber`, its `boolValue` tells you whether the operation succeeded or not. For example, this is how you might implement the callback for `PFObject`'s `saveInBackgroundWithTarget:selector:` method:

<div class="language-toggle" markdown="1">
```objective_c
- (void)callbackForSave:(NSNumber *)result error:(NSError *)error {
    if ([result boolValue]) {
        NSLog(@"Everything went fine!");
    } else {
        if ([error code] == kPFErrorConnectionFailed) {
            NSLog(@"Uh oh, we couldn't even connect to the Parse Cloud!");
        } else if (error) {
            NSLog(@"Error: %@", [error userInfo][@"error"]);
        }
    }
}
```
```swift
func callbackForSave(result: NSNumber?, error: NSError?) -> Void {
    if result?.boolValue == true {
        print("Everything went fine!")
    } else {
        if let error = error {
            if error.code == PFErrorCode.ErrorConnectionFailed.rawValue {
                print("Uh oh, we couldn't even connect to the Parse Cloud!")
            } else {
                let errorString = error.userInfo!["error"] as? NSString
                print("Error: \(errorString)")
            }
        }
    }
}
```
</div>

For synchronous (non-background) methods, error handling is mostly the same except that instead of a `NSNumber` representing success or failure you'll get an actual `BOOL` directly.

By default, all connections have a timeout of 10 seconds, so the synchronous methods will not hang indefinitely.

For a list of all possible `NSError` types, scroll down to [Error Codes](#error-codes), or see the `PFErrorCode` section of the [iOS-OSX API]({{ site.apis.osx }}/Enums/PFErrorCode.html).
