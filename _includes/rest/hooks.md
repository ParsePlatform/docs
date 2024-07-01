# Hooks

You can create, update, list or delete all your cloud code webhooks via the Hooks API,
in addition to being able to do so through the parse website.

Hooks API requires the users to provide `Application-Id` and `Master-Key` in the request headers.

There are two kinds of cloud code webhooks: function webhooks and trigger webhooks.

Cloud functions are functions that run in the cloud and allow you to build functions
common to all platforms.
For more details please read [cloud code functions]({{ site.baseUrl }}/cloudcode/guide/#cloud-functions).

Cloud triggers are invoked whenever you save or delete a parse object.
Triggers are commonly used to validate your objects before saving them.
For more details please read [cloud code triggers]({{ site.baseUrl }}/cloudcode/guide/#beforesave-triggers).

Lets establish some basic terminology used throughout the rest of this section.

`Cloud Code Webhooks` consist of `function webhooks` and `trigger webhooks`. This is code that runs on your servers.

`Cloud Code` has `cloud code functions` and `cloud code triggers`. This is code that runs on the Parse servers.

These are the generic concepts encapsulating both use cases:

`Cloud Function` is either a `cloud code function` or a `function webhook`.
`Cloud Trigger` is either a `cloud code trigger` or a `trigger webhook`.

A function webhook has a name and a url. Hence, its JSON response looks like:
<pre><code class="json">
{"functionName": "foo", "url": "https://api.example.com/foo"}
</code></pre>

JSON reponse for a cloud code function just contains the function name.
<pre><code class="json">
{"functionName": "foo"}
</code></pre>

A trigger webhook belongs to a class, has a trigger name and a url. Hence, its JSON response looks like:
<pre><code class="json">
{"className": "score", "triggerName": "beforeSave", "url": "https://api.example.com/score/beforeSave"}
</code></pre>

JSON response for a cloud code trigger contains the class name and the trigger name.
<pre><code class="json">
{"className": "score", "triggerName": "beforeSave"}
</code></pre>
Note that trigger name can only be one of `beforeSave`, `afterSave`, `beforeDelete` and `afterDelete`.


## Fetch functions
To fetch the list of all cloud functions you deployed or created, use:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/functions
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>hooks/functions', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output is a json object with one key: "results" whose value is a list of cloud functions.

<pre><code class="json">
{
  "results": [
    { "functionName": "sendMessage", "url": "https://api.example.com/sendMessage" },
    { "functionName": "sendMessage" },
    { "functionName": "foo", "url": "https://api.example.com/foo" },
    { "functionName": "bar" }
  ]
}
</code></pre>

To fetch a single cloud function with a given name, use:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/functions/sendMessage
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>hooks/functions/sendMessage', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output is a json object with one key: "results" whose value is a list of cloud functions with the given name.

<pre><code class="json">
{
  "results": [
    { "functionName": "sendMessage", "url": "https://api.example.com/sendMessage" },
    { "functionName": "sendMessage" }
  ]
}
</code></pre>

## Fetch triggers
To fetch the list of all cloud triggers you deployed or created, use:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/triggers
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>hooks/triggers', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output is a json object with one key: "results" whose value is a list of cloud triggers.

<pre><code class="json">
{
  "results": [
    { "className": "Scores", "triggerName": "beforeSave" },
    {
      "className": "Scores",
      "triggerName": "beforeSave",
      "url": "https://api.example.com/Scores/beforeSave"
    },
    {
      "className": "Game",
      "triggerName": "afterSave",
      "url": "https://api.example.com/Game/afterSave"
    },
    { "className": "Tournament", "triggerName": "beforeDelete" }
  ]
}
</code></pre>

To fetch a single cloud trigger, use:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/triggers/Scores/beforeSave
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>hooks/triggers/Scores/beforeSave', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The path looks like `/hooks/triggers/className/triggerName` where `triggerName`
can be one of `beforeSave`, `afterSave`, `beforeDelete`, `afterDelete`.

The output may look like this:

<pre><code class="json">
{
  "results": [
    { "className": "Scores", "triggerName": "beforeSave" },
    {
      "className": "Scores",
      "triggerName": "beforeSave",
      "url": "https://api.example.com/Scores/beforeSave"
    }
  ]
}
</code></pre>

The output is a json object with one key: "results" whose value is a list of all
cloud triggers with given name for a given class.

Note that POST, PUT and DELETE only work on function or trigger webhooks.
To create cloud code functions or cloud code triggers you can modify your cloud code javascript files
and perform a `parse deploy` the usual way.

## Create function webhook
To create a new function webhook post to <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>hooks/functions</code> with payload in the format

```jsonc
{
  "functionName": "foo", 
  "url": "https://api.example.com/foo"
}
```

Post example:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"functionName":"baz","url":"https://api.example.com/baz"}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/functions
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>hooks/functions', json.dumps({
    "functionName": "baz",
    "url": "https://api.example.com/baz"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>


The output may look like this:
<pre><code class="json">
{"functionName": "baz", "url": "https://api.example.com/baz"}'
</code></pre>

It returns the function name and url of the created webhook.

If you try to create a function webhook and a cloud code function with the same name already exists, upon successful creation the response json has an additional `warning` field informing about the name conflict. Note that, function webhooks takes precedence over cloud code functions.

For example:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"functionName":"bar","url":"https://api.example.com/bar"}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/functions
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>hooks/functions', json.dumps({
    "functionName": "bar",
    "url": "https://api.example.com/bar"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output may look like this:

<pre><code class="json">
{
  "functionName": "bar",
  "url": "https://api.example.com/bar",
  "warning": "a cloudcode function with name: bar already exists"
}
</code></pre>

## Create trigger webhook
To create a new function webhook post to <code class="highlighter-rouge"><span class="custom-parse-server-mount">/parse/</span>hooks/triggers</code> with payload in the format:

<div class="language-toggle">
<pre><code class="bash">
{"className": x, "triggerName": y, "url": z}
</code></pre>
<pre><code class="python">
{"className": x, "triggerName": y, "url": z}
</code></pre>
</div>

Post example:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"className": "Game", "triggerName": "beforeSave", "url": "https://api.example.com/Game/beforeSave"}' \
<span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/triggers
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>hooks/triggers', json.dumps({
    "className": "Game",
    "triggerName": "beforeSave",
    "url": "https://api.example.com/Game/beforeSave"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output may look like this:

<pre><code class="json">
{
  "className": "Game",
  "triggerName": "beforeSave",
  "url": "https://api.example.com/Game/beforeSave"
}
</code></pre>

It returns the class name, trigger name and url of the created trigger webhook.

If you try to create a trigger webhook and a cloud code trigger with the same name already exists, upon successful creation the response json has an additional `warning` field informing about the name conflict. Note that, trigger webhooks takes precedence over cloud code triggers.

For example:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"className": "Tournament", "triggerName": "beforeDelete", "url": "https://api.example.com/Scores/beforeDelete"}' \
<span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/triggers
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>hooks/triggers', json.dumps({
    "className": "Tournament",
    "triggerName": "beforeDelete",
    "url": "https://api.example.com/Scores/beforeDelete"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output may look like this:

<pre><code class="json">
{
  "className": "Tournament",
  "triggerName": "beforeDelete",
  "url": "https://api.example.com/Tournament/beforeDelete",
  "warning": "beforeDelete trigger already defined for class Tournament in cloud code"
}
</code></pre>

## Edit function webhook
To edit the url of a function webhook that was already created use the put method.

Put example:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://api.example.com/_baz"}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/functions/baz
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>hooks/functions/baz', json.dumps({
    "url":"https://api.example.com/_baz"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output may look like this:

<pre><code class="json">
{"functionName": "baz", "url": "https://api.example.com/baz"}'
</code></pre>

It returns the function name and url of the modified webhook.

If you try to update a function webhook and a cloud code function with the same name already exists, upon successful update the response json has an additional `warning` field informing about the name conflict. Note that, function webhooks takes precedence over cloud code functions.

For example:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://api.example.com/_bar"}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/functions/bar
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>hooks/functions/bar', json.dumps({
    "url": "https://api.example.com/_bar"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output may look like this:

<pre><code class="json">
{
  "functionName": "bar",
  "url": "https://api.example.com/_bar",
  "warning": "a cloudcode function with name: bar already exists"
}
</code></pre>

## Edit trigger webhook
To edit the url of a trigger webhook that was already crated use the put method.

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.example.com/Game/_beforeSave"}' \
<span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/triggers/Game/beforeSave
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>hooks/triggers/Game/beforeSave', json.dumps({
    "url": "https://api.example.com/Game/_beforeSave"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output may look like this:

<pre><code class="json">
{
  "className": "Game",
  "triggerName": "beforeSave",
  "url": "https://api.example.com/Game/_beforeSave"
}
</code></pre>

It returns the class name, trigger name and url of the modified trigger webhook.

If you try to update a trigger webhook and a cloud code trigger with the same name already exists, upon successful update the response json has an additional `warning` field informing about the name conflict. Note that, trigger webhooks takes precedence over cloud code triggers.

For example:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.example.com/Scores/beforeDelete"}' \
<span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/triggers/Tournament/beforeDelete
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>hooks/triggers/Tournament/beforeDelete', json.dumps({
    "url": "https://api.example.com/Scores/beforeDelete"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output may look like this:

<pre><code class="json">
{
  "className": "Tournament",
  "triggerName": "beforeDelete",
  "url": "https://api.example.com/Tournament/beforeDelete",
  "warning": "beforeDelete trigger already defined for class Tournament in cloud code"
}
</code></pre>

## Delete function webhook
To delete a function webhook use the put method.

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"__op": "Delete"}' \
<span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/functions/foo
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>hooks/functions/foo', json.dumps({
    "__op": "Delete"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output may look like this:

<pre><code class="json">
{}
</code></pre>

If a cloud code function with the same name already exists then it is returned as the result.
Since the overriding webhook was just deleted, this cloud code function will be run the next time sendMessage is called.

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{ "__op": "Delete" }' \
<span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/functions/sendMessage
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>hooks/functions/sendMessage', json.dumps({
    "__op": "Delete"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output may look like this:

<pre><code class="json">
{ "functionName": "sendMessage" }
</code></pre>

## Delete trigger webhook
To delete a trigger webhook use the put method.

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{ "__op": "Delete" }' \
<span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/triggers/Game/beforeSave
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>hooks/triggers/Game/beforeSave', json.dumps({
    "__op": "Delete"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output may look like this:

<pre><code class="json">
{}
</code></pre>

If a cloud code trigger with the same name already exists then the it is returned as the result.
Since the overriding webhook was just deleted, this cloud code trigger will be run the next time a Tournament object is saved.

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{ "__op": "Delete" }' \
<span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>hooks/triggers/Tournament/beforeDelete
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>hooks/triggers/Tournament/beforeDelete', json.dumps({
    "__op": "Delete"
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The output may look like this:

<pre><code class="json">
{
  "className": "Tournament",
  "triggerName": "beforeDelete"
}
</code></pre>
