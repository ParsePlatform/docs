# Users

You can create and control users just as normal using this SDK.

To register a user, first create one:

```dart
var user =  ParseUser().create("TestFlutter", "TestPassword123", "TestFlutterSDK@gmail.com");
```
Then have the user sign up:

```dart
var response = await user.signUp();
if (response.success) user = response.result;
```

You can also login with the user:

```dart
var response = await user.login();
if (response.success) user = response.result;
```

You can also logout with the user:

```dart
var response = await user.logout();
if (response.success) {
    print('User logout');
}
```

Also, once logged in you can manage sessions tokens. This feature can be called after `Parse().init()` on startup to check for a logged in user.

```dart
user = ParseUser.currentUser();
```

To add additional columns to the user:

```dart
var user = ParseUser("TestFlutter", "TestPassword123", "TestFlutterSDK@gmail.com")
            ..set("userLocation", "FlutterLand");
```

Other user features are:
* Request Password Reset
* Verification Email Request
* Get all users
* Save
* Destroy user
* Queries

## Facebook, OAuth and 3rd Party Login/User

Usually, each provider will provide their own library for logins, but the `loginWith` method on `ParseUser` accepts a name of provider, then a `Map<String, dynamic>` with the authentication details required.
For Facebook and the example below, we used the library provided at [flutter_facebook_login](https://pub.dev/packages/flutter_facebook_login)

```dart
Future<void> goToFacebookLogin() async {
    final FacebookLogin facebookLogin = FacebookLogin();
    final FacebookLoginResult result = await facebookLogin.logInWithReadPermissions(['email']);

    switch (result.status) {
      case FacebookLoginStatus.loggedIn:
        final ParseResponse response = await ParseUser.loginWith(
            'facebook',
            facebook(result.accessToken.token,
                result.accessToken.userId,
                result.accessToken.expires));

        if (response.success) {
          // User is logged in, test with ParseUser.currentUser()
        }
        break;
      case FacebookLoginStatus.cancelledByUser:
            // User canceled
        break;
      case FacebookLoginStatus.error:
            // Error
        break;
    }
}
```

For Google and the example below, we used the library provided at [google_sign_in](https://pub.dev/packages/google_sign_in)

```dart
class OAuthLogin {
  final GoogleSignIn _googleSignIn = GoogleSignIn( scopes: ['email', 'https://www.googleapis.com/auth/contacts.readonly'] );
  
  sigInGoogle() async {
    GoogleSignInAccount account = await _googleSignIn.signIn();
    GoogleSignInAuthentication authentication = await account.authentication;
    await ParseUser.loginWith(
        'google',
        google(authentication.accessToken,
               _googleSignIn.currentUser.id, 
               authentication.idToken));
  }
}
```