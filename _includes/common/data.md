# Data

We've designed the Parse SDKs so that you typically don't need to worry about how data is saved while using the client SDKs. Simply add data to the Parse `Object`, and it'll be saved correctly.

Nevertheless, there are some cases where it's useful to be aware of how data is stored on the Parse platform.

## Data Storage

Internally, Parse stores data as JSON, so any datatype that can be converted to JSON can be stored on Parse. Refer to the [Data Types in Objects](#data-types) section of this guide to see platform-specific examples.

Keys including the characters `$` or `.`, along with the key `__type` key, are reserved for the framework to handle additional types, so don't use those yourself. Key names must contain only numbers, letters, and underscore, and must start with a letter. Values can be anything that can be JSON-encoded.

## Data Type Lock-in

When a class is initially created, it doesn't have an inherent schema defined. This means that for the first object, it could have any types of fields you want.

However, after a field has been set at least once, that field is locked into the particular type that was saved. For example, if a `User` object is saved with field `name` of type `String`, that field will be restricted to the `String` type only (the server will return an error if you try to save anything else).

One special case is that any field can be set to `null`, no matter what type it is.

## The Data Browser

The Data Browser is the web UI where you can update and create objects in each of your apps. Here, you can see the raw JSON values that are saved that represents each object in your class.

When using the interface, keep in mind the following:

* The `objectId`, `createdAt`, `updatedAt` fields cannot be edited (these are set automatically).
* The value "(empty)" denotes that the field has not been set for that particular object (this is different than `null`).
* You can remove a field's value by hitting your Delete key while the value is selected.

The Data Browser is also a great place to test the Cloud Code validations contained in your Cloud Code functions (such as `beforeSave`). These are run whenever a value is changed or object is deleted from the Data Browser, just as they would be if the value was changed or deleted from your client code.

## Importing Data

You may import data into your Parse app by using CSV or JSON files. To create a new class with data from a CSV or JSON file, go to the Data Browser and click the "Import" button on the left hand column.

The JSON format is an array of objects in our REST format or a JSON object with a `results` that contains an array of objects. It must adhere to the [JSON standard](http://json.org/). A file containing regular objects could look like:

```jsonc
{ "results": [
  {
    "score": 1337,
    "playerName": "Sean Plott",
    "cheatMode": false,
    "createdAt": "2022-01-01T12:23:45.678Z",
    "updatedAt": "2022-01-01T12:23:45.678Z",
    "objectId": "fchpZwSuGG"
  }]
}
```

Objects in either format should contain keys and values that also satisfy the following:

* Key names must contain only numbers, letters, and underscore, and must start with a letter.
* No value may contain a hard newline '`\n`'.

Normally, when objects are saved to Parse, they are automatically assigned a unique identifier through the `objectId` field, as well as a `createdAt` field and `updatedAt` field which represent the time that the object was created and last modified in your Parse Server. These fields can be manually set when data is imported from a JSON file. Please keep in mind the following:

* Use a unique 10 character alphanumeric string as the value of your `objectId` fields.
* Use a UTC timestamp in the ISO 8601 format when setting a value for the `createdAt` field or the `updatedAt` field.

In addition to the exposed fields, objects in the Parse User class can also have the `bcryptPassword` field set. The value of this field is a `String` that is the bcrypt hashed password + salt in the modular crypt format described in this [StackOverflow answer](http://stackoverflow.com/a/5882472/1351961). Most OpenSSL based bcrypt implementations should have built-in methods to produce these strings.

A file containing a `User` object could look like:

```jsonc
{ "results":
  [{
    "username": "cooldude",
    "createdAt": "1983-09-13T22:42:30.548Z",
    "updatedAt": "2015-09-04T10:12:42.137Z",
    "objectId": "ttttSEpfXm",
    "sessionToken": "dfwfq3dh0zwe5y2sqv514p4ib",
    "bcryptPassword": "$2a$10$ICV5UeEf3lICfnE9W9pN9.O9Ved/ozNo7G83Qbdk5rmyvY8l16MIK"
  }]
}
```

Note that in CSV the import field types are limited to `String`, `Boolean`, and `Number`.

## Exporting your Data

You can request an export of your data at any time from your app's Settings page. The data export runs at a lower priority than production queries, so if your app is still serving queries, production traffic will always be given a higher priority, which may slow down the delivery of your data export.

### Export Formats

Each collection will be exported in the same JSON format used by our REST API and delivered in a single zipped file. Since data is stored internally as JSON, this allows us to ensure that the export closely matches how the data is saved to Parse. Other formats such as CSV cannot represent all of the data types supported by Parse without losing information. If you'd like to work with your data in CSV format, you can use any of the JSON-to-CSV converters available widely on the web.

### Offline Analysis

For offline analysis of your data, we highly recommend using alternate ways to access your data that do not require extracting the entire collection at once. For example, you can try exporting only the data that has changed since your last export. Here are some ways of achieving this:

* Use the JavaScript SDK in a node app. `Parse.Query.each()` will allow you to extract every single object that matches a query. You can use date constraints to make sure the query only matches data that has been updated since you last ran this app. Your node app can write this data to disk for offline analysis.

* Use the REST API in a script. You can run queries against your class and use skip/limit to page through results, which can then be written to disk for offline analysis. You can again use date constraints to make sure only newly updated data is extracted.

* If the above two options do not fit your needs, you can try using the Data Browser to export data selectively. Use the Funnel icon to create a filter for the specific data that you need to export, such as newly updated objects. Once the filter has been applied, click on the Export data icon on the upper right of your Data Browser. This type of export will only include the objects that match your criteria.
