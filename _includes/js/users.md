# Users

At the core of many apps, there is a notion of user accounts that lets users access their information in a secure manner. We provide a specialized user class called `Parse.User` that automatically handles much of the functionality required for user account management.

With this class, you'll be able to add user account functionality in your app.

`Parse.User` is a subclass of `Parse.Object`, and has all the same features, such as flexible schema, automatic persistence, and a key value interface. All the methods that are on `Parse.Object` also exist in `Parse.User`. The difference is that `Parse.User` has some special additions specific to user accounts.

## `Parse.User` Properties

`Parse.User` has several values that set it apart from `Parse.Object`:

*   username: The username for the user (required).
*   password: The password for the user (required on signup).
*   email: The email address for the user (optional).

We'll go through each of these in detail as we run through the various use cases for users.

## Signing Up

The first thing your app will do is probably ask the user to sign up. The following code illustrates a typical sign up:

```javascript
const user = new Parse.User();
user.set("username", "my name");
user.set("password", "my pass");
user.set("email", "email@example.com");

// other fields can be set just like with Parse.Object
user.set("phone", "415-392-0202");
try {
  await user.signUp();
  // Hooray! Let them use the app now.
} catch (error) {
  // Show the error message somewhere and let the user try again.
  alert("Error: " + error.code + " " + error.message);
}
```

This call will asynchronously create a new user in your Parse App. Before it does this, it also checks to make sure that both the username and email are unique. Also, it securely hashes the password in the cloud using bcrypt. We never store passwords in plaintext, nor will we ever transmit passwords back to the client in plaintext.

Note that we used the `signUp` method, not the `save` method. New `Parse.User`s should always be created using the `signUp` method. Subsequent updates to a user can be done by calling `save`.

If a signup isn't successful, you should read the error object that is returned. The most likely case is that the username or email has already been taken by another user. You should clearly communicate this to your users, and ask them try a different username.

You are free to use an email address as the username. Simply ask your users to enter their email, but fill it in the username property &mdash; `Parse.User` will work as normal. We'll go over how this is handled in the reset password section.

## Logging In

Of course, after you allow users to sign up, you need to let them log in to their account in the future. To do this, you can use the class method `logIn`.

```javascript
const user = await Parse.User.logIn("myname", "mypass");
// Do stuff after successful login.
```

By default, the SDK uses the POST HTTP method. If you would like to override this and use a GET HTTP method instead, you may pass an optional Boolean property in the options argument with the key `usePost`.


```javascript
const user = await Parse.User.logIn("myname", "mypass", { usePost: false });
// Do stuff after successful login.
```
> Available with SDK version 2.17.0 and later

## Verifying Emails

Enabling email verification in an application's settings allows the application to reserve part of its experience for users with confirmed email addresses. Email verification adds the `emailVerified` key to the `Parse.User` object. When a `Parse.User`'s `email` is set or modified, `emailVerified` is set to `false`. Parse then emails the user a link which will set `emailVerified` to `true`.

There are three `emailVerified` states to consider:

1.  `true` - the user confirmed his or her email address by clicking on the link Parse emailed them. `Parse.Users` can never have a `true` value when the user account is first created.
2.  `false` - at the time the `Parse.User` object was last refreshed, the user had not confirmed his or her email address. If `emailVerified` is `false`, consider calling `fetch` on the `Parse.User`.
3.  _missing_ - the `Parse.User` was created when email verification was off or the `Parse.User` does not have an `email`.

## Current User

It would be bothersome if the user had to log in every time they open your app. You can avoid this by using the cached current `Parse.User` object.

Please note that this functionality is disabled by default on Node.js environments (such as React Native) to discourage stateful usages on server-side configurations. To bypass this behavior on this particular use case, call once `Parse.User.enableUnsafeCurrentUser()` right before using any cached-user related functionalities.

Whenever you use any signup or login methods, the user is cached in localStorage, or in any storage you configured via the `Parse.setAsyncStorage` method. You can treat this cache as a session, and automatically assume the user is logged in:

```javascript
const currentUser = Parse.User.current();
if (currentUser) {
    // do stuff with the user
} else {
    // show the signup or login page
}
```

When using a platform with an async storage system you should call `currentAsync()` instead.

```javascript
Parse.User.currentAsync().then(function(user) {
    // do stuff with your user
});
```

