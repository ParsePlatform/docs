# Customisation

Although we automatically generate a GraphQL schema based on your Parse Server database, we have provided a number of ways in which to configure and extend this schema.

## Configuration

Whilst it's great to simply plug GraphQL into your Parse setup and immediately query any of your existing classes, you may find that this level of exposure is not suitable to your project. We have therefore provided a flexible way to limit which types, queries mutations are exposed within your GraphQL schema.

### Configuration Options

By default, no configuration is needed to get GraphQL working with your Parse Server. All of the following settings are completely optional, and can be provided or omitted as desired. To configure your schema, you simply need to provide a valid JSON object with the expected properties as described below:

```typescript
// The properties with ? are optional

interface ParseGraphQLConfiguration {
  // All classes enabled by default
  // Provide an empty array to disable all classes
  enabledForClasses?: Array<string>;

  // Selectively disable specific classes
  disabledForClasses?: Array<string>;

  // Provide an array of per-class settings
  classConfigs?: Array<{

    // You must provide a className
    // Only provide one config object per class
    className: string;

    type?: {

      // By default, all fields can be sent for
      // a create or update mutation. Use this
      // setting to limit to specific fields.
      inputFields?: {
        create?: Array<string>;
        update?: Array<string>;
      };

      // By default, all fields can be resolved
      // on a get or find query. Use this to limit
      // which fields can be selected.
      outputFields?: Array<string>;

      // By default, all valid fields can be used
      // to filter a query. Use this to limit
      // which fields can be used to constrain a query.
      constraintFields?: Array<string>;

      // By default, all valid fields can be used
      // to sort the results of a query. Use this to
      // limit which fields can be used to sort a query
      // and which direction that sort can be set to.
      sortFields?: {
        field: string;
        asc: boolean;
        desc: boolean;
      }[];
    };

    // By default, a get and find query type is created
    // for all included classes. Use this to disable
    // the available query types for this class.
    query?: {
      get?: boolean;
      find?: boolean;
      getAlias?: String;
      findAlias?: String;
    };

    // By default, all write mutation types are
    // exposed for all included classes. Use this to disable
    // the available mutation types for this class and optionally
    // override the default generated name with aliases.
    mutation?: {
      create?: boolean;
      update?: boolean;
      destroy?: boolean;
      createAlias?: String,
      updateAlias?: String,
      destroyAlias?: String,
    };
  }>
}
```

### Set or Update Configuration

We have provided a public API in `ParseGraphQLServer` which accepts the above JSON object for setting (and updating) your Parse GraphQL Configuration, `setGraphQLConfig`:

```javascript
  const parseGraphQLServer = new ParseGraphQLServer(parseServer, {
    graphQLPath: parseServerConfig.graphQLPath,
    playgroundPath: parseServerConfig.playgroundPath
  });

  const config = {
    // ... ParseGraphQLConfiguration
  };

  await parseGraphQLServer.setGraphQLConfig(config);
```

### Include or Exclude Classes

By default, all of your Parse classes, including the defaults such as `Parse.User`, `Parse.Session`, `Parse.Role` are added to the schema. You can restrict this using the `enabledForClassess` or `disabledForClassess` options, which accepts an array of class names.


In the following example, we limit our GraphQL schema to only expose the default `_User` class, along with a few custom classes:

```jsonc
{
  "enabledForClasses": ["_User", "Book", "Review", "Comment"],
  "disabledForClasses": null
}
```

In the following example, we limit our GraphQL schema by hiding some sensitive classes:

```javascript
{
  // undefined or null results in the default behaviour, i.e. include all classes
  "enabledForClasses": undefined,
  // override the included classes by filtering out the following:
  "disabledForClasses": [ "UserSensitiveData", "ProductOrder", "Invoice" ]
}
```

### Input Types

