# Users

In general, users have the same features as other objects. The differences are that user objects must have a username and password, the password is automatically encrypted and stored securely, and Parse Server enforces the uniqueness of the username and email fields.

Therefore you can manage users objects using the `createUser`, `user`, `users`, `updateUser`, and `deleteUser` operations. Additionally, you can use the `signUp`, `logIn`, and `logOut` operations.

## Signing Up

Signing up a new user differs from creating another object in that the `username` and `password` fields are required. The `password` field is handled differently than the others; it is encrypted with bcrypt when stored in the database and never returned to any client request.

You can ask Parse Server to [verify user email addresses]({{ site.baseUrl }}/parse-server/guide/#welcome-emails-and-email-verification) in your application settings. With this setting enabled, all new user registrations with an email field will generate an email confirmation at that address. You can check whether the user has verified their email with the `emailVerified` field.

To sign up a new user, use the `signUp` mutation. For example:

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```
```graphql
# GraphQL
mutation signUp {
  signUp(
    input: {
      fields: {
        username: "johndoe"
        password: "ASuperStrongPassword"
        email: "john.doe@email.com"
      }
    }
  ) {
    viewer {
      sessionToken
      user {
        username
        email
      }
    }
  }
}
```
```jsonc
// Response
{
  "data": {
    "signUp": {
      "viewer": {
        "sessionToken": "r:a0ec8428409b6b85c6f54ab1e654c53d",
        "user": {
          "username": "johndoe",
          "email": "john.doe@email.com"
        }
      }
    }
  }
}
```

Note that a field called `sessionToken` has been returned. This token can be used to authenticate subsequent operations as this user.

## Logging In

After you allow users to sign up, you need to let them log in to their account with a username and password in the future. To do this, use the `logIn` mutation:

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```
```graphql
# GraphQL
mutation logIn {
  logIn(input: { username: "johndoe", password: "ASuperStrongPassword" }) {
    viewer {
      sessionToken
      user {
        username
        email
      }
    }
  }
}
```
```jsonc
// Response
{
  "data": {
    "logIn": {
      "viewer": {
        "sessionToken": "r:b0dfad1eeafa4425d9508f1c0a15c3fa",
        "user": {
          "username": "johndoe",
          "email": "john.doe@email.com"
        }
      }
    }
  }
}
```

Note that, when the user logs in, Parse Server generates a new `sessionToken` for future operations.

## 3rd Party Authentication

You can log in a user via a [3rd party authentication](https://docs.parseplatform.org/parse-server/guide/#supported-3rd-party-authentications) system (Facebook, Twitter, Apple and many more) with the `logInWith` mutation.

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```
```graphql
# GraphQL
mutation LoginWithFacebook {
  logInWith(
    input: {
      authData: {
        facebook: {
          id: "user's Facebook id number as a string"
          access_token: "Facebook access token for the user"
          expiration_date: "token expiration date"
        }
      }
      fields: { email: "a.new@user.com" }
    }
  ) {
    viewer {
      sessionToken
      user {
        id
        email
      }
    }
  }
}
```
```jsonc
// Response
{
  "data": {
    "logInWith": {
      "viewer": {
        "sessionToken": "r:b0dfad1eeafa4425d9508f1c0a15c3fa",
        "user": {
          "email": "a.new@user.com"
        }
      }
    }
  }
}
```

## Using Session Token

For authenticating an operation as a specific user, you need to pass the `X-Parse-Session-Token` header with its valid session token.

You can easily do this in the GraphQL Playground. There is an option called `HTTP HEADERS` in its bottom left side. Use this option to replace the default `X-Parse-Master-Key` header by a valid `X-Parse-Session-Token` header. You should have something like this:

<img alt="Session Token Header" data-echo="{{ '/assets/images/graphql/session-token.png' | prepend: site.baseurl }}"/>

After setting up the `X-Parse-Session-Token` header, any operation will run as this user. For example, you can run the code below to validate the session token and return its associated user:

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Session-Token": "r:b0dfad1eeafa4425d9508f1c0a15c3fa"
}
```
```graphql
# GraphQL
query viewer {
  viewer {
    sessionToken
    user {
      username
      email
    }
  }
}
```
```jsonc
// Response
{
  "data": {
    "viewer": {
      "sessionToken": "r:b0dfad1eeafa4425d9508f1c0a15c3fa",
      "user": {
        "username": "johndoe",
        "email": "john.doe@email.com"
      }
    }
  }
}
```

## Logging Out

You can log out a user through the `logOut` mutation. You need to send the `X-Parse-Session-Token` header and run code like the below example:

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Session-Token": "r:b0dfad1eeafa4425d9508f1c0a15c3fa"
}
```
```graphql
# GraphQL
mutation logOut {
  logOut(input: { clientMutationId: "logOut" }) {
    clientMutationId
    viewer {
      user {
        username
        email
      }
    }
  }
}

```
```jsonc
// Response
{
  "data": {
    "logOut": {
      "clientMutationId": "logOut",
      "viewer": {
        "user": {
          "username": "johndoe",
          "email": "john.doe@email.com"
        }
      }
    }
  }
}
```

## Resetting Passwords

To use the `resetPassword` mutation your Parse Server must have an email adapter configured.

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
}
```
```graphql
# GraphQL
mutation resetPassword {
  resetPassword(input: { email: "email@email.email" }) {
    ok
  }
}
```
```jsonc
// Response
{
  "data": {
    "resetPassword": {
      "ok": true,
    }
  }
}
```

## Send Email Verification

The verification email is automatically sent on sign up; this mutation is useful if the user didn't receive the first email. Again, an email adapter must be configured for this mutation to work.

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
}
```
```graphql
# GraphQL
mutation sendVerificationEmail {
  sendVerificationEmail(input: { email: "email@email.email" }) {
    ok
  }
}

```
```jsonc
// Response
{
  "data": {
    "sendVerificationEmail": {
      "ok": true,
    }
  }
}
```
