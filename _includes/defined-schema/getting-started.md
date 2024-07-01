# Getting Started

## Introduction

For use cases in which a pre-defined schema is beneficial or required, you can define class fields, indexes, Class Level Permissions and more.

## Quick Start

You can use Defined Schema as in the following example.

```js
const { ParseServer } = require("parse-server");

const UserSchema = {
  className: "_User",
  fields: {
    birthDate: { type: "Date" },
    firstname: { type: "String", required: true },
    lastname: { type: "String", required: true },
    tags: { type: "Array" },
    location: { type: "GeoPoint" },
    city: { type: "Pointer", targetClass: "City" },
    friends: { type: "Relation", targetClass: "_User" },
    zone: { type: "Polygon" },
  },
  indexes: {
    tagsIndex: { tags: 1 },
    // The special prefix _p_ is used to create indexes on pointer fields
    cityPointerIndex: { _p_city: 1 },
    tagAndCityIndex: { _p_city: 1, tags: 1 },
  },
  classLevelPermissions: {
    find: { requiresAuthentication: true },
    count: { "role:Admin": true },
    get: { requiresAuthentication: true },
    update: { requiresAuthentication: true },
    create: { "role:Admin": true },
    delete: { "role:Admin": true },
    protectedFields: {
      // These fields will be protected from all other users. AuthData and password are already protected by default
      "*": ["authData", "emailVerified", "password", "username"],
    },
  },
};

const City = {
  className: "City",
  fields: {
    name: { type: "String", required: true },
    location: { type: "GeoPoint" },
    country: { type: "Pointer", targetClass: "Country" },
  },
  classLevelPermissions: {
    find: { requiresAuthentication: true },
    count: { requiresAuthentication: true },
    get: { requiresAuthentication: true },
    // Only a user linked to the Admin Parse Role is authorized to manage cities
    update: { "role:Admin": true },
    create: { "role:Admin": true },
    delete: { "role:Admin": true },
  },
};

const Country = {
  className: "Country",
  fields: {
    name: { type: "String", required: true },
  },
  classLevelPermissions: {
    find: { requiresAuthentication: true },
    count: { requiresAuthentication: true },
    get: { requiresAuthentication: true },
    // An empty object means that only master key is authorized to manage countries
    update: {},
    create: {},
    delete: {},
  },
};

ParseServer.start({
  databaseURI: "mongodb://your.mongo.uri",
  appId: "myAppId",
  masterKey: "mySecretMasterKey",
  serverURL: "http://localhost:1337/parse",
  port: 1337,
  publicServerURL: "http://localhost:1337/parse",
  // Define schemas of Parse Server
  schema: {
    definitions: [User, City, Country],
    // If set to `true`, the Parse Server API for schema changes is disabled and schema 
    // changes are only possible by redeployingParse Server with a new schema definition
    lockSchemas: true,
    // If set to `true`, Parse Server will automatically delete non-defined classes from
    // the database; internal classes like `User` or `Role` are never deleted.
    strict: true,
    // If set to `true`, a field type change will cause the field including its data to be
    // deleted from the database, and then a new field to be created with the new type
    recreateModifiedFields: false,
    // If set to `true`, Parse Server will automatically delete non-defined class fields;
    // internal fields in classes like User or Role are never deleted.
    deleteExtraFields: false,
  },
  serverStartComplete: () => {
    // Parse Server is ready with up-to-date schema
    parseServer.expressApp.get("/ready", (req: any, res: any) => {
      res.send("true");
    });
  },
});
```