You can clear the current user by logging them out:

```javascript
Parse.User.logOut().then(() => {
  const currentUser = Parse.User.current();  // this will now be null
});
```

## Setting the Current User

If you’ve created your own authentication routines, or otherwise logged in a user on the server side, you can now pass the session token to the client and use the `become` method. This method will ensure the session token is valid before setting the current user.

```javascript
Parse.User.become("session-token-here").then(function (user) {
  // The current user is now set to user.
}, function (error) {
  // The token could not be validated.
});
```

## Security For User Objects

The `Parse.User` class is secured by default. Data stored in a `Parse.User` can only be modified by that user. By default, the data can still be read by any client. Thus, some `Parse.User` objects are authenticated and can be modified, whereas others are read-only.

Specifically, you are not able to invoke any of the `save` or `delete` methods unless the `Parse.User` was obtained using an authenticated method, like `logIn` or `signUp`. This ensures that only the user can alter their own data.

The following illustrates this security policy:

```javascript
const user = await Parse.User.logIn("my_username", "my_password");
user.set("username", "my_new_username");
await user.save();
// This succeeds, since the user was authenticated on the device

// Get the user from a non-authenticated method
const query = new Parse.Query(Parse.User);
const userAgain = await query.get(user.objectId);
userAgain.set("username", "another_username");
await userAgain.save().catch(error => {
  // This will error, since the Parse.User is not authenticated
});
```

The `Parse.User` obtained from `Parse.User.current()` will always be authenticated.

If you need to check if a `Parse.User` is authenticated, you can invoke the `authenticated` method. You do not need to check `authenticated` with `Parse.User` objects that are obtained via an authenticated method.

## Encrypting Current User

Often you may want to be more careful with user information stored in the browser, if this is the case you can encrypt the current user object:

```javascript

Parse.enableEncryptedUser();
Parse.secret = 'my Secrey Key';

```
*   It's important to remember that this function will not work if `Parse.secret` is not set.
*   Also note that this only works in the browser.

Now the record in Local Storage looks like a random string and only can be read using `Parse.User.current()`
You can check if this feature is enabled with the function `Parse.isEncryptedUserEnabled()`.

## Security For Other Objects

