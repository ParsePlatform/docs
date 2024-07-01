# Quick Reference

For your convenience you can customize [your configuration](#your-configuration) to change the default server url, mount path and additional values to match your personal setup.

All API access is provided via the domain to your parse server instance. In cases where a domain is used to access the API we will reference `YOUR.PARSE-SERVER.HERE`{: .custom-parse-server-url}, which should be set to your domain in [your configuration](#your-configuration).

The relative path prefix `/parse/` is the default mount path for most installations. If you are using a different mount path be sure to change this to accommodate for your instance. If you are using a hosted service this may be something other than the expected `/parse/`, be sure to check before you proceed. For the following examples we will be using `/parse/`{: .custom-parse-server-mount}, which can be set in [your configuration](#your-configuration).

API access can be provided over **HTTPS** and **HTTP**. We recommend utilizing **HTTPS** for anything other than local development. If you are using a hosted service you will almost certainly be accessing your API exclusively over **HTTPS**.

## Objects API

| URL                                 | HTTP Verb | Functionality                                      |
|-------------------------------------|-----------|----------------------------------------------------|
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>classes/&lt;className&gt;</code>            | POST      | [Creating Objects](#creating-objects)      |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>classes/&lt;className&gt;/&lt;objectId&gt;</code> | GET       | [Retrieving Objects](#retrieving-objects)  |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>classes/&lt;className&gt;/&lt;objectId&gt;</code> | PUT       | [Updating Objects](#updating-objects)      |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>classes/&lt;className&gt;</code>            | GET       | [Queries](#queries)                                |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>classes/&lt;className&gt;/&lt;objectId&gt;</code> | DELETE    | [Deleting Objects](#deleting-objects)      |
{: .docs_table}

## Users API

| URL                       | HTTP Verb | Functionality                                                      |
|---------------------------|-----------|--------------------------------------------------------------------|
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>users</code>                | POST      | [Signing Up](#signing-up) <br/>[Linking Users](#linking-users) |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>login</code>                | GET       | [Logging In](#logging-in)                                    |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>logout</code>               | POST      | [Logging Out](#deleting-sessions)                         |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>users/&lt;objectId&gt;</code>     | GET       | [Retrieving Users](#retrieving-users)                        |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>users/me</code>             | GET       | [Validating Session Tokens](#validating-session-tokens--retrieving-current-user) <br/>[Retrieving Current User](#retrieving-users)                                        |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>users/&lt;objectId&gt;</code>     | PUT       | [Updating Users](#updating-users) <br/>[Linking Users](#linking-users) <br/>[Verifying Emails](#verifying-emails) |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>users</code>                | GET       | [Querying Users](#querying)                                  |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>users/&lt;objectId&gt;</code>     | DELETE    | [Deleting Users](#deleting-users)                            |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>requestPasswordReset</code> | POST      | [Requesting A Password Reset](#requesting-a-password-reset)  |
{: .docs_table}

## Sessions API

| URL                       | HTTP Verb |Functionality                               |
|---------------------------|-----------|--------------------------------------------|
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>sessions</code>             | POST      | [Creating Restricted Sessions](#creating-sessions) |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>sessions/&lt;objectId&gt;</code>  | GET       | [Retrieving Sessions](#retrieving-sessions) |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>sessions/me</code>          | GET       | [Retrieving Current Session](#retrieving-sessions) |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>sessions/&lt;objectId&gt;</code>  | PUT       | [Updating Sessions](#updating-sessions) |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>sessions</code>             | GET       | [Querying Sessions](#querying-sessions) |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>sessions/&lt;objectId&gt;</code>  | DELETE    | [Deleting Sessions](#deleting-sessions) |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>sessions/me</code>          | PUT       | [Pairing with Installation](#pairing-session-with-installation) |
{: .docs_table}

## Roles API

| URL                   | HTTP Verb | Functionality                               |
|-----------------------|-----------|---------------------------------------------|
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>roles</code>            | POST      | [Creating Roles](#creating-roles)     |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>roles/&lt;objectId&gt;</code> | GET       | [Retrieving Roles](#retrieving-roles) |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>roles/&lt;objectId&gt;</code> | PUT       | [Updating Roles](#updating-roles)     |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>roles/&lt;objectId&gt;</code> | DELETE    | [Deleting Roles](#deleting-roles)     |
{: .docs_table}

## Files API

| URL                   | HTTP Verb | Functionality                             |
|-----------------------|-----------|-------------------------------------------|
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>files/&lt;fileName&gt;</code> | POST      | [Uploading Files](#uploading-files) |
{: .docs_table}

## Analytics API

| URL                     | HTTP Verb | Functionality                                   |
|-------------------------|-----------|-------------------------------------------------|
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>events/AppOpened</code>   | POST      | [Analytics](#app-open-analytics)      |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>events/&lt;eventName&gt;</code> | POST      | [Custom Analytics](#custom-analytics) |
{: .docs_table}

## Push Notifications API

| URL       | HTTP Verb | Functionality                |
|-----------|-----------|------------------------------|
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>push</code> | POST      | [Push Notifications](#push-notifications)  |
{: .docs_table}

## Installations API

| URL                           | HTTP Verb | Functionality                                            |
|-------------------------------|-----------|----------------------------------------------------------|
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>installations</code>            | POST      | [Uploading Installation Data](#uploading-installation-data)  |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>installations/&lt;objectId&gt;</code> | GET       | [Retrieving Installations](#retrieving-installations)        |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>installations/&lt;objectId&gt;</code> | PUT       | [Updating Installations](#updating-installations)        |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>installations</code>            | GET       | [Querying Installations](#querying-installations)        |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>installations/&lt;objectId&gt;</code> | DELETE    | [Deleting Installations](#deleting-installations)        |
{: .docs_table}

## Cloud Functions API

| URL                   | HTTP Verb | Functionality                                             |
|-----------------------|-----------|-----------------------------------------------------------|
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>functions/&lt;name&gt;</code> | POST      | [Calling Cloud Functions](#calling-cloud-functions)    |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>jobs/&lt;name&gt;</code>      | POST      | [Triggering Background Jobs](#triggering-background-jobs) |
{: .docs_table}

## Schemas API

| URL                     | HTTP Verb | Functionality                                             |
|-------------------------|-----------|-----------------------------------------------------------|
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>schemas/</code>           | GET       | [Fetch All Schemas](#fetch-the-schema)             |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>schemas/&lt;className&gt;</code>| GET       | [Fetch Schema](#fetch-the-schema)                  |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>schemas/&lt;className&gt;</code>| POST      | [Create Schema](#adding-a-schema)                  |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>schemas/&lt;className&gt;</code>| PUT       | [Modify Schema](#modifying-the-schema)             |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>schemas/&lt;className&gt;</code>| DELETE    | [Delete Schema](#removing-a-schema)                |
{: .docs_table}

## Function Hooks API

| URL                                 | HTTP Verb | Functionality                                           |
|-------------------------------------|-----------|---------------------------------------------------------|
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>hooks/functions/&lt;functionName&gt;</code> | GET       | [Fetch Cloud Functions](#fetch-functions) |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>hooks/functions/</code>               | POST      | [Create Cloud Function](#create-function-webhook) |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>hooks/functions/&lt;functionName&gt;</code> | PUT       | [Edit Cloud Function](#edit-function-webhook)     |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>hooks/functions/&lt;functionName&gt;</code> | DELETE    | [Delete Cloud Function](#delete-function-webhook) |
{: .docs_table}

## Trigger Hooks API

| URL                                           | HTTP Verb | Functionality                                           |
|-----------------------------------------------|-----------|---------------------------------------------------------|
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>hooks/triggers/&lt;className&gt;/&lt;triggerName&gt;</code> | GET       | [Fetch Cloud Trigger](#fetch-triggers)      |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>hooks/triggers/</code>                          | POST      | [Create Cloud Trigger](#create-trigger-webhook)   |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>hooks/triggers/&lt;className&gt;/&lt;triggerName&gt;</code> | PUT       | [Edit Cloud Trigger](#edit-trigger-webhook)       |
| <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>hooks/triggers/&lt;className&gt;/&lt;triggerName&gt;</code> | DELETE    | [Delete Cloud Trigger](#delete-trigger-webhook)   |
{: .docs_table}

## Request Format

For POST and PUT requests, the request body must be JSON, with the `Content-Type` header set to `application/json`.

Authentication is done via HTTP headers. The `X-Parse-Application-Id` header identifies which application you are accessing, and the `X-Parse-REST-API-Key` header authenticates the endpoint.

In the examples that follow, the keys for your app are included in the command. You can use the drop-down to construct example code for other apps.

You may also authenticate your REST API requests using basic HTTP authentication. For example, to retrieve an object you could set the URL using your Parse credentials in the following format:

<pre><code class="json">
<span class="custom-parse-server-protocol">https</span>://myAppID:javascript-key=myJavaScriptKey@<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>

For JavaScript usage, the Parse Cloud supports [cross-origin resource sharing](http://en.wikipedia.org/wiki/Cross-Origin_Resource_Sharing), so that you can use these headers in conjunction with XMLHttpRequest.


## Response Format

The response format for all requests is a JSON object.

Whether a request succeeded is indicated by the HTTP status code. A 2xx status code indicates success, whereas a 4xx status code indicates failure. When a request fails, the response body is still JSON, but always contains the fields `code` and `error` which you can inspect to use for debugging. For example, trying to save an object with invalid keys will return the message:

```jsonc
{
  "code": 105,
  "error": "invalid field name: bl!ng"
}
```

## Calling from Client Apps

You should not use the REST API Key in client apps (i.e. code you distribute to your customers). If the Parse SDK is available for your client platform, we recommend using our SDK instead of the REST API. If you must call the REST API directly from the client, you should use the corresponding client-side Parse key for that plaform (e.g. Client Key for iOS/Android, or .NET Key for Windows/Xamarin/Unity).

If there is no Parse SDK for your client platform, please use your app's Client Key to call the REST API. Requests made with the Client Key, JavaScript Key, or Windows Key are restricted by client-side app settings that you configure in your Parse Dashboard app dashboard. These settings make your app more secure. For example, we recommend that all production apps turn off the "Client Push Enabled" setting to prevent push notifications from being sent from any device using the Client Key, JavaScript Key, or .NET Key, but not the REST API Key. Therefore, if you plan on registering installations to enable Push Notifications for your app, you should not distribute any app code with the REST API key embedded in it.

The JavaScript Key cannot be used to make requests directly against the REST API from JavaScript. The JavaScript Key is meant to be used with the Parse JavaScript SDK, which makes its posts through a Cross Origin-friendly format without HTTP headers.
