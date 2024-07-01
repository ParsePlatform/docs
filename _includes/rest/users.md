# Users

Many apps have a unified login that works across the mobile app and other systems. Accessing user accounts through the REST API lets you build this functionality on top of Parse.

In general, users have the same features as other objects, such as the flexible schema. The differences are that user objects must have a username and password, the password is automatically encrypted and stored securely, and Parse enforces the uniqueness of the `username` and `email` fields.

## Signing Up

Signing up a new user differs from creating a generic object in that the `username` and `password` fields are required. The password field is handled differently than the others; it is encrypted with bcrypt when stored in the Parse Cloud and never returned to any client request.

You can ask Parse to verify user email addresses in your application settings page. With this setting enabled, all new user registrations with an `email` field will generate an email confirmation at that address. You can check whether the user has verified their `email` with the `emailVerified` field.

To sign up a new user, send a POST request to the users root. You may add any additional fields. For example, to create a user with a specific phone number:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Revocable-Session: 1" \
  -H "Content-Type: application/json" \
  -d '{"username":"cooldude6","password":"p_n7!-e8","phone":"415-392-0202"}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>users', json.dumps({
    "username": "cooldude6",
    "password": "p_n7!-e8",
    "phone": "415-392-0202"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Revocable-Session": "1",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

When the creation is successful, the HTTP response is a `201 Created` and the `Location` header contains the URL for the new user:

<pre><code class="javascript">
Status: 201 Created
Location: <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users/g7y9tkhB7O
</code></pre>

The response body is a JSON object containing the `objectId`, the `createdAt` timestamp of the newly-created object, and the `sessionToken` which can be used to authenticate subsequent requests as this user:

```jsonc
{
  "createdAt": "2022-01-01T12:23:45.678Z",
  "objectId": "g7y9tkhB7O",
  "sessionToken": "r:pnktnjyb996sj4p156gjtp4im"
}
```

## Logging In

After you allow users to sign up, you need to let them log in to their account with a username and password in the future. To do this, send a POST request to the <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>login</code> endpoint with `username` and `password` as parameters in the body:


<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Revocable-Session: 1" \
  -H "Content-Type: application/json" \
  -d '{"username":"cooldude6","password":"p_n7!-e8"}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>login
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>login', json.dumps({
    "username": "cooldude6",
    "password": "p_n7!-e8"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Revocable-Session": "1",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The response body is a JSON object containing all the user-provided fields except `password`. It also contains the `createdAt`, `updatedAt`, `objectId`, and `sessionToken` fields:

```jsonc
{
  "username": "cooldude6",
  "phone": "415-392-0202",
  "createdAt": "2022-01-01T12:23:45.678Z",
  "updatedAt": "2022-01-01T12:23:45.678Z",
  "objectId": "g7y9tkhB7O",
  "sessionToken": "r:pnktnjyb996sj4p156gjtp4im"
}
```

## Verifying Emails

Enabling email verification in an application's settings allows the application to reserve part of its experience for users with confirmed email addresses. Email verification adds the `emailVerified` field to the `User` object. When a `User`'s `email` is set or modified, `emailVerified` is set to `false`. Parse then emails the user a link which will set `emailVerified` to `true`.

There are three `emailVerified` states to consider:

1.  `true` - the user confirmed his or her email address by clicking on the link Parse emailed them. `Users` can never have a `true` value when the user account is first created.
2.  `false` - at the time the `User` object was last refreshed, the user had not confirmed his or her email address. If `emailVerified` is `false`, consider refreshing the `User` object.
3.  _missing_ - the `User` was created when email verification was off or the `User` does not have an `email`.

You can request a verification email to be sent by sending a POST request to <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>verificationEmailRequest</code> with `email` in the body of the request:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"email":"email@example.com"}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>verificationEmailRequest
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>verificationEmailRequest', json.dumps({
    "email": "email@example.com"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Note that a verification email will not be sent if the email has already been successfully verified.

## Requesting A Password Reset

You can initiate password resets for users who have emails associated with their account. To do this, send a POST request to <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>requestPasswordReset</code> endpoint with `email` in the body of the request:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"email":"coolguy@iloveapps.com"}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>requestPasswordReset
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>requestPasswordReset', json.dumps({
    "email": "coolguy@iloveapps.com"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

