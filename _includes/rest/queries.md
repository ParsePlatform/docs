# Queries

## Basic Queries

You can retrieve multiple objects at once by sending a GET request to the class URL. Without any URL parameters, this simply lists objects in the class:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}"</span> \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore', '', {
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
      "playerName": "Jang Min Chul",
      "updatedAt": "2022-01-01T12:23:45.678Z",
      "cheatMode": false,
      "createdAt": "2022-01-01T12:23:45.678Z",
      "objectId": "A22v5zRAgd",
      "score": 80075
    },
    {
      "playerName": "Sean Plott",
      "updatedAt": "2022-01-01T12:23:45.678Z",
      "cheatMode": false,
      "createdAt": "2022-01-01T12:23:45.678Z",
      "objectId": "Ed1nuqPvcm",
      "score": 73453
    }
  ]
}
```

## Query Constraints

There are several ways to put constraints on the objects found, using the `where` URL parameter. The value of the `where` parameter should be encoded JSON. Thus, if you look at the actual URL requested, it would be JSON-encoded, then URL-encoded. The simplest use of the `where` parameter is constraining the value for keys. For example, if we wanted to retrieve Sean Plott's scores that were not in cheat mode, we could do:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"playerName":"Sean Plott","cheatMode":false}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "playerName": "Sean Plott",
    "cheatMode": False
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

The values of the `where` parameter also support comparisons besides exact matching. Instead of an exact value, provide a hash with keys corresponding to the comparisons to do. The `where` parameter supports these options:

| Key         | Operation                        |
|------------------------------------------------|
| $lt         | Less Than                        |
| $lte        | Less Than Or Equal To            |
| $gt         | Greater Than                     |
| $gte        | Greater Than Or Equal To         |
| $ne         | Not Equal To                     |
| $in         | Contained In                     |
| $nin        | Not Contained in                 |
| $exists     | A value is set for the key       |
| $select     | This matches a value for a key in the result of a different query |
| $dontSelect | Requires that a key's value not match a value for a key in the result of a different query |
| $all        | Contains all of the given values |
| $regex      | Requires that a key's value match a regular expression |
| $text       | Performs a full text search on indexed fields |

For example, to retrieve scores between 1000 and 3000, including the endpoints, we could issue:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"score":{"$gte":1000,"$lte":3000}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "score": {
        "$gte": 1000,
        "$lte": 3000
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

To retrieve scores equal to an odd number below 10, we could issue:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"score":{"$in":[1,3,5,7,9]}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "score": {
        "$in": [
            1,
            3,
            5,
            7,
            9
        ]
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

To retrieve scores not by a given list of players we could issue:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={
   "playerName": {
     "$nin": [
       "Jonathan Walsh",
       "Dario Wunsch",
       "Shawn Simon"
     ]
   }
  }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "playerName": {
        "$nin": [
            "Jonathan Walsh",
            "Dario Wunsch",
            "Shawn Simon"
        ]
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

To retrieve documents with the score set, we could issue:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"score":{"$exists":true}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "score": {
        "$exists": True
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

To retrieve documents without the score set, we could issue:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"score":{"$exists":false}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "score": {
        "$exists": False
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

If you have a class containing sports teams and you store a user's hometown in the user class, you can issue one query to find the list of users whose hometown teams have winning records.  The query would look like:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"hometown":{"$select":{"query":{"className":"Team","where":{"winPct":{"$gt":0.5}}},"key":"city"}}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/_User
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "hometown": {
        "$select": {
            "query": {
                "className": "Team",
                "where": {
                    "winPct": {
                        "$gt": 0.5
                    }
                }
            },
            "key": "city"
        }
    }
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/_User?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

In addition to `where`, there are several parameters you can use to configure what types of results are returned by the query.

| Parameter     | Use                                               |
|-------------------------------------------------------------------|
| order         | Specify a field to sort by                        |
| limit         | Limit the number of objects returned by the query |
| skip          | Use with limit to paginate through results        |
| keys          | Restrict the fields returned by the query         |
| excludeKeys   | Exclude specific fields from the returned query   |
| include       | Use on Pointer columns to return the full object  |

You can use the `order` parameter to specify a field to sort by. Prefixing with a negative sign reverses the order. Thus, to retrieve scores in ascending order:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'order=score' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"order": "score"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

And to retrieve scores in descending order:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'order=-score' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"order": "-score"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

You can sort by multiple fields by passing `order` a comma-separated list. To retrieve documents that are ordered by scores in ascending order and the names in descending order:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'order=score,-name' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"order": "score, -name"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

You can use the `limit` and `skip` parameters for pagination.`limit` defaults to 100. In the old Parse hosted backend, the maximum limit was 1,000, but Parse Server removed that constraint. Thus, to retrieve 200 objects after skipping the first 400:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'limit=200' \
  --data-urlencode 'skip=400' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"limit": 200, "skip": 400})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

You can restrict the fields returned by passing `keys` or `excludeKeys` as an [array](#arrays). To retrieve documents that contain only the `score` and `playerName` fields (and also special built-in fields such as `objectId`, `createdAt`, and `updatedAt`):

* On Parse Server <5.0.0 pass a comma-delimited string, e.g. `"score,playerName"` instead of an array for `keys` and `excludeKeys`.

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'keys=score,playerName' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"keys": "[score, playerName]"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Or you may use `excludeKeys` to fetch everything except `playerName`:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'excludeKeys=playerName' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"excludeKeys": "playerName"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore/Ed1nuqPvcm?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

All of these parameters can be used in combination with each other. For example:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={
   "playerName": {
     "$nin": [
       "Jonathan Walsh",
       "Dario Wunsch",
       "Shawn Simon"
     ]
   }
  }' \
  --data-urlencode 'order=score,-name' \
  --data-urlencode 'limit=200' \
  --data-urlencode 'skip=400' \
  --data-urlencode 'keys=score,playerName' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "playerName": {
        "$nin": [
            "Jonathan Walsh",
            "Dario Wunsch",
            "Shawn Simon"
        ]
    }
}),
"order": "score,-name",
"limit": 200,
"skip": 400,
"keys": "score,playerName"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>


##  Queries on Array Values

For keys with an array type, you can find objects where the key's array value contains 2 by:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"arrayKey":2}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/RandomObject
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "arrayKey": 2
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/RandomObject?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

You can also use the `$all` operator to find objects with an array field which contains each of the values 2, 3, and 4 by:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"arrayKey":{"$all":[2,3,4]}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/RandomObject
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "arrayKey": {
        "$all": [
            2,
            3,
            4
        ]
    }
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/RandomObject?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Queries on String Values

Use the `$regex` operator to restrict to string values that match a regular expression. Most regular expression queries in Parse are heavily throttled due to performance considerations. Use case sensitive, anchored queries where possible. Similar to a MySQL LIKE operator, anchored queries are indexed so they are efficient for large datasets. For example:

<div class="language-toggle">
<pre><code class="bash">
# Finds barbecue sauces that start with "Big Daddy"
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"name":{"$regex":"^Big Daddy"}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/BarbecueSauce
</code></pre>
<pre><code class="python">
# Finds barbecue sauces that start with "Big Daddy"
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "name": {
        "$regex": "^Big Daddy"
    }
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/BarbecueSauce?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The above example will match any `BarbecueSauce` objects where the value in the "name" String key starts with "Big Daddy". For example, both "Big Daddy" and "Big Daddy's" will match, but "big daddy" or "BBQ Sauce: Big Daddy's" will not.

Queries that have regular expression constraints are very expensive, especially for classes with over 100,000 records. Parse restricts how many such operations can be run on a particular app at any given time.

* Starting with Parse-Server 2.5.0

For efficient search capabilities use the `$text` operator. By creating indexes on one or more columns your strings are turned into tokens for full text search functionality.

The format `{"$text": {"$search": {parameters}}}`

| Parameter           | Use                                                            |
|--------------------------------------------------------------------------------------|
| $term               | Specify a field to search (Required)                           |
| $language           | Determines the list of stop words and the rules for tokenizer. |
| $caseSensitive      | Enable or disable case sensitive search.     |
| $diacriticSensitive | Enable or disable diacritic sensitive search |

Please refer to your database documentation on Full Text Search to setup your indexes, weights and limitations.

<a href="https://docs.mongodb.com/v3.2/text-search/">Mongo 3.2 Full Text Search</a>

<a href="https://docs.mongodb.com/manual/reference/operator/query/text/">Mongo 3.4 Full Text Search</a>

<a href="https://www.postgresql.org/docs/9.5/static/textsearch.html">Postgres 9.5 Full Text Search</a>

Note: Postgres doesn't support `$caseSensitive` for Full Text Search, please use `$regex` above or create a lowercase column in your DB. Postgres supports `$diacriticSensitive: true` by default but `$diacriticSensitive: false` is not supported. To use false automatically, please install Postgres Unaccent Extension and update your text search configuration.

<div class="language-toggle">
<pre><code class="bash">
# Finds strings that contains "Daddy"
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"name":{"$text":{"$search":{"$term":"Daddy"}}}}' \
  https://api.parse.com/1/classes/BarbecueSauce
</code></pre>
<pre><code class="python">
# Finds barbecue sauces that contains "Daddy"
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('api.parse.com', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "name": {
        "$text": {
            "$search": {
                "$term": "Daddy"
            }
        }
    }
})})
connection.connect()
connection.request('GET', '/1/classes/BarbecueSauce?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

`$text` allows for sorting by `$score`. The text score signifies how well the string matched the search term(s) based on weights.

<div class="language-toggle">
<pre><code class="bash">
# Finds strings that contains "Daddy" ordered by relevance
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"name":{"$text":{"$search":{"$term":"Daddy"}}}}' \
  --data-urlencode 'order="$score"' \
  --data-urlencode 'key="$score"' \
  https://api.parse.com/1/classes/BarbecueSauce
</code></pre>
<pre><code class="python">
# Finds string that contains "Daddy" ordered by relevance
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('api.parse.com', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "name": {
        "$text": {
            "$search": {
                "$term": "Daddy"
            }
        }
    }
}),
"order": "$score",
"keys": "$score"})
connection.connect()
connection.request('GET', '/1/classes/BarbecueSauce?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Note: Both keys and order are required to sort by `$score`. You have to manually set weights on Postgres to use `$score`.

## Relational Queries

There are several ways to issue queries for relational data. If you want to retrieve objects where a field matches a particular object, you can use a `where` clause with a `Pointer` encoded with `__type` just like you would use other data types. For example, if each `Comment` has a `Post` object in its `post` field, you can fetch comments for a particular `Post`:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"post":{"__type":"Pointer","className":"Post","objectId":"8TOXdXf3tz"}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/Comment
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "post": {
        "__type": "Pointer",
        "className": "Post",
        "objectId": "8TOXdXf3tz"
    }
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/Comment?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

If you want to retrieve objects where a field contains an object that matches another query, you can use the `$inQuery` operator. For example, imagine you have Post class and a Comment class, where each Comment has a pointer to its parent Post. You can find comments on posts with images by doing:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"post":{"$inQuery":{"where":{"image":{"$exists":true}},"className":"Post"}}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/Comment
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "post": {
        "$inQuery": {
            "where": {
                "image": {
                    "$exists": True
                }
            },
            "className": "Post"
        }
    }
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/Comment?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

If you want to retrieve objects where a field contains an object that does not match another query, you can use the `$notInQuery` operator.  Imagine you have Post class and a Comment class, where each Comment has a pointer to its parent Post.  You can find comments on posts without images by doing:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"post":{"$notInQuery":{"where":{"image":{"$exists":true}},"className":"Post"}}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/Comment
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "post": {
        "$notInQuery": {
            "where": {
                "image": {
                    "$exists": True
                }
            },
            "className": "Post"
        }
    }
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/Comment?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

If you want to retrieve objects that are members of `Relation` field of a parent object, you can use the `$relatedTo` operator.  Imagine you have a Post class and User class, where each Post can be liked by many users.  If the Users that liked a Post were stored in a `Relation` on the post under the key "likes", you can find the users that liked a particular post by:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"$relatedTo":{"object":{"__type":"Pointer","className":"Post","objectId":"8TOXdXf3tz"},"key":"likes"}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>users
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "$relatedTo": {
        "object": {
            "__type": "Pointer",
            "className": "Post",
            "objectId": "8TOXdXf3tz"
        },
        "key": "likes"
    }
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>users?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

In some situations, you want to return multiple types of related objects in one query. You can do this by passing the field to include in the `include` parameter. For example, let's say you are retrieving the last ten comments, and you want to retrieve their related posts at the same time:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'order=-createdAt' \
  --data-urlencode 'limit=10' \
  --data-urlencode 'include=post' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/Comment
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"order": "-createdAt", "limit": 10, "include": "post"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/Comment?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Instead of being represented as a `Pointer`, the `post` field is now expanded into the whole object. `__type` is set to `Object` and `className` is provided as well. For example, a `Pointer` to a `Post` could be represented as:

```jsonc
{
  "__type": "Pointer",
  "className": "Post",
  "objectId": "8TOXdXf3tz"
}
```

When the query is issued with an `include` parameter for the key holding this pointer, the pointer will be expanded to:

```jsonc
{
  "__type": "Object",
  "className": "Post",
  "objectId": "8TOXdXf3tz",
  "createdAt": "2022-01-01T12:23:45.678Z",
  "updatedAt": "2022-01-01T12:23:45.678Z",
  "otherFields": "willAlsoBeIncluded"
}
```

You can also do multi level includes using dot notation.  If you wanted to include the post for a comment and the post's author as well you can do:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'order=-createdAt' \
  --data-urlencode 'limit=10' \
  --data-urlencode 'include=post.author' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/Comment
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"order": "-createdAt", "limit": 10, "include": "post.author"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/Comment?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

You can issue a query with multiple fields included by passing a comma-separated list of keys as the `include` parameter.

## Counting Objects

Note: In the old Parse hosted backend, count queries were rate limited to a maximum of 160 requests per minute. They also returned inaccurate results for classes with more than 1,000 objects. But, Parse Server has removed both constraints and can count objects well above 1,000.

If you are limiting your query, or if there are a very large number of results, and you want to know how many total results there are without returning them all, you can use the `count` parameter. For example, if you only care about the number of games played by a particular player:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"playerName":"Jonathan Walsh"}' \
  --data-urlencode 'count=1' \
  --data-urlencode 'limit=0' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "playerName": "Jonathan Walsh"
}),
"count": 1,
"limit": 0})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/GameScore?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Since this requests a count as well as limiting to zero results, there will be a count but no results in the response.

```jsonc
{
  "results": [],
  "count": 1337
}
```

With a nonzero limit, that request would return results as well as the count.

## Compound Queries

 If you want to find objects that match one of several queries, you can use `$or` operator, with a JSONArray as its value.  For instance, if you want to find players with either have a lot of wins or a few wins, you can do:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"$or":[{"wins":{"$gt":150}},{"wins":{"$lt":5}}]}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/Player
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "$or": [
        {
            "wins": {
                "$gt": 150
            }
        },
        {
            "wins": {
                "$lt": 5
            }
        }
    ]
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/Player?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Any other constraints on the query are also applied to the object returned, so you can add other constraints to queries with `$or`.

Note that we do not, however, support GeoPoint or non-filtering constraints (e.g. nearSphere, within, limit, skip, sort, include) in the subqueries of the compound query.

## Distinct Queries

* Starting with Parse-Server 2.7.0 (requires masterKey)

Finds unique values for a specified field.

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'distinct=score' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>aggregate/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"distinct": "score"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>aggregate/GameScore?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>"
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Can be used with `where` parameter for constraining the value for keys.

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"playerName":"Sean Plott"},distinct=score' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>aggregate/GameScore
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "playerName": "Sean Plott"
}),
"distinct": "score"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>aggregate/GameScore?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>"
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Aggregate Queries

* Starting with Parse-Server 2.7.0 (requires masterKey)

You can find objects using aggregate functions. This will compute result(s) for a set of input values.

For a list of available operators please refer to Mongo Aggregate Documentation.

<a href="https://docs.mongodb.com/v3.2/reference/operator/aggregation/">Mongo 3.2 Aggregate Operators</a>

<a href="https://docs.mongodb.com/manual/reference/operator/aggregation/#aggregation-expression-operators">Mongo 3.4 Aggregate Operators</a>

You can group the objects and apply an accumulator operator such as `$sum`, `$avg`, `$max`, `$min`. `group` is similar to `distinct`.

Note: `_id` does not exist in parse-server. Please replace with `objectId`.

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'group={"objectId":null,"total":{"$sum":"$score"}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>aggregate/Player
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"group": json.dumps({
    "objectId": null,
    "total": {
        "$sum": "$score"
    }
}),
"distinct": "score"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>aggregate/Player?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>"
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

You can add or remove existing fields with `project` parameter. `project` is similar to `keys`.

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'project={"score":1}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>aggregate/Player
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"project": json.dumps({
    "score": 1
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>aggregate/Player?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>"
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

You can filter out objects with `match` parameter. `match` is similar to `$eq`.

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'match={"score":{"$gt":15}}' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>aggregate/Player
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"match": json.dumps({
    "score": {
        "$gt": 15
    }
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>aggregate/Player?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>"
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

You can also constraint by `limit`, `skip`, `sort`.

## Read Preference

When using a MongoDB replica set, you can use the `readPreference` option to choose from which replica the objects will be retrieved. You can also use the `includeReadPreference` option to choose from which replica the included pointers will be retrieved and the `subqueryReadPreference` option to choose in which replica the subqueries will run. The possible values these options are `PRIMARY` (default), `PRIMARY_PREFERRED`, `SECONDARY`, `SECONDARY_PREFERRED`, or `NEAREST`. If the `includeReadPreference` option is not set, the same replica chosen for `readPreference` will be also used for the includes. The same rule applies for the `subqueryReadPreference` option.

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={"post":{"$inQuery":{"where":{"image":{"$exists":true}},"className":"Post"}}}' \
  --data-urlencode 'include=post' \
  --data-urlencode 'readPreference=SECONDARY' \
  --data-urlencode 'includeReadPreference=SECONDARY_PREFERRED' \
  --data-urlencode 'subqueryReadPreference=NEAREST' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/Comment
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "post": {
        "$inQuery": {
            "where": {
                "image": {
                    "$exists": True
                }
            },
            "className": "Post"
        }
    }
}),
"include": "post",
"readPreference": "SECONDARY",
"includeReadPreference": "SECONDARY_PREFERRED",
"subqueryReadPreference": "NEAREST"})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/Comment?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>
