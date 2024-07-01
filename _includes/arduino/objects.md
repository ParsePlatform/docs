# Objects

## The Parse Object

Storing data on Parse is built around the Parse Object. Each Parse Object contains key-value pairs of JSON-compatible data. This data is schemaless, which means that you don't need to specify ahead of time what keys exist on each object. You simply set whatever key-value pairs you want, and our backend will store it.

For example, let's say you're tracking data for your smart toaster. A single Parse Object could contain:

```javascript
temperature: 175.0, leverDown: true
```

Keys must be alphanumeric strings. Values can be strings, numbers, booleans, or even arrays and dictionaries - anything that can be JSON-encoded.

Each object has a class name that you can use to distinguish different sorts of data. For example, we store the temperature data in a class called `Temperature`. We recommend that you NameYourClassesLikeThis and nameYourKeysLikeThis, just to keep your code looking pretty.

## Saving Objects

Let's say you want to save the `Temperature` described above to your Parse Server. You would do the following:

```cpp
ParseObjectCreate create;
create.setClassName("Temperature");
create.add("temperature", 175.0);
create.add("leverDown", true);
ParseResponse response = create.send();
if (!response.getErrorCode()) {
	// The object has been saved
} else {
	// There was a problem, check response.
	getErrorCode();
}
response.close(); // Free the resource
```

After this code runs, you will probably be wondering if anything really happened. To make sure the data was saved, you can look at the Data Browser in your app on Parse. You should see something like this:

```jsonc
{
  "objectId": "xWMyZ4YEGZ",
  "score": 1337,
  "playerName": "Sean Plott",
  "cheatMode": false,
  "createdAt":"2022-01-01T12:23:45.678Z",
  "updatedAt":"2022-01-01T12:23:45.678Z"
}
```

There are two things to note here. You didn't have to configure or set up a new Class called `Temperature` before running this code. Your Parse app lazily creates this Class for you when it first encounters it.

There are also a few fields you don't need to specify that are provided as a convenience. `objectId` is a unique identifier for each saved object. `createdAt` and`updatedAt` represent the time that each object was created and last modified in your Parse Server. Each of these fields is filled in by Parse, so they don't exist on a Parse Object until a save operation has completed.

## Retrieving Objects

Saving data to the cloud is fun, but it's even more fun to get that data out again. If the object has been uploaded to the server, you can use the `objectId` to retrieve it using a query:

```cpp
ParseObjectGet get;
get.setClassName("Temperature");
get.setObjectId("xWMyZ4YEGZ");
ParseResponse response = get.send();
double temp = response.getDouble("temperature");
Serial.println(temp);
response.close(); // Free the resource
```

## Updating Objects

Updating an object is very similar to creating one. Assuming you have saved the object and have the `objectId`, can do the following:

```cpp
ParseObjectUpdate update;
update.setClassName("Temperature");
update.setObjectId("xWMyZ4YEGZ");
update.add("temperature", 100);
update.send();
```

## Deleting Objects

To delete an object from the cloud:

```cpp
ParseObjectDelete del;
del.setClassName("Temperature");
del.setObjectId("xWMyZ4YEGZ");
del.send();
```

## Data Types

So far we've used values with type `string`, `double`, and `bool`. The Parse Arduino SDK also supports `GeoPoint`s (latitude and longitude). In addition, you can set values on objects via JSON and be able to represent Arrays, Objects, Dates, and more. Read more about representing these types as JSON in the [REST API guide]({{ site.baseUrl }}/rest/guide/#data-types).

Overall, the following types are allowed for each field in your object:

* String => `string`
* Number => `integer`, `double`
* Boolean => `bool`
* Array => `JSON Array`
* Object => `JSON Object`
* Date => `JSON Date`
* File => `ParseFile`
* Pointer => other `ParseObject`
* Relation => `ParseRelation`

The type `JSON Object` simply denotes that each value can be composed of nested objects that are JSON-encodable. Keys including the characters `$` or `.`, along with the key `__type` key, are reserved for the framework to handle additional types, so don't use those yourself.

Some examples:

```cpp
ParseObjectCreate create;
create.setClassName("TestObject");
create.add("number", 42.0);
create.add("foo", "bar");
create.addGeoPoint("location", 40.0, -30.0);
create.addJSONValue("dateField", "{ \"__type\": \"Date\", \"iso\": \"2022-01-01T12:23:45.678Z\" }"); create.addJSONValue("arrayField", "[ 30, \"string\" ]");
create.addJSONValue("objectField", "{ \"number\": 30, \"string\": \"baz\" }");
create.addJSONValue("emptyField", "null");
create.send();
```

We do not recommend storing large pieces of binary data like images or documents in a `ParseObject`. We recommend you use `ParseFile`s to store images, documents, and other types of files. You can do so by instantiating a `ParseFile` object and setting it on a field. See the [Files section in the REST documentation]({{ site.baseUrl }}/rest/guide/#files) for more details.

For more information about how Parse handles data, check out our documentation on [Data]({{ site.baseUrl }}/rest/guide/#data).