If successful, the response body is an empty JSON object.

## Retrieving Users

You can also retrieve the contents of a user object by sending a GET request to the URL returned in the location header when it was created. For example, to retrieve the user created above:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users/g7y9tkhB7O
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>users/g7y9tkhB7O', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The response body is a JSON object containing all the user-provided fields except `password`. It also contains the `createdAt`, `updatedAt`, and `objectId` fields:

```jsonc
{
  "username": "cooldude6",
  "phone": "415-392-0202",
  "createdAt": "2022-01-01T12:23:45.678Z",
  "updatedAt": "2022-01-01T12:23:45.678Z",
  "objectId": "g7y9tkhB7O"
}
```

## Validating Session Tokens / Retrieving Current User

With a valid session token, you can send a GET request to the <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>users/me</code> endpoint to retrieve the user associated with that session token:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Session-Token: r:pnktnjyb996sj4p156gjtp4im" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users/me
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>users/me', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "r:pnktnjyb996sj4p156gjtp4im"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The response matches the JSON object above for retrieving users. If the session token is not valid, an error object is returned:

```jsonc
{
  "code": 209,
  "error": "invalid session token"
}
```

## Updating Users

In normal usage, nobody except the user is allowed to modify their own data. To authenticate themselves, the user must add a `X-Parse-Session-Token` header to the request with the session token provided by the signup or login method.

To change the data on a user that already exists, send a PUT request to the user URL. Any keys you don't specify will remain unchanged, so you can update just a subset of the user's data. `username` and `password` may be changed, but the new username must not already be in use.

For example, if we wanted to change the phone number for `cooldude6`:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Session-Token: r:pnktnjyb996sj4p156gjtp4im" \
  -H "Content-Type: application/json" \
  -d '{"phone":"415-369-6201"}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users/g7y9tkhB7O
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>users/g7y9tkhB7O', json.dumps({
    "phone": "415-369-6201"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "r:pnktnjyb996sj4p156gjtp4im",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The response body is a JSON object containing just an `updatedAt` field with the timestamp of the update.

```jsonc
{
  "updatedAt": "2022-01-01T12:23:45.678Z"
}
```

## Querying

You can retrieve multiple users at once by sending a GET request to the root users URL. Without any URL parameters, this simply lists users:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>users', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The return value is a JSON object that contains a `results` field with a JSON array that lists the objects.

```jsonc
{
  "results": [
    {
      "username": "bigglesworth",
      "phone": "650-253-0000",
      "createdAt": "2022-01-01T12:23:45.678Z",
      "updatedAt": "2022-01-01T12:23:45.678Z",
      "objectId": "3KmCvT7Zsb"
    },
    {
      "username": "cooldude6",
      "phone": "415-369-6201",
      "createdAt": "2022-01-01T12:23:45.678Z",
      "updatedAt": "2022-01-01T12:23:45.678Z",
      "objectId": "g7y9tkhB7O"
    }
  ]
}
```

