# Users

At the core of many apps, there is a notion of user accounts that lets users access their information in a secure manner. We provide a specialized user class called `ParseUser` that automatically handles much of the functionality required for user account management.

With this class, you'll be able to add user account functionality in your app.

`ParseUser` is a subclass of `ParseObject`, and has all the same features, such as flexible schema, automatic persistence, and a key value interface. All the methods that are on `ParseObject` also exist in `ParseUser`. The difference is that ParseUser has some special additions specific to user accounts.


## `ParseUser` Properties

`ParseUser` has several values that set it apart from `ParseObject`:

*   username: The username for the user (required).
*   password: The password for the user (required on signup).
*   email: The email address for the user (optional).

We'll go through each of these in detail as we run through the various use cases for users.

## Signing Up

The first thing your app will do is probably ask the user to sign up. The following code illustrates a typical sign up:

```php

$user = new ParseUser();
$user->set("username", "my name");
$user->set("password", "my pass");
$user->set("email", "email@example.com");

// other fields can be set just like with ParseObject
$user->set("phone", "415-392-0202");

try {
  $user->signUp();
  // Hooray! Let them use the app now.
} catch (ParseException $ex) {
  // Show the error message somewhere and let the user try again.
  echo "Error: " . $ex->getCode() . " " . $ex->getMessage();
}
```

This call will asynchronously create a new user in your Parse App. Before it does this, it also checks to make sure that both the username and email are unique. Also, it securely hashes the password in the cloud using bcrypt. We never store passwords in plaintext, nor will we ever transmit passwords back to the client in plaintext.

Note that we used the `signUp` method, not the `save` method. New `ParseUser`s should always be created using the `signUp` method. Subsequent updates to a user can be done by calling `save`.

If a signup isn't successful, you should read the error object that is returned. The most likely case is that the username or email has already been taken by another user. You should clearly communicate this to your users, and ask them try a different username.

You are free to use an email address as the username. Simply ask your users to enter their email, but fill it in the username property &mdash; `ParseUser` will work as normal. We'll go over how this is handled in the reset password section.

## Logging In

Of course, after you allow users to sign up, you need to let them log in to their account in the future. To do this, you can use the class method `logIn`.

```php
try {
  $user = ParseUser::logIn("myname", "mypass");
  // Do stuff after successful login.
} catch (ParseException $error) {
  // The login failed. Check error to see why.
}
```

## Verifying Emails

Enabling email verification in an application's settings allows the application to reserve part of its experience for users with confirmed email addresses. Email verification adds the `emailVerified` key to the `ParseUser` object. When a `ParseUser`'s `email` is set or modified, `emailVerified` is set to `false`. Parse then emails the user a link which will set `emailVerified` to `true`.

There are three `emailVerified` states to consider:

1.  `true` - the user confirmed his or her email address by clicking on the link Parse emailed them. `ParseUsers` can never have a `true` value when the user account is first created.
2.  `false` - at the time the `ParseUser` object was last refreshed, the user had not confirmed his or her email address. If `emailVerified` is `false`, consider calling `fetch` on the `ParseUser`.
3.  _missing_ - the `ParseUser` was created when email verification was off or the `ParseUser` does not have an `email`.

## Resending Verification Emails

When email verification is enabled verification emails are automatically sent to a user's email address upon them signing up.

Although this usually is good enough on it's own you may run into some issues, such as if the verification email was lost, expired due to [exceeding token validity](https://github.com/parse-community/parse-server/#email-verification-and-password-reset) or the user simple wants another request emailed to them for their own reasons.
In any of those cases all you would need to do is call `ParseUser::requestVerificationEmail` with the email in question to have a verification email resent to them.

```php
ParseUser::requestVerificationEmail('email@example.com');
```

Note that this will only send if the account for the email requested has not already been verified.

## Current User

It would be bothersome if the user had to log in every time they open your app. You can avoid this by using the cached current `ParseUser` object.

By default, whenever you use any signup or login methods, the user will be saved in PHP Session storage, the `$_SESSION` superglobal. When re-initializing the Parse PHP SDK, you may need to instruct PHP to load the stored session data into the `$_SESSION` superglobal using `session_start()` before initializing the Parse PHP SDK to make Parse use persistent storage and continue the previous user session.

```php
$currentUser = ParseUser::getCurrentUser();
if ($currentUser) {
    // do stuff with the user
} else {
    // show the signup or login page
}
```

You can clear the current user by logging them out:

```php
ParseUser::logOut();

$currentUser = ParseUser::getCurrentUser();  // this will now be null
```

## Setting the Current User

If you’ve created your own authentication routines, or otherwise logged in a user on the server side, you can now pass the session token to the client and use the `become` method. This method will ensure the session token is valid before setting the current user.

```php
try {
  $user = ParseUser::become("session-token-here");
  // The current user is now set to user.
} catch (ParseException $ex) {
  // The token could not be validated.
}
```

## Session Storage Interface

If you do not want to use the default PHP `$_SESSION` for storage, you can add your own storage mechanism.  We provide the `ParseSessionStorageInterface` and a default implementation, `ParseSessionStorage`.  Simply create your own storage class that implements `ParseSessionStorageInterface` and inject it to the SDK when you initialize:

