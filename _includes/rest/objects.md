# Objects

## Object Format

Storing data through the Parse REST API is built around a JSON encoding of the object's data. This data is schemaless, which means that you don't need to specify ahead of time what keys exist on each object. You simply set whatever key-value pairs you want, and the backend will store it.

For example, let's say you're tracking high scores for a game. A single object could contain:

```jsonc
{
  "score": 1337,
  "playerName": "Sean Plott",
  "cheatMode": false
}
```

Keys must be alphanumeric strings. Values can be anything that can be JSON-encoded.

Each object has a class name that you can use to distinguish different sorts of data. For example, we could call the high score object a `GameScore`. We recommend that you NameYourClassesLikeThis and nameYourKeysLikeThis, just to keep your code looking pretty.

When you retrieve objects from Parse, some fields are automatically added: `createdAt`, `updatedAt`, and `objectId`. These field names are reserved, so you cannot set them yourself. The object above could look like this when retrieved:

```jsonc
{
  "score": 1337,
  "playerName": "Sean Plott",
  "cheatMode": false,
  "createdAt": "2022-01-01T12:23:45.678Z",
  "updatedAt": "2022-01-01T12:23:45.678Z",
  "objectId": "Ed1nuqPvcm"
}
```

`createdAt` and `updatedAt` are UTC timestamps stored in ISO 8601 format with millisecond precision: `YYYY-MM-DDTHH:MM:SS.MMMZ`. `objectId` is a string unique to this class that identifies this object.

In the REST API, the class-level operations operate on a resource based on just the class name. For example, if the class name is `GameScore`, the class URL is:

<pre><code class="javascript">
<span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>

Users have a special class-level url:

<pre><code class="javascript">
<span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users
</code></pre>

The operations specific to a single object are available as a nested URL. For example, operations specific to the `GameScore` above with `objectId` equal to `Ed1nuqPvcm` would use the object URL:

<pre><code class="javascript">
<span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>


## Creating Objects

To create a new object on Parse, send a POST request to the class URL containing the contents of the object. For example, to create the object described above:

<div class="language-toggle">
<pre><code class="bash">
  curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"score":1337,"playerName":"Sean Plott","cheatMode":false}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore', json.dumps({
    "score": 1337,
    "playerName": "Sean Plott",
    "cheatMode": False
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
results = json.loads(connection.getresponse().read())
print results
</code></pre>
</div>

When the creation is successful, the HTTP response is a `201 Created` and the `Location` header contains the object URL for the new object:

<pre><code class="javascript">
Status: 201 Created
Location: <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>

The response body is a JSON object containing the `objectId` and the `createdAt` timestamp of the newly-created object:

```jsonc
{
  "createdAt": "2022-01-01T12:23:45.678Z",
  "objectId": "Ed1nuqPvcm"
}
```

## Retrieving Objects

Once you've created an object, you can retrieve its contents by sending a GET request to the object URL returned in the location header. For example, to retrieve the object we created above:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The response body is a JSON object containing all the user-provided fields, plus the `createdAt`, `updatedAt`, and `objectId` fields:

```jsonc
{
  "score": 1337,
  "playerName": "Sean Plott",
  "cheatMode": false,
  "skills": [
    "pwnage",
    "flying"
  ],
  "createdAt": "2022-01-01T12:23:45.678Z",
  "updatedAt": "2022-01-01T12:23:45.678Z",
  "objectId": "Ed1nuqPvcm"
}
```

When retrieving objects that have pointers to children, **you can fetch child objects** by using the `include` option. For instance, to fetch the object pointed to by the "game" key:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'include=game' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"include": "game"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