All of the options for queries that work for regular objects also work for user objects, so check the section on [Querying Objects](#basic-queries) for more details.

## Deleting Users

To delete a user from the Parse Cloud, send a DELETE request to its URL. You must provide the `X-Parse-Session-Token` header to authenticate. For example:

<div class="language-toggle">
<pre><code class="bash">
curl -X DELETE \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Session-Token: r:pnktnjyb996sj4p156gjtp4im" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users/g7y9tkhB7O
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('DELETE', '<span class="custom-parse-server-mount">/parse/</span>users/g7y9tkhB7O', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "r:pnktnjyb996sj4p156gjtp4im"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Linking Users

Parse allows you to link your users with services like Twitter and Facebook, enabling your users to sign up or log into your application using their existing identities. This is accomplished through the sign-up and update REST endpoints by providing authentication data for the service you wish to link to a user in the `authData` field. Once your user is associated with a service, the `authData` for the service will be stored with the user and is retrievable by logging in.

`authData` is a JSON object with keys for each linked service containing the data below. In each case, you are responsible for completing the authentication flow (e.g. OAuth 1.0a) to obtain the information the the service requires for linking.

### Facebook `authData`

```jsonc
{
  "facebook": {
    "id": "user's Facebook id number as a string",
    "access_token": "an authorized Facebook access token for the user",
    "expiration_date": "token expiration date of the format: yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
  }
}
```

Learn more about [Facebook login](https://developers.facebook.com/docs/authentication/).

### Twitter `authData`

```jsonc
{
  "twitter": {
    "id": "user's Twitter id number as a string",
    "screen_name": "user's Twitter screen name",
    "consumer_key": "your application's consumer key",
    "consumer_secret": "your application's consumer secret",
    "auth_token": "an authorized Twitter token for the user with your application",
    "auth_token_secret": "the secret associated with the auth_token"
  }
}
```

Learn more about [Twitter login](https://dev.twitter.com/docs/auth/implementing-sign-twitter).

### Anonymous user `authData`

```jsonc
{
  "anonymous": {
    "id": "random UUID with lowercase hexadecimal digits"
  }
}
```

### Signing Up and Logging In

Signing a user up with a linked service and logging them in with that service uses the same POST request, in which the `authData` for the user is specified. For example, to sign up or log in with a user's Twitter account:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Revocable-Session: 1" \
  -H "Content-Type: application/json" \
  -d '{
        "authData": {
          "twitter": {
            "id": "12345678",
            "screen_name": "ParseIt",
            "consumer_key": "SaMpLeId3X7eLjjLgWEw",
            "consumer_secret": "SaMpLew55QbMR0vTdtOACfPXa5UdO2THX1JrxZ9s3c",
            "auth_token": "12345678-SaMpLeTuo3m2avZxh5cjJmIrAfx4ZYyamdofM7IjU",
            "auth_token_secret": "SaMpLeEb13SpRzQ4DAIzutEkCE2LBIm2ZQDsP3WUU"
          }
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>users', json.dumps({
    "authData": {
        "twitter": {
            "id": "12345678",
            "screen_name": "ParseIt",
            "consumer_key": "SaMpLeId3X7eLjjLgWEw",
            "consumer_secret": "SaMpLew55QbMR0vTdtOACfPXa5UdO2THX1JrxZ9s3c",
            "auth_token": "12345678-SaMpLeTuo3m2avZxh5cjJmIrAfx4ZYyamdofM7IjU",
            "auth_token_secret": "SaMpLeEb13SpRzQ4DAIzutEkCE2LBIm2ZQDsP3WUU"
        }
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Revocable-Session": "1",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Parse then verifies that the provided `authData` is valid and checks to see if a user is already associated with this data. If so, it returns a status code of `200 OK` and the details (including a `sessionToken` for the user):

<pre><code class="javascript">
Status: 200 OK
Location: <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users/uMz0YZeAqc
</code></pre>

With a response body like:

```jsonc
{
  "username": "Parse",
  "createdAt": "2022-01-01T12:23:45.678Z",
  "updatedAt": "2022-01-01T12:23:45.678Z",
  "objectId": "uMz0YZeAqc",
  "sessionToken": "r:samplei3l83eerhnln0ecxgy5",
  "authData": {
    "twitter": {
      "id": "12345678",
      "screen_name": "ParseIt",
      "consumer_key": "SaMpLeId3X7eLjjLgWEw",
      "consumer_secret": "SaMpLew55QbMR0vTdtOACfPXa5UdO2THX1JrxZ9s3c",
      "auth_token": "12345678-SaMpLeTuo3m2avZxh5cjJmIrAfx4ZYyamdofM7IjU",
      "auth_token_secret": "SaMpLeEb13SpRzQ4DAIzutEkCE2LBIm2ZQDsP3WUU"
    }
  }
}
```

If the user has never been linked with this account, you will instead receive a status code of `201 Created`, indicating that a new user was created:

<pre><code class="javascript">
Status: 201 Created
Location: <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users/uMz0YZeAqc
</code></pre>

The body of the response will contain the `objectId`, `createdAt`, `sessionToken`, and an automatically-generated unique `username`. For example:

```jsonc
{
  "username": "iwz8sna7sug28v4eyu7t89fij",
  "createdAt": "2022-01-01T12:23:45.678Z",
  "objectId": "uMz0YZeAqc",
  "sessionToken": "r:samplei3l83eerhnln0ecxgy5"
}
```

### Linking

Linking an existing user with a service like Facebook or Twitter uses a PUT request to associate `authData` with the user. For example, linking a user with a Facebook account would use a request like this:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Session-Token: r:samplei3l83eerhnln0ecxgy5" \
  -H "Content-Type: application/json" \
  -d '{
        "authData": {
          "facebook": {
            "id": "123456789",
            "access_token": "SaMpLeAAibS7Q55FSzcERWIEmzn6rosftAr7pmDME10008bWgyZAmv7mziwfacNOhWkgxDaBf8a2a2FCc9Hbk9wAsqLYZBLR995wxBvSGNoTrEaL",
            "expiration_date": "2022-01-01T12:23:45.678Z"
          }
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users/uMz0YZeAqc
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>users/uMz0YZeAqc', json.dumps({
    "authData": {
        "facebook": {
            "id": "123456789",
            "access_token": "SaMpLeAAibS7Q55FSzcERWIEmzn6rosftAr7pmDME10008bWgyZAmv7mziwfacNOhWkgxDaBf8a2a2FCc9Hbk9wAsqLYZBLR995wxBvSGNoTrEaL",
            "expiration_date": "2022-01-01T12:23:45.678Z"
        }
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "r:samplei3l83eerhnln0ecxgy5",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

After linking your user to a service, you can authenticate them using matching `authData`.

### Unlinking

Unlinking an existing user with a service also uses a PUT request to clear `authData` from the user by setting the `authData` for the service to `null`. For example, unlinking a user with a Facebook account would use a request like this:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Session-Token: r:samplei3l83eerhnln0ecxgy5" \
  -H "Content-Type: application/json" \
  -d '{
        "authData": {
          "facebook": null
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users/uMz0YZeAqc
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>users/uMz0YZeAqc', json.dumps({
    "authData": {
        "facebook": null
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "r:samplei3l83eerhnln0ecxgy5",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## `User` Security

When you access Parse via the REST API key, access can be restricted by ACL just like in the iOS and Android SDKs. You can still read and modify acls via the REST API, just by accessing the `"ACL"` key of an object.

The ACL is formatted as a JSON object where the keys are either object ids or the special key `"*"` to indicate public access permissions. The values of the ACL are "permission objects", JSON objects whose keys are the permission names and whose values are always `true`.

For example, if you want the user with id `"3KmCvT7Zsb"` to have read and write access to an object, plus the object should be publicly readable, that corresponds to an ACL of:

```jsonc
"ACL": {
  "3KmCvT7Zsb": {
    "read": true,
    "write": true
  },
  "*": {
    "read": true
  }
}
```

If you want to access your data ignoring all ACLs, you can use the master key provided on the Dashboard. Instead of the `X-Parse-REST-API-Key` header, set the `X-Parse-Master-Key` header. For backward compatibility, you can also do master-level authentication using HTTP Basic Auth, passing the application id as the username and the master key as the password. For security, the master key should not be distributed to end users, but if you are running code in a trusted environment, feel free to use the master key for authentication.

## User Impersonation

An application may allow a user to take action on behalf of another user, without having access to the other user's login credentials. The Parse REST API provides the `/loginAs` endpoint which takes a `userId` parameter, that is the `objectId` of the user for which a session should be created. A session that has been created this way can be identified by its `createdWith` property:

```jsonc
"createdWith": {
  "action": "login",
  "authProvider": "masterkey"
}
```

Calling the endpoint requires the master key and it returns the same response format as the `/login` endpoint.

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Master-Key: ${MASTER_KEY}" \
  -H "X-Parse-Revocable-Session: 1" \
  -G \
  --data-urlencode 'userId=abc123' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>loginAs
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"userId": "abc123"})
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>loginAs?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Master-Key": "${MASTER_KEY}",
    "X-Parse-Revocable-Session": "1"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Calling this endpoint does not invoke [session triggers](https://docs.parseplatform.org/cloudcode/guide/#session-triggers) such as `beforeLogin` and `afterLogin`. This action will always succeed if the supplied user exists in the database, regardless of whether the user is currently locked out.
