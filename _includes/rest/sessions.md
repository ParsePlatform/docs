# Sessions

Sessions represent an instance of a user logged into a device. Sessions are automatically created when users log in or sign up. They are automatically deleted when users log out. There is one distinct `Session` object for each user-installation pair; if a user issues a login request from a device they're already logged into, that user's previous `Session` object for that Installation is automatically deleted. `Session` objects are stored on Parse in the Session class, and you can view them on the Parse Dashboard Data Browser. We provide a set of APIs to manage `Session` objects in your app.

A `Session` is a subclass of a Parse `Object`, so you can query, update, and delete sessions in the same way that you manipulate normal objects on Parse. Because the Parse Cloud automatically creates sessions when you log in or sign up users, you should not manually create `Session` objects unless you are building an IoT app (e.g. Arduino or Embedded C). Deleting a `Session` will log the user out of the device that is currently using this session's token.

Unlike other Parse objects, the `Session` class does not have Cloud Code triggers. So you cannot register a `beforeSave` or `afterSave` handler for the Session class.

## `Session` Properties

The `Session` object has these special fields:

* `sessionToken` (readonly): String token for authentication on Parse API requests. In the response of `Session` queries, only your current `Session` object will contain a session token.
* `user`: (readonly) Pointer to the `User` object that this session is for.
* `createdWith` (readonly): Information about how this session was created (e.g. `{ "action": "login", "authProvider": "password"}`).
    * `action` could have values: `login`, `signup`, `create`, or `upgrade`. The `create` action is when the developer manually creates the session by saving a `Session` object.  The `upgrade` action is when the user is upgraded to revocable session from a legacy session token.
    * `authProvider` could have values: `password`, `anonymous`, `facebook`, or `twitter`.
* `restricted` (readonly): Boolean for whether this session is restricted.
    * Restricted sessions do not have write permissions on `User`, `Session`, and `Role` classes on Parse. Restricted sessions also cannot read unrestricted sessions.
    * All sessions that the Parse Cloud automatically creates during user login/signup will be unrestricted. All sessions that the developer manually creates by saving a new `Session` object from the client (only needed for IoT apps) will be restricted.
* `expiresAt` (readonly): Approximate UTC date when this `Session` object will be automatically deleted. You can configure session expiration settings (either 1-year inactivity expiration or no expiration) in your app's Parse Dashboard settings page.
* `installationId` (can be set only once): String referring to the `Installation` where the session is logged in from. For the REST API, you can set this by passing the `X-Parse-Installation-Id` header on login and signup requests.
All special fields except `installationId` can only be set automatically by the Parse Cloud. You can add custom fields onto `Session` objects, but please keep in mind that any logged-in device (with session token) can read other sessions that belong to the same user (unless you disable Class-Level Permissions, see below).

## Handling Invalid Session Token Error

Apps created before March 25, 2015 use legacy session tokens until you migrate them to use the new revocable sessions. On API requests with legacy tokens, if the token is invalid (e.g. User object was deleted), then the request is executed as a non-logged in user and no error was returned. On API requests with revocable session tokens, an invalid session token will always fail with the "invalid session token" error. This new behavior lets you know when you need to ask the user to log in again.

With revocable sessions, your current session token could become invalid if its corresponding `Session` object is deleted from the Parse Cloud. This could happen if you implement a Session Manager UI that lets users log out of other devices, or if you manually delete the session via Cloud Code, REST API, or Data Browser. Sessions could also be deleted due to automatic expiration (if configured in app settings). When a device's session token no longer corresponds to a `Session` object on the Parse Cloud, all API requests from that device will fail with “Error 209: invalid session token”.

## Creating Sessions

For mobile apps and websites, you should not create `Session` objects manually. Instead, you should call <code class="highlighter-rouge">GET <span class="custom-parse-server-mount">/parse/</span>login</code> and <code class="highlighter-rouge">POST <span class="custom-parse-server-mount">/parse/</span>users</code> (signup), which will automatically generate a `Session` object in the Parse Cloud. The session token for this automatically-created session will be sent back on the login and signup response. Same for Facebook/Twitter login and signup requests.

## Retrieving Sessions

If you have the session's objectId, you fetch the `Session` object as long as it belongs to the same user as your current session:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Session-Token: r:pnktnjyb996sj4p156gjtp4im" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>sessions/Axy98kq1B09
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>sessions/Axy98kq1B09', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "r:pnktnjyb996sj4p156gjtp4im"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

If you only have the session's token (from previous login or session create), you can validate and fetch the corresponding session by:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Session-Token: r:pnktnjyb996sj4p156gjtp4im" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>sessions/me
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>sessions/me', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "r:pnktnjyb996sj4p156gjtp4im"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Updating Sessions

Updating a session is analogous to updating a Parse object.

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Session-Token: r:pnktnjyb996sj4p156gjtp4im" \
  -H "Content-Type: application/json" \
  -d '{"customField":"value"}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>sessions/Axy98kq1B09
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>logout', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "r:pnktnjyb996sj4p156gjtp4im"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Querying Sessions

