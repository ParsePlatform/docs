# GeoPoints

Parse allows you to associate real-world latitude and longitude coordinates with an object.  Adding a `GeoPoint` data type to a class allows queries to take into account the proximity of an object to a reference point.  This allows you to easily do things like find out what user is closest to another user or which places are closest to a user.

## GeoPoint

To associate a point with an object you will need to embed a `GeoPoint` data type into your object.  This is done by using a JSON object with `__type` set to the string `GeoPoint` and numeric values being set for the `latitude` and `longitude` keys.  For example, to create an object containing a point under the "location" key with a latitude of 40.0 degrees and -30.0 degrees longitude:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "location": {
          "__type": "GeoPoint",
          "latitude": 40.0,
          "longitude": -30.0
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/PlaceObject
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>classes/PlaceObject', json.dumps({
    "location": {
        "__type": "GeoPoint",
        "latitude": 40.0,
        "longitude": -30.0
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

## Geo Queries

Now that you have a bunch of objects with spatial coordinates, it would be nice to find out which objects are closest to a point.  This can be done by using a `GeoPoint` data type with query on the field using `$nearSphere`.  Getting a list of ten places that are closest to a user may look something like:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'limit=10' \
  --data-urlencode 'where={
        "location": {
          "$nearSphere": {
            "__type": "GeoPoint",
            "latitude": 30.0,
            "longitude": -20.0
          }
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/PlaceObject
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"limit": 10, "where": json.dumps({
    "location": {
        "$nearSphere": {
            "__type": "GeoPoint",
            "latitude": 30.0,
            "longitude": -20.0
        }
    }
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/PlaceObject?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

This will return a list of results ordered by distance from 30.0 latitude and -20.0 longitude. The first result will be the nearest object. (Note that if an explicit `order` parameter is supplied, it will take precedence over the distance ordering.) For example, here are two results returned for the above query:

```jsonc
{
  "results": [
    {
      "location": {
        "latitude": 40.0,
        "__type": "GeoPoint",
        "longitude": -30.0
      },
      "updatedAt": "2022-01-01T12:23:45.678Z",
      "createdAt": "2022-01-01T12:23:45.678Z",
      "objectId": "iFEPN5Gwoz"
    },
    {
      "location": {
        "latitude": 60.0,
        "__type": "GeoPoint",
        "longitude": -20.0
      },
      "updatedAt": "2022-01-01T12:23:45.678Z",
      "createdAt": "2022-01-01T12:23:45.678Z",
      "objectId": "LAyNKSNTHT"
    }
  ]
}
```

To limit the search to a maximum distance add a `$maxDistanceInMiles` (for miles), `$maxDistanceInKilometers` (for kms), or `$maxDistanceInRadians` (for radian angle), term to the key constraint.  For example, the following limits the radius to 10 miles:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={
        "location": {
          "$nearSphere": {
            "__type": "GeoPoint",
            "latitude": 30.0,
            "longitude": -20.0
          },
          "$maxDistanceInMiles": 10.0
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/PlaceObject
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "location": {
        "$nearSphere": {
            "__type": "GeoPoint",
            "latitude": 30.0,
            "longitude": -20.0
        },
        "$maxDistanceInMiles": 10.0
    }
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/PlaceObject?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

It's also possible to query for the set of objects that are contained within a particular area.  To find the objects in a rectangular bounding box, add a clause to the key constraint with the format `{"$within": {"$box": {[southwestGeoPoint, northeastGeoPoint]}}}`.

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={
        "location": {
          "$within": {
            "$box": [
              {
                "__type": "GeoPoint",
                "latitude": 37.71,
                "longitude": -122.53
              },
              {
                "__type": "GeoPoint",
                "latitude": 30.82,
                "longitude": -122.37
              }
            ]
          }
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/PizzaPlaceObject
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "location": {
        "$within": {
            "$box": [
                {
                    "__type": "GeoPoint",
                    "latitude": 37.71,
                    "longitude": -122.53
                },
                {
                    "__type": "GeoPoint",
                    "latitude": 30.82,
                    "longitude": -122.37
                }
            ]
        }
    }
})})
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>classes/PizzaPlaceObject?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

* Starting with Parse-Server 2.5.0

It's also possible to query for the set of objects that are contained within or on the bounds of a polygon. `$polygon` allows for opened or closed paths, minimum of 3 `GeoPoint`'s.

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -G \
  --data-urlencode 'where={
        "location": {
          "$geoWithin": {
            "$polygon": [
              {
                "__type": "GeoPoint",
                "latitude": 25.774,
                "longitude": -80.190
              },
              {
                "__type": "GeoPoint",
                "latitude": 18.466,
                "longitude": -66.118
              },
              {
                "__type": "GeoPoint",
                "latitude": 32.321,
                "longitude": -64.757
              }
            ]
          }
        }
      }' \
  https://api.parse.com/1/classes/PizzaPlaceObject
</code></pre>
<pre><code class="python">
import http.client
import json
import urllib.parse


connection = http.client.HTTPSConnection('api.parse.com', 443)
params = urllib.parse.urlencode({"where": json.dumps({
    "location": {
        "$geoWithin": {
            "$polygon": [
                {
                    "__type": "GeoPoint",
                    "latitude": 25.774,
                    "longitude": -80.190
                },
                {
                    "__type": "GeoPoint",
                    "latitude": 18.466,
                    "longitude": -66.118
                },
                {
                    "__type": "GeoPoint",
                    "latitude": 32.321,
                    "longitude": -64.757
                }
            ]
        }
    }
})})
connection.connect()
connection.request('GET', '/1/classes/PizzaPlaceObject?%s' % params, '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Caveats

At the moment there are a couple of things to watch out for:

1.  Each PFObject class may only have one key with a PFGeoPoint object.
2.  Using the `$nearSphere` constraint will also limit results to within 100 miles.
3.  Points should not equal or exceed the extreme ends of the ranges.  Latitude should not be -90.0 or 90.0.  Longitude should not be -180.0 or 180.0.  Attempting to use `GeoPoint`'s with latitude and/or longitude outside these ranges will cause an error.
