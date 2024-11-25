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

To use the `resetPassword` mutation your Parse Server must have an [email adapter configured as described in the Parse Server guide](https://docs.parseplatform.org/parse-server/guide/#welcome-emails-and-email-verification).

When configured, this mutation will send an email with a password reset link.

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

The emailed password reset link will GET the Parse REST API to verify the token is still valid.  For example:
```
https://www.example.com/parse/apps/APP_ID/request_password_reset?token=xxxxxxxxxxxx&username=test%40example.com
```
Parse will then forward the user's browser to a password reset page provided (or invalid token page) by the Parse server itself.

Optionally, the Parse server can be configured to forward to a custom page with-in your web application.  This is done using the ["customPages" feature](https://parseplatform.org/parse-server/api/master/CustomPagesOptions.html).  For example, using Express:
```
const parseServer = new ParseServer({
  // Basics: https://github.com/parse-community/parse-server#basic-options
   appId: process.env.PARSE_SERVER_APPLICATION_ID,
  ...otherOptions

  // Email: https://github.com/parse-community/parse-server#email-verification-and-password-reset
  verifyUserEmails: true,
  emailVerifyTokenValidityDuration: 2 * weekInSeconds,
  preventLoginWithUnverifiedEmail: false,

  // Emailed links point to this host.  It must include `/parse`
  publicServerURL: process.env.PARSE_PUBLIC_SERVER_URL || process.env.PARSE_SERVER_URL,
  // Your apps name. This will appear in the subject and body of the emails that are sent.
  appName: 'Application Name for User',
  // The email adapter
  emailAdapter: {
    module: "parse-server-aws-ses",
    options: {
      from: `Hello <${process.env.EMAIL_FROM_ADDRESS}>`,
      region: process.env.AWS_REGION,
      // aws-sdk loads keys from environment variables
    }
  },

  customPages: {
    invalidLink: `${process.env.APP_PUBLIC_URL}/auth/invalid-link`,
    
    verifyEmailSuccess: `${process.env.APP_PUBLIC_URL}/auth/verified`,

    choosePassword: `${process.env.APP_PUBLIC_URL}/auth/reset-password`,
    passwordResetSuccess: `${process.env.APP_PUBLIC_URL}/auth/password-saved`,
  },
  
  // account lockout policy setting (OPTIONAL) - defaults to undefined
  accountLockout: {
    duration: 5, // minutes that a locked-out account remains locked out before becoming unlocked. Set it to a value greater than 0 and less than 100000.
    threshold: 3, // failed sign-in attempts that will cause a user account to be locked. Set it to an integer value greater than 0 and less than 1000.
  },
})

...

// (Required) Mounts the REST API used in email verification/password reset links.
app.use('/parse', parseServer.app);

```

The Parse server forwards the browser to: `choosePassword: \`${process.env.APP_PUBLIC_URL}/auth/reset-password\`,` where your web application accepts the user's new password, and crafts a response to the server.  For example, using the $axios http library.

```
  async resetPassword({ axiosClient, email, password, token }) {
    // Make the request
    await axiosClient.post(
      `/parse/apps/${process.env.PARSE_SERVER_APPLICATION_ID}/request_password_reset`,
      `username=${encodeURIComponent(email)}&new_password=${encodeURIComponent(password)}&token=${encodeURIComponent(token)}`,
      {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/x-www-form-urlencoded',
        }
      }
    )
  },
```

## Send Email Verification

To use the `sendVerificationEmail` mutation your Parse Server must have an [email adapter configured as described in the Parse Server guide](https://docs.parseplatform.org/parse-server/guide/#welcome-emails-and-email-verification).

When configured, Parse server will automatically send emails on sign up.  this mutation will re-send an email with a password reset link if the user didn't receive the first email or the token expired.

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

The emailed verification link will GET the Parse REST API to verify the token is still valid.  For example:
```
https://www.example.com/parse/apps/APP_ID/verify_email?token=xxxxxxxxxxxx&username=test%4example.com
```

Parse will then process the token and forward the user's browser to verified or invalid page provided by the Parse server itself.

Optionally, the Parse server can be configured to forward to custom pages with-in your web application: `verifyEmailSuccess` or `customPages.invalidLink`.  Please see the "Resetting Passwords" section for an example and links to further documentation.