The same security model that applies to the `Parse.User` can be applied to other objects. For any object, you can specify which users are allowed to read the object, and which users are allowed to modify an object. To support this type of security, each object has an [access control list](http://en.wikipedia.org/wiki/Access_control_list), implemented by the `Parse.ACL` class.

The simplest way to use a `Parse.ACL` is to specify that an object may only be read or written by a single user. This is done by initializing a Parse.ACL with a `Parse.User`: `new Parse.ACL(user)` generates a `Parse.ACL` that limits access to that user. An object's ACL is updated when the object is saved, like any other property. Thus, to create a private note that can only be accessed by the current user:

```javascript
const Note = Parse.Object.extend("Note");
const privateNote = new Note();
privateNote.set("content", "This note is private!");
privateNote.setACL(new Parse.ACL(Parse.User.current()));
privateNote.save();
```

This note will then only be accessible to the current user, although it will be accessible to any device where that user is signed in. This functionality is useful for applications where you want to enable access to user data across multiple devices, like a personal todo list.

Permissions can also be granted on a per-user basis. You can add permissions individually to a `Parse.ACL` using `setReadAccess` and `setWriteAccess`. For example, let's say you have a message that will be sent to a group of several users, where each of them have the rights to read and delete that message:

```javascript
const Message = Parse.Object.extend("Message");
const groupMessage = new Message();
const groupACL = new Parse.ACL();

// userList is an array with the users we are sending this message to.
for (let i = 0; i < userList.length; i++) {
  groupACL.setReadAccess(userList[i], true);
  groupACL.setWriteAccess(userList[i], true);
}

groupMessage.setACL(groupACL);
groupMessage.save();
```

You can also grant permissions to all users at once using `setPublicReadAccess` and `setPublicWriteAccess`. This allows patterns like posting comments on a message board. For example, to create a post that can only be edited by its author, but can be read by anyone:

```javascript
const publicPost = new Post();
const postACL = new Parse.ACL(Parse.User.current());
postACL.setPublicReadAccess(true);
publicPost.setACL(postACL);
publicPost.save();
```

Operations that are forbidden, such as deleting an object that you do not have write access to, result in a `Parse.Error.OBJECT_NOT_FOUND` error code. For security purposes, this prevents clients from distinguishing which object ids exist but are secured, versus which object ids do not exist at all.

## Resetting Passwords

It's a fact that as soon as you introduce passwords into a system, users will forget them. In such cases, our library provides a way to let them securely reset their password.

To kick off the password reset flow, ask the user for their email address, and call:

```javascript
Parse.User.requestPasswordReset("email@example.com")
.then(() => {
  // Password reset request was sent successfully
}).catch((error) => {
  // Show the error message somewhere
  alert("Error: " + error.code + " " + error.message);
});
```

This will attempt to match the given email with the user's email or username field, and will send them a password reset email. By doing this, you can opt to have users use their email as their username, or you can collect it separately and store it in the email field.

The flow for password reset is as follows:

1.  User requests that their password be reset by typing in their email.
2.  Parse sends an email to their address, with a special password reset link.
3.  User clicks on the reset link, and is directed to a special Parse page that will allow them type in a new password.
4.  User types in a new password. Their password has now been reset to a value they specify.

Note that the messaging in this flow will reference your app by the name that you specified when you created this app on Parse.

## Querying

To query for users, you can simple create a new `Parse.Query` for `Parse.User`s:

```javascript
const query = new Parse.Query(Parse.User);
query.equalTo("gender", "female");  // find all the women
const women = await query.find();
```

## Associations

Associations involving a `Parse.User` work right of the box. For example, let's say you're making a blogging app. To store a new post for a user and retrieve all their posts:

```javascript
const user = Parse.User.current();

// Make a new post
const Post = Parse.Object.extend("Post");
const post = new Post();
post.set("title", "My New Post");
post.set("body", "This is some great content.");
post.set("user", user);
await post.save();
// Find all posts by the current user
const query = new Parse.Query(Post);
query.equalTo("user", user);
const userPosts = await query.find();
// userPosts contains all of the posts by the current user.
});
```

## Facebook Users

Parse provides an easy way to integrate Facebook with your application. The `Parse.FacebookUtils` class integrates `Parse.User` and the Facebook Javascript SDK to make linking your users to their Facebook identities easy.

Using our Facebook integration, you can associate an authenticated Facebook user with a `Parse.User`. With just a few lines of code, you'll be able to provide a "log in with Facebook" option in your app, and be able to save their data to Parse.


### Setting up Facebook

To start using Facebook with Parse, you need to:

1.  [Create a Facebook Developer account](https://developers.facebook.com/).
2.  [Create an app](https://developers.facebook.com/apps).
3.  In your app Dashboard, add a product -> Facebook Login.
4.  [Add appIds to Parse Server auth configuration](http://docs.parseplatform.org/parse-server/guide/#oauth-and-3rd-party-authentication) or pass `facebookAppIds` into configuration

```html
<script>
  // Initialize Parse
  Parse.initialize("$PARSE_APPLICATION_ID", "$PARSE_JAVASCRIPT_KEY");
  Parse.serverURL = 'http://YOUR_PARSE_SERVER:1337/parse';

  window.fbAsyncInit = function() {
    Parse.FacebookUtils.init({
      appId      : '{facebook-app-id}', // Facebook App ID
      status     : true,  // check Facebook Login status
      cookie     : true,  // enable cookies to allow Parse to access the session
      xfbml      : true,  // initialize Facebook social plugins on the page
      version    : 'v2.3' // point to the latest Facebook Graph API version
    });
    // Run code after the Facebook SDK is loaded.
    // ...
  };

  // Load Facebook SDK
  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
</script>
```

The function assigned to `fbAsyncInit` is run as soon as the Facebook JavaScript SDK has completed loading. Any code that you want to run after the Facebook JavaScript SDK is loaded should be placed within this function and after the call to `Parse.FacebookUtils.init()`.

If you encounter any issues that are Facebook-related, a good resource is the [official getting started guide from Facebook](https://developers.facebook.com/docs/reference/javascript/).

There are two main ways to use Facebook with your Parse users: (1) [logging in as a Facebook user](#login--signup) and creating a `Parse.User`, or (2) [linking Facebook](#linking) to an existing `Parse.User`.

### Login & Signup

`Parse.FacebookUtils` provides a way to allow your `Parse.User`s to log in or sign up through Facebook. This is accomplished using the `logIn()` method:

```javascript
try {
  const users = await Parse.FacebookUtils.logIn();
  if (!user.existed()) {
    alert("User signed up and logged in through Facebook!");
  } else {
    alert("User logged in through Facebook!");
  }
} catch(error) {
  alert("User cancelled the Facebook login or did not fully authorize.");
}
```

When this code is run, the following happens:

1.  The user is shown the Facebook login dialog.
2.  The user authenticates via Facebook, and your app receives a callback.
3.  Our SDK receives the Facebook data and saves it to a `Parse.User`. If it's a new user based on the Facebook ID, then that user is created.

You may optionally provide a comma-delimited string that specifies what [permissions](https://developers.facebook.com/docs/authentication/permissions/) your app requires from the Facebook user. For example:

```javascript
const user = await Parse.FacebookUtils.logIn("user_likes,email");
```


<div class='tip info'><div>
  It is up to you to record any data that you need from the Facebook user after they authenticate. To accomplish this, you'll need to do a graph query using the Facebook SDK.
</div></div>


### Linking

If you want to associate an existing `Parse.User` to a Facebook account, you can link it like so:

```javascript
if (!Parse.FacebookUtils.isLinked(user)) {
  try  {
    await Parse.FacebookUtils.link(user);
    alert("Woohoo, user logged in with Facebook!");
  } catch(error) {}
    alert("User cancelled the Facebook login or ddid not fully authorize.");
  });
}
```

The steps that happen when linking are very similar to log in. The difference is that on successful login, the existing `Parse.User` is updated with the Facebook information. Future logins via Facebook will now log the user into their existing account.

For advanced API: If you have a Facebook `access_token`, you can use [linkWith()](#Linking-Users).

If you want to unlink Facebook from a user, simply do this:

```javascript
await Parse.FacebookUtils.unlink(user);
alert("The user is no longer associated with their Facebook account.");
```

### Facebook SDK and Parse

The Facebook Javascript SDK provides a main `FB` object that is the starting point for many of the interactions with Facebook's API. [You can read more about their SDK here](https://developers.facebook.com/docs/reference/javascript/).

Facebook login using the Parse SDK requires that the Facebook SDK already be loaded before calling `Parse.FacebookUtils.init()`.

Our library manages the `FB` object for you. The `FB` singleton is synchronized with the current user by default, so any methods you call on it will be acting on the Facebook user associated with the current `Parse.User`. Calling `FB.login()` or `FB.logOut()` explicitly will cause the `Parse.User` and `FB` object to fall out of synchronization, and is not recommended.

## Linking Users

Parse allows you to link your users with [3rd party authentication]({{ site.baseUrl }}/parse-server/guide/#oauth-and-3rd-party-authentication), enabling your users to sign up or log into your application using their existing identities. This is accomplished through [`linkWith`](https://parseplatform.org/Parse-SDK-JS/api/2.9.0/Parse.User.html#linkWith) method by providing authentication data for the service you wish to link to a user in the `authData` field. Once your user is associated with a service, the `authData` for the service will be stored with the user and is retrievable by logging in.

`authData` is a JSON object with keys for each linked service containing the data below. The `authData` object is required to at least have a key named `id`, which is used to identify the user on subsequent login attempts with linked account data.

> `_linkWith` has been deprecated since version 2.9.0, see [_linkWith](https://parseplatform.org/Parse-SDK-JS/api/master/Parse.User.html#_linkWith)

### Signing Up and Logging In

Signing a user up with a linked service and logging them in with that service uses the same `linkWith()` method, in which the `authData` for the user is specified.

```javascript
const myAuthData = {
  id: '12345678'  // Required field. Used to uniquely identify the linked account.
};
const user = new Parse.User();
await user.linkWith('providerName', { authData: myAuthData });
```

Parse then verifies that the provided `authData` is valid and checks to see if a user is already associated with this data.  If so, it returns a status code of `200 OK` and the details (including a `sessionToken` for the user):

```javascript
Status: 200 OK
Location: https://YOUR.PARSE-SERVER.HERE/parse/users/uMz0YZeAqc
```

With a response body like:

```jsonc
{
  "username": "Parse",
  "createdAt": "2022-01-01T12:23:45.678Z",
  "updatedAt": "2022-01-01T12:23:45.678Z",
  "objectId": "uMz0YZeAqc",
  "sessionToken": "r:samplei3l83eerhnln0ecxgy5",
  "authData": {
    "providerName": {
      "id": "12345678",
    }
  }
}
```
If the user has never been linked with this account, you will instead receive a status code of `201 Created`, indicating that a new user was created:

```javascript
Status: 201 Created
Location: https://YOUR.PARSE-SERVER.HERE/parse/users/uMz0YZeAqc
```
The body of the response will contain the `objectId`, `createdAt`, `sessionToken`, and an automatically-generated unique `username`.  For example:

```jsonc
{
  "username": "iwz8sna7sug28v4eyu7t89fij",
  "createdAt": "2022-01-01T12:23:45.678Z",
  "objectId": "uMz0YZeAqc",
  "sessionToken": "r:samplei3l83eerhnln0ecxgy5"
}
```

#### Linking un-authenticated users
To create a link to an un-authenticated user (for example in cloud code), options can be passed to `linkWith()` to either use the `masterKey` or pass a `sessionToken`.

```javascript
const myAuthData = {
  id: xzx5tt123,  // The id key is required in the authData-object. Otherwise Parse Server will throw the Error 252 'This authentication method is unsupported'.
  access: token
}

const user = await Parse.Query(Parse.User).get(userId);

await user.linkWith(
  'providerName',
  { authData: myAuthData },
  { useMasterKey: true }
);
```

On rest, web, mobile, or TV clients, users can then login using the `CustomAdapter` by passing `myAuthData`:

```javascript
const loggedIn = await Parse.User.logInWith('CustomAdapter', { authData: myAuthData});

```

### Custom Authentication Module

Parse Server supports many [3rd Party Authenications]({{ site.baseUrl }}/parse-server/guide/#oauth-and-3rd-party-authentication).
It is possible to `linkWith` any 3rd Party Authentication by creating a custom authentication module. A custom authentication module normally consists of a client-side AuthProvider object and a back-end AuthAdapter. The client-side object should implement the [AuthProvider interface](https://github.com/parse-community/Parse-SDK-JS/blob/master/src/interfaces/AuthProvider.js). The backend AuthAdapter should implement the the functions `validateAuthData` and `validateAppId`, check out this [AuthAdapter example](https://github.com/parse-community/parse-server/blob/master/src/Adapters/Auth/AuthAdapter.js).
When calling the `linkWith` function **without** an `authData` object the client side authenticate-method from the provider object will be called. In the other case the `authData` object will be sent directly to Parse Server for authentication using the backend module.

Note: The following is a minimal example implementing AuthProvider client-side and AuthAdapter on the backend.

A minimal  `CustomAuth.js` module in the backend:
```javascript
// Don't require or import parse-server in this module.
// See this issue: https://github.com/parse-community/parse-server/issues/6467
function validateAuthData(authData, options) {
  return Promise.resolve({})
}

function validateAppId(appIds, authData, options) {
  return Promise.resolve({});
}

module.exports = {
  validateAppId,
  validateAuthData,
};
```

Configure the server to make the `CustomAuth` available:
```javascript
const CustomAuth = require('./CustomAuth');

const api = new ParseServer({
  ...
  auth: {
    myAuth: {
      module: CustomAuth,
      option1: 'hello',
      option2: 'world',
    }
  }
  ...
});
...
await api.start();
app.use('/parse', api.app);
```

Use the `CustomAuth`:
```javascript
const provider = {
  authenticate: (options) => {
    // Some code to get retrieve authData
    // If retrieved valid authData, call success function with the data
    options.success(this, {
      id: 1234
    });
    // You can also handle error
    // options.error(this, {});
  },
  restoreAuthentication() {
    return true;
  },

  getAuthType() {
    return 'myAuth';
  },

  getAuthData() {
    return {
      authData: {
        id: 1234,
      },
    };
  },
};
// Must register before linking
Parse.User._registerAuthenticationProvider(provider);
const user = new Parse.User();
user.setUsername('Alice');
user.setPassword('sekrit');
await user.signUp();
await user.linkWith(provider.getAuthType(), provider.getAuthData());
user._isLinked(provider); // true
// Unlink
await user._unlinkFrom(provider.getAuthType());
```