By default, we enrich the schema by generating a number of [Input Types](https://graphql.org/learn/schema/#input-types) for each class. This, as a healthy side-effect, improves development experience by providing type-completion and docs, though the true purpose is to define exactly what fields are exposed and useable per operation type. You can provide a `type` setting for any or each of your classes to limit which fields are exposed:

In the following example, we have a custom class called `Review` where the fields `rating` and `body` are allowed on the `create` mutation, and the field `numberOfLikes` on the `update` mutation:

```jsonc
{
  "classConfigs": [
    {
      "className": "Review",
      "type": {
        "inputFields": {
          "create": ["rating", "body"],
          "update": ["numberOfLikes"]
        }
      }
    }
  ]
}
```

You may decide to restrict which fields can be resolved when getting or finding records from a given class, for example, if you have a class called `Video` which includes a sensitive field `dmcaFlags`, you can hide this field by explicitly stating the fields that can be resolved:

```jsonc
{
  "classConfigs": [
    {
      "className": "Video",
      "type": {
        "outputFields": ["name", "author", "numberOfViews",   "comments", "cdnUrl"]
      }
    }
  ]
}
```

In production-grade environments where performance optimisation is critical, complete control over query filters and sortability is required to ensure that unindexed queries are not executed. For this reason, we provide a way to limit which fields can be used to constrain a query, and which fields (including the direction) can be used to sort that query.


In the following example, we set the fields `name` and `age` as the only two that can be used to filter the `_User` class, and defining the `createdAt` and `age` fields the only sortable field whilst disabling the ascending direction on the `createdAt` field:

```jsonc
{
  "classConfigs": [
    {
      "className": "_User",
      "type": {
         "constraintFields": ["name", "age"],
          "sortFields": [
            {
              "field": "createdAt",
              "desc": true,
              "asc": false
            },
            {
              "field": "age",
              "desc": true,
              "asc": true
            }
          ]
        }
      }
  ]
}
```

<h3 id="queries-config">Queries</h3>

By default, the schema exposes a `get` and `find` operation for each class, for example, `get_User` and `find_User`. You can disable either of these for any class in your schema, like so:


```jsonc
{
  "classConfigs": [
    {
      "className": "_User",
      "query": {
        "get": true,
        "find": false
      }
    },
    {
      "className": "Review",
      "query": {
        "get": false,
        "find": true
      }
    }
  ]
}
```

By default, generated query names use pluralized version of `className`. You can override this behaviour with `getAlias`/`findAlias`. This is useful when your collection is named in plural or when singular/plural forms are same e.g. `Data`:

```jsonc
{
  "classConfigs": [
    {
      "className": "Likes",
      "query": {
        "getAlias": "like"
      }
    },
    {
      "className": "Data",
      "query": {
        "findAlias": "findData"
      }
    }
  ]
}

```
<h3 id="mutations-config">Mutations</h3>

By default, the schema exposes a `create`, `update` and `delete` operation for each class, for example, `create_User`, `update_User` and `delete_User`. You can disable any of these mutations for any class in your schema, like so:


```jsonc
{
  "classConfigs": [
    {
      "className": "_User",
      "mutation": {
        "create": true,
        "update": true,
        "destroy": true
      }
    },
    {
      "className": "Review",
      "mutation": {
        "create": true,
        "update": false,
        "destroy": true
      }
    }
  ]
}
```

**Note**: the `delete` mutation setting key is named `destroy` to avoid issues due to `delete` being a javascript reserved word.

You can optionally override the default generated mutation names with aliases:

```jsonc
{
  "classConfigs": [
    {
      "className": "Record",
      "mutation": {
        "createAlias": "newRecord",
        "updateAlias": "changeRecord",
        "destroyAlias": "eraseRecord"
      }
    }
  ]
}
```

### Remove Configuration

Deploying a custom configuration via `setGraphQLConfig` persists the changes into the database. As a result, simply deleting a configuration change and deploying again does not result in a default Parse GraphQL configuration. The configuration changes remain.

To remove a configuration, set the affected properties to `null` or `undefined` before deploying. The default Parse GraphQL configuration for those properties will be restored.

```js
{
  "enabledForClasses": undefined,
  "disabledForClasses": undefined,
  "classConfigs": undefined,
}
```

Once a default configuration is restored, you can safely remove any unused configuration changes from your `parseGraphQLServer` setup.

## Cloud Code Resolvers

The Parse GraphQL API supports the use of custom user-defined schema. The [Adding Custom Schema](#adding-custom-schema) section explains how to get started using this feature.

Cloud Code functions can then be used as custom resolvers for your user-defined schema.

### Query Resolvers

Here's an example of a custom query and its related cloud code function resolver in action:

```graphql
# schema.graphql
extend type Query {
  hello: String! @resolve
}
```

```js
// main.js
Parse.Cloud.define("hello", () => "Hello, world!");
```

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```

```graphql
query hello {
  hello
}
```

The code above should resolve to this:

```jsonc
// Response
{
  "data": {
    "hello": "Hello, world!"
  }
}
```

### Mutation Resolvers

At times, you may need more control over how your mutations modify data than what Parse's auto-generated mutations can provide. For example, if you have classes named `Item` and `CartItem` in the schema, you can create an `addToCart` custom mutation that tests whether a specific item is already in the user's cart. If found, the cart item's quantity is incremented by one. If not, a new `CartItem` object is created.

The ability to branch your resolver logic enables you to replicate functionality found in Parse's auto-generated `createCartItem` and `updateCartItem` mutations and combine those behaviors into a single custom resolver.

```graphql
# schema.graphql
extend type Mutation {
  addToCart(id: ID!): CartItem! @resolve
}
```

**Note**: The `id` passed in to your Cloud Code function from a GraphQL query is a [Relay Global Object Identification](https://facebook.github.io/relay/graphql/objectidentification.htm); it is **not** a Parse `objectId`. Most of the time the `Relay Node Id` is a `Base64` of the `ParseClass` and the `objectId`. Cloud code does not recognize a `Relay Node Id`, so converting it to a Parse `objectId` is required.

Decoding and encoding `Relay Node Ids` in Cloud Code is needed in order to smoothly interface with your client-side GraphQL queries and mutations.

First, install the [Relay Library for GraphQL.js](https://www.npmjs.com/package/graphql-relay) as a required dependency to enable decoding and encoding `Relay Node Ids` in your cloud code functions:

```sh
$ npm install graphql-relay --save
```

Then, create your `main.js` cloud code file, import `graphql-relay`, and build your `addToCart` function:

```js
// main.js
const { fromGlobalId, toGlobalId } = require('graphql-relay');

Parse.Cloud.define("addToCart", async (req) => {
  const { user, params: { id } } = req;

  // Decode the incoming Relay Node Id to a
  // Parse objectId for Cloud Code use.
  const { id: itemObjectId } = fromGlobalId(id);

  // Query the user's current cart.
  const itemQuery = new Parse.Query("Item");
  const item = await itemQuery.get(itemObjectId);
  const cartItemQuery = new Parse.Query("CartItem");
  cartItemQuery.equalTo("item", item);
  cartItemQuery.equalTo("user", user);
  const [existingCartItem] = await cartItemQuery.find();
  let savedCartItem;

  if (existingCartItem) {
    // The item is found in the user's cart; increment its quantity.
    const quantity = await existingCartItem.get("quantity");
    existingCartItem.set("quantity", quantity + 1);
    savedCartItem = await existingCartItem.save();
  } else {
    // The item has not yet been added; create a new cartItem object.
    const CartItem = Parse.Object.extend("CartItem");
    const cartItem = new CartItem();
    savedCartItem = await cartItem.save({ quantity: 1, item, user });
  }

  // Encode the Parse objectId to a Relay Node Id
  // for Parse GraphQL use.
  const cartItemId = toGlobalId('CartItem', savedCartItem.id);

  // Convert to a JSON object to handle adding the
  // Relay Node Id property.
  return { ...savedCartItem.toJSON(), id: cartItemId };
});
```

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Session-Token": "r:b0dfad1eeafa4425d9508f1c0a15c3fa"
}
```

```graphql
mutation addItemToCart {
  addToCart(id: "SXRlbTpEbDVjZmFWclRI") {
    id
    quantity
  }
}
```

The code above should resolve to something similar to this:

```jsonc
// Response
{
  "data": {
    "addToCart": {
      "id": "Q2FydEl0ZW06akVVTHlGZnVpQw==",
      "quantity": 1
    }
  }
}
```