When using a MongoDB replica set, you can use the `readPreference` option to choose from which replica the object will be retrieved. You can also use the `includeReadPreference` option to choose from which replica the included pointers will be retrieved. The possible values for both options are `PRIMARY` (default), `PRIMARY_PREFERRED`, `SECONDARY`, `SECONDARY_PREFERRED`, or `NEAREST`. If the `includeReadPreference` option is not set, the same replica chosen for `readPreference` will be also used for the includes.

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'include=game' \
  --data-urlencode 'readPreference=SECONDARY' \
  --data-urlencode 'includeReadPreference=SECONDARY_PREFERRED' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"include": "game", "readPreference": "SECONDARY", "includeReadPreference": "SECONDARY_PREFERRED"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>



## Updating Objects

To change the data on an object that already exists, send a PUT request to the object URL. Any keys you don't specify will remain unchanged, so you can update just a subset of the object's data. For example, if we wanted to change the score field of our object:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"score":73453}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm', json.dumps({
    "score": 73453
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
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

### Counters

To help with storing counter-type data, Parse provides the ability to atomically increment (or decrement) any number field. So, we can increment the score field like so:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"score":{"__op":"Increment","amount":1}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm', json.dumps({
    "score": {
        "__op": "Increment",
        "amount": 1
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

To decrement the counter, use the `Increment` operator with a negative number:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"score":{"__op":"Increment","amount":-1}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm', json.dumps({
    "score": {
        "__op": "Increment",
        "amount": -1
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

### Arrays

To help with storing array data, there are three operations that can be used to atomically change an array field:

*   `Add` appends the given array of objects to the end of an array field.
*   `AddUnique` adds only the given objects which aren't already contained in an array field to that field. The position of the insert is not guaranteed.
*   `Remove` removes all instances of each given object from an array field.

Each method takes an array of objects to add or remove in the "objects" key. For example, we can add items to the set-like "skills" field like so:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"skills":{"__op":"AddUnique","objects":["flying","kungfu"]}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm', json.dumps({
    "skills": {
        "__op": "AddUnique",
        "objects": [
            "flying",
            "kungfu"
        ]
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

### Relations

 In order to update `Relation` types, Parse provides special operators to atomically add and remove objects to a relation.  So, we can add an object to a relation like so:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"opponents":{"__op":"AddRelation","objects":[{"__type":"Pointer","className":"Player","objectId":"Vx4nudeWn"}]}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm', json.dumps({
    "opponents": {
        "__op": "AddRelation",
        "objects": [
            {
                "__type": "Pointer",
                "className": "Player",
                "objectId": "Vx4nudeWn"
            }
        ]
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

To remove an object from a relation, you can do:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"opponents":{"__op":"RemoveRelation","objects":[{"__type":"Pointer","className":"Player","objectId":"Vx4nudeWn"}]}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm', json.dumps({
    "opponents": {
        "__op": "RemoveRelation",
        "objects": [
            {
                "__type": "Pointer",
                "className": "Player",
                "objectId": "Vx4nudeWn"
            }
        ]
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Deleting Objects

To delete an object from the Parse Cloud, send a DELETE request to its object URL. For example:

<div class="language-toggle">
<pre><code class="bash">
curl -X DELETE \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('DELETE', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

You can delete a single field from an object by using the `Delete` operation:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{"opponents":{"__op":"Delete"}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm', json.dumps({
    "opponents": {
        "__op": "Delete"
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Batch Operations

To reduce the amount of time spent on network round trips, you can create, update, or delete using the batch endpoint. The batch size can be customized, the default batch size is 20.

Each command in a batch has `method`, `path`, and `body` parameters that specify the HTTP command that would normally be used for that command. The commands are run in the order they are given. For example, to create a couple of `GameScore` objects:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "requests": [
          {
            "method": "POST",
            "path": "<span class="custom-parse-server-mount">/parse/</span>classes/GameScore",
            "body": {
              "score": 1337,
              "playerName": "Sean Plott"
            }
          },
          {
            "method": "POST",
            "path": "<span class="custom-parse-server-mount">/parse/</span>classes/GameScore",
            "body": {
              "score": 1338,
              "playerName": "ZeroCool"
            }
          }
        ]
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>batch
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>batch', json.dumps({
    "requests": [
        {
            "method": "POST",
            "path": "<span class="custom-parse-server-mount">/parse/</span>classes/GameScore",
            "body": {
                "score": 1337,
                "playerName": "Sean Plott"
            }
        },
        {
            "method": "POST",
            "path": "<span class="custom-parse-server-mount">/parse/</span>classes/GameScore",
            "body": {
                "score": 1338,
                "playerName": "ZeroCool"
            }
        }
    ]
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The response from batch will be a list with the same number of elements as the input list. Each item in the list with be a dictionary with either the `success` or `error` field set. The value of `success` will be the normal response to the equivalent REST command:

```jsonc
{
  "success": {
    "createdAt": "2022-01-01T12:23:45.678Z",
    "objectId": "YAfSAWwXbL"
  }
}
```

The value of `error` will be an object with a numeric `code` and `error` string:

```jsonc
{
  "error": {
    "code": 101,
    "error": "object not found for delete"
  }
}
```

Other commands that work in a batch are `update` and `delete`.

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "requests": [
          {
            "method": "PUT",
            "path": "<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm",
            "body": {
              "score": 999999
            }
          },
          {
            "method": "DELETE",
            "path": "<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Cpl9lrueY5"
          }
        ]
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>batch
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>batch', json.dumps({
    "requests": [
        {
            "method": "PUT",
            "path": "<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm",
            "body": {
                "score": 999999
            }
        },
        {
            "method": "DELETE",
            "path": "<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Cpl9lrueY5"
        }
    ]
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Note that N requests sent in a batch will still count toward your request limit as N requests.

## Data Types

So far we have only used values that can be encoded with standard JSON. The Parse mobile client libraries also support dates, geolocations, and relational data. In the REST API, these values are encoded as JSON hashes with the `__type` field set to indicate their type, so you can read or write these fields if you use the correct encoding. Overall, the following types are allowed for each field in your object:

* String
* Number
* Boolean
* Arrays
* JSON Objects
* DateTime
* File
* Pointer to another Parse Object
* Relation to another Parse Class
* Null

The `Date` type contains a field `iso` which contains a UTC timestamp stored in ISO 8601 format with millisecond precision: `YYYY-MM-DDTHH:MM:SS.MMMZ`.

```jsonc
{
  "__type": "Date",
  "iso": "2022-01-01T12:23:45.678Z"
}
```

Dates are useful in combination with the built-in `createdAt` and `updatedAt` fields. For example, to retrieve objects created since a particular time, just encode a Date in a comparison query:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"createdAt":{"$gte":{"__type":"Date","iso":"2022-01-01T12:23:45.678Z"}}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "createdAt": {
        "$gte": {
            "__type": "Date",
            "iso": "2022-01-01T12:23:45.678Z"
        }
    }
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The `Pointer` type is used when mobile code sets another Parse `Object` as the value of another object. It contains the `className` and `objectId` of the referred-to value.

```jsonc
{
  "__type": "Pointer",
  "className": "GameScore",
  "objectId": "Ed1nuqPvc"
}
```

Note that the built-in `User`, `Role`, and `Installation` classes are prefixed by an underscore. For example, pointers to user objects have a `className` of `_User`. Prefixing with an underscore is forbidden for developer-defined classes as it signifies the class is a special built-in.

The `Relation` type is used for many-to-many relations. It has a `className` that is the class name of the target objects.

```jsonc
{
  "__type": "Relation",
  "className": "GameScore"
}
```

When querying, `Relation` objects behave like arrays of Pointers. Any operation that is valid for arrays of pointers (other than `include`) works for `Relation` objects.

We do not recommend storing large pieces of binary data like images or documents on a Parse object. To store more, we recommend you use `File`. You may associate a [previously uploaded file](#files) using the `File` type.

```jsonc
{
  "__type": "File",
  "name": "...profile.png"
}
```

When more data types are added, they will also be represented as hashes with a `__type` field set, so you may not use this field yourself on JSON objects. For more information about how Parse handles data, check out our documentation on [Data](#data).