```php
    ParseClient::setStorage(new MyStorageClass());
```

## Security For User Objects

The `ParseUser` class is secured by default. Data stored in a `ParseUser` can only be modified by that user. By default, the data can still be read by any client. Thus, some `ParseUser` objects are authenticated and can be modified, whereas others are read-only.

Specifically, you are not able to invoke any of the `save` or `delete` methods unless the `ParseUser` was obtained using an authenticated method, like `logIn` or `signUp`. This ensures that only the user can alter their own data.

The following illustrates this security policy:

```php
$user = ParseUser::logIn("my_username", "my_password");
$user->set("username", "my_new_username");  // attempt to change username
$user->save();
// This succeeds, since the user was authenticated on the device

// Get the user from a non-authenticated method
$query = ParseUser::query();
$userAgain = $query->get($user->getObjectId());
$userAgain->set("username", "another_username");
// This will throw a ParseException, since the ParseUser is not authenticated
$userAgain->save();
```

The `ParseUser` obtained from `ParseUser::getCurrentUser()` will always be authenticated.

If you need to check if a `ParseUser` is authenticated, you can invoke the `authenticated` method. You do not need to check `authenticated` with `ParseUser` objects that are obtained via an authenticated method.

## Security For Other Objects

The same security model that applies to the `ParseUser` can be applied to other objects. For any object, you can specify which users are allowed to read the object, and which users are allowed to modify an object. To support this type of security, each object has an [access control list](http://en.wikipedia.org/wiki/Access_control_list), implemented by the `ParseACL` class.

The simplest way to use a `ParseACL` is to specify that an object may only be read or written by a single user. To create such an object, there must first be a logged in `ParseUser`. Then, `new ParseACL::createACLWithUser($user)` generates a `ParseACL` that limits access to that user. An object's ACL is updated when the object is saved, like any other property. Thus, to create a private note that can only be accessed by the current user:

```php
$privateNote = new ParseObject("Note");
$privateNote->set("content", "This note is private!");
$privateNote->setACL(ParseACL::createACLWithUser(ParseUser::getCurrentUser()));
$privateNote->save();
```

This note will then only be accessible to the current user, although it will be accessible to any device where that user is signed in. This functionality is useful for applications where you want to enable access to user data across multiple devices, like a personal todo list.

Permissions can also be granted on a per-user basis. You can add permissions individually to a `ParseACL` using `setReadAccess` and `setWriteAccess`. For example, let's say you have a message that will be sent to a group of several users, where each of them have the rights to read and delete that message:

```php
$groupMessage = new ParseObject("Message");
$groupACL = new ParseACL();

// userList is an array with the users we are sending this message to.
for ($i = 0; $i < count($userList); $i++) {
  $groupACL->setReadAccess($userList[$i], true);
  $groupACL->setWriteAccess($userList[$i], true);
}

$groupMessage->setACL($groupACL);
$groupMessage->save();
```

You can also grant permissions to all users at once using `setPublicReadAccess` and `setPublicWriteAccess`. This allows patterns like posting comments on a message board. For example, to create a post that can only be edited by its author, but can be read by anyone:

```php
$publicPost = new ParseObject("Post");
$postACL = ParseACL::createACLWithUser(ParseUser::getCurrentUser());
$postACL->setPublicReadAccess(true);
$publicPost->setACL($postACL);
$publicPost->save();
```

Operations that are forbidden, such as deleting an object that you do not have write access to, result in a `ParseError.OBJECT_NOT_FOUND` error code. For security purposes, this prevents clients from distinguishing which object ids exist but are secured, versus which object ids do not exist at all.

## Resetting Passwords

It's a fact that as soon as you introduce passwords into a system, users will forget them. In such cases, our library provides a way to let them securely reset their password.

To kick off the password reset flow, ask the user for their email address, and call:

```php
try {
  ParseUser::requestPasswordReset("email@example.com");
	// Password reset request was sent successfully
} catch (ParseException $ex) {
  // Password reset failed, check the exception message
}
```

This will attempt to match the given email with the user's email or username field, and will send them a password reset email. By doing this, you can opt to have users use their email as their username, or you can collect it separately and store it in the email field.

The flow for password reset is as follows:

1.  User requests that their password be reset by typing in their email.
2.  Parse sends an email to their address, with a special password reset link.
3.  User clicks on the reset link, and is directed to a special Parse page that will allow them type in a new password.
4.  User types in a new password. Their password has now been reset to a value they specify.

Note that the messaging in this flow will reference your app by the name that you specified when you created this app on Parse.

## Querying

To query for users, you can get a new `ParseQuery` for `ParseUser`s:

```php
$query = ParseUser::query();
$query->equalTo("gender", "female"); 
$results = $query->find();
```

## Associations

Associations involving a `ParseUser` work right out of the box. For example, let's say you're making a blogging app. To store a new post for a user and retrieve all of their posts:

```php
$user = ParseUser::getCurrentUser()

// Make a new post
$post = new ParseObject("Post");
$post->set("title", "My New Post");
$post->set("body", "This is some great content.");
$post->set("user", $user);
$post->save();

// Find all posts by the current user
$query = new ParseQuery("Post");
$query->equalTo("user", $user);
$userPosts = $query->find();
// $userPosts contains all of the posts by the current user.
```