Querying for `Session` objects will only return objects belonging to the same user as your current session (due to the Session ACL). You can also add a where clause to your query, just like normal Parse objects.

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Session-Token: r:pnktnjyb996sj4p156gjtp4im" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>sessions
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>sessions', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "r:pnktnjyb996sj4p156gjtp4im"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Deleting Sessions

Deleting the Session object will revoke its session token and cause the user to be logged out on the device that's currently using this session token. When you have the session token, then you can delete its `Session` object by calling the logout endpoint:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Session-Token: r:pnktnjyb996sj4p156gjtp4im" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>logout
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>logout', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "r:pnktnjyb996sj4p156gjtp4im"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

If you want to delete another `Session` object for your user, and you have its `objectId`, you can delete it (but not log yourself out) by:

<div class="language-toggle">
<pre><code class="bash">
curl -X DELETE \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Session-Token: r:pnktnjyb996sj4p156gjtp4im" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>sessions/Axy98kq1B09
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('DELETE', '<span class="custom-parse-server-mount">/parse/</span>sessions/Axy98kq1B09', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "r:pnktnjyb996sj4p156gjtp4im"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

`X-Parse-Session-Token` authenticates the request as the user that also owns session `Axy98kq1B09`, which may have a different session token. You can only delete other sessions that belong to the same user.

## Pairing Session with Installation

For normal user login with the <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>login</code> endpoint, the Parse Cloud will set the automatically-created `Session` object's `installationId` to the `X-Parse-Installation-Id` header passed on the login or signup request. Therefore, for these scenarios, you don't need to manually associate the `Session` object with an installation.

The following API is most useful for IoT apps (e.g. Arduino or Embedded C). During IoT device provisioning, the phone typically does not know the `installationId` of the IoT device. The provisioning process typically goes like this:

1. Phone creates a restricted session (with blank `installationId`) for the device.
2. IoT device acts as a Wi-Fi software access point. Phone passes this newly-created session's token, along with the Wi-Fi password, to the IoT device.
3. IoT device connects to Internet via Wi-Fi, saves its `Installation` object.
4. IoT device calls the following endpoint to associate the its `installationId` with its session. This endpoint only works with session tokens from restricted sessions. Please note that REST API calls from an IoT device should use the Client Key, not the REST API Key.

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Client-Key: <span class="custom-parse-server-clientkey">${CLIENT_KEY}</span>" \
  -H "X-Parse-Session-Token: r:aVrtljyb7E8xKo9256gfvp4n2" \
  -H "X-Parse-Installation-Id: 2d3777a5-f5fc-4caf-80be-73c766235afb" \
  -H "Content-Type: application/json" \
  -d '{}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>sessions/me
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>sessions/me', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "r:aVrtljyb7E8xKo9256gfvp4n2",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Session Security

`Session` objects can only be accessed by the user specified in the user field. All `Session` objects have an ACL that is read and write by that user only. You cannot change this ACL. This means querying for sessions will only return objects that match the current logged-in user.

When you log in a user via <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>login</code>, Parse will automatically create a new unrestricted `Session` object in the Parse Cloud. Same for signups and Facebook/Twitter logins.

Session objects manually created from <code class="highlighter-rouge">POST <span class="custom-parse-server-mount">/parse/</span>sessions</code> are always restricted. You cannot manually create an unrestricted sessions using the object creation API.

Restricted sessions are prohibited from creating, modifying, or deleting any data in the `User`, `Session`, and `Role` classes. Restricted session also cannot read unrestricted sessions. Restricted Sessions are useful for IoT devices (e.g Arduino or Embedded C) that may run in a less-trusted physical environment than mobile apps. However, please keep in mind that restricted sessions can still read data on `User`, `Session`, and `Role` classes, and can read/write data in any other class just like a normal session. So it is still important for IoT devices to be in a safe physical environment and ideally use encrypted storage to store the session token.

If you want to prevent restricted Sessions from modifying classes other than `User`, `Session`, or `Role`, you can write a Cloud Code `beforeSave` handler for that class:

<pre><code class="javascript">
Parse.Cloud.beforeSave("MyClass", async request => {
  const user = request.user;
  const token = user.getSessionToken(); 
  const query = new Parse.Query(Parse.Session);
  query.equalTo('sessionToken', token);
  const session = await q.first({ useMasterKey: true });
  if (session.get('restricted')) {
      throw 'write operation not allowed';
  }
});
</code></pre>

You can configure Class-Level Permissions (CLPs) for the Session class just like other classes on Parse. CLPs restrict reading/writing of sessions via the <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>sessions</code> API, but do not restrict Parse Cloud's automatic session creation/deletion when users log in, sign up, and log out. We recommend that you disable all CLPs not needed by your app. Here are some common use cases for Session CLPs:

* **Find**, **Delete** — Useful for building a UI screen that allows users to see their active session on all devices, and log out of sessions on other devices. If your app does not have this feature, you should disable these permissions.
* **Create** — Useful for IoT apps (e.g. Arduino or Embedded C) that provision restricted user sessions for other devices from the phone app. You should disable this permission when building apps for mobile and web. For IoT apps, you should check whether your IoT device actually needs to access user-specific data. If not, then your IoT device does not need a user session, and you should disable this permission.
* **Get**, **Update**, **Add Field** — Unless you need these operations, you should disable these permissions.
