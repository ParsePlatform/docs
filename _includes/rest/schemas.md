# Schema

Schema is the structure representing classes in your app. You can use the schema
of an app to verify operations in a unit test, generate test data, generate test
classes and then clean up after tests. The schema API can also be used to create
custom views of your data. We use the schema API to display columns names and
types in the databrowser.

This API allows you to access the schemas of your app.
Note: This API can be only accessed using the `master key`.

* Starting with Parse Server 2.7.1 Index support added.

## Fetch the schema
To fetch the Schema for all the classes of your app, run:

Note: `createdAt` and `updatedAt` are of type `Date` but they are represented
as strings in object representation. This is a special case for the Parse API.

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>schemas
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>schemas', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The response body is JSON containing all the schema information of the app.

```jsonc
{
  "results": [
    {
      "className": "Game",
      "fields": {
        "ACL": {
          "type": "ACL"
        },
        "createdAt": {
          "type": "Date"
        },
        "objectId": {
          "type": "String"
        },
        "name": {
          "type": "String"
        },
        "score": {
          "type": "Number"
        },
        "updatedAt": {
          "type": "Date"
        }
      }
    },
    /*...*/
  ]
}
```

To fetch schema of a single class, run:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>schemas/Game
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>schemas/Game', "", {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Adding a schema

When you add a new schema to your app, it creates an empty class with the provided
fields and some default fields applicable to the class. To add the schema, run:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "City",
      "fields": {
        "name": {
          "type": "String"
        }
      }
    }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>schemas/City
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>schemas/City', json.dumps({
    "className": "City",
    "fields": {
        "name": {
            "type": "String"
        }
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

You may also add indexes to your fields. You need to use the format you need to use `{"index_name" : { field_name: index } }`. The fields must exist when you add indexes.

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "City",
      "fields": {
        "name": {
          "type": "String"
        }
      },
      "indexes": {
        "indexName": {
          "name": 1
        }
      }
    }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>schemas/City
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>schemas/City', json.dumps({
    "className": "City",
    "fields": {
        "name": {
            "type": "String"
        },
        "indexes": {
            "indexName": {
                "name": 1
            }
        }
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Modifying the schema

You can add or delete columns to a schema. To do so, run:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "City",
      "fields": {
        "population": {
          "type": "Number"
        }
      },
      "indexes": {
        "population_index": {
          "population": 1
        }
      }
    }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>schemas/City
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>schemas/City', json.dumps({
    "className": "City",
    "fields": {
        "population": {
            "type": "Number"
        },
        "indexes": {
            "population_index": {
                "population": 1
            }
        }
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

To delete a particular field or index, you need to use `{"__op" : "Delete" }`

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '
    {
      "className": "City",
      "fields": {
        "population": {
          "__op": "Delete"
        }
      },
      "indexes": {
        "population_index": {
          "__op": "Delete"
        }
      }
    }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>schemas/City
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>schemas/City', json.dumps({
    "className": "City",
    "fields": {
        "population": {
            "__op": "Delete"
        },
        "indexes": {
            "population_index": {
                "__op" : "Delete"
            }
        }
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Removing a schema

You can only remove a schema from your app if it is empty (has 0 objects).
To do that, run:

<div class="language-toggle">
<pre><code class="bash">
curl -X DELETE\
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>schemas/City
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>schemas/City', "", {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
