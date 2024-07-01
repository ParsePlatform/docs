# Optimization

## Indexing

To optimize your server/database performance and response time you need to configure some indexes based on the types of queries that you use in your app.
Currently index manipulations are not supported on the GraphQL API but you can use the [Parse JS SDK Indexes API](https://docs.parseplatform.org/js/guide/#indexes)

Here's a simple example:
```graphql
# First we update the user class
mutation {
  updateClass(
    input: {
      name: "_User"
      schemaFields: {
        addStrings: [{ name: "firstname" }, { name: "lastname" }]
        addDates: [{ name: "birthdate" }]
        addNumbers: [{ name: "credit" }]
      }
    }
  ) {
    class {
      name
    }
  }
}
```
```graphql
# Then lets assume that we have this query in our app
query ASuperUsedQuery {
  users(
    where: {
      firstname: { in: ["John", "Michael", "Sabrina"] }
      lastname: { matchesRegex: "^Do" }
      birthdate: { exists: true }
      credit: { greaterThanOrEqualTo: 100 }
    },
    order: credit_ASC
  ) {
    edges {
      node {
        id
        firstname
      }
    }
  }
}
```
```js
// Add the index to user class
const addAnIndexToUserClass = () => {
    // Get current class from database
    const UserClass = await (new Parse.Schema('_User')).get();
    UserClass.addIndex('ASuperUsedQueryIndex', {
        firstname: 1,
        lastname: 1,
        birthdate: 1,
        credit: 1
    });
    await UserClass.update()
    console.log('Index for ASuperUsedQuery created')
}
```
And thats all, your query is optimized and you should have blazing fast responses even with millions of objects.

**Warning:** Only add indexes for most used queries, an over indexed MongoDB will eat lots of RAM.

## Relational

When using the GraphQL API, use the same best practices to construct your database. In the Queries section we saw both parent and child relations.

In the majority of use cases it's best to reference the parent object inside the child and use a child query style.

```graphql
# A Good Schema
mutation EfficientSchema {
  City: createClass(
    input: {
      name: "City"
      schemaFields: {
        addStrings: [{ name: "name" }]
        addPointers: [
            {
                name: "country",
                targetClassName: "Country"
            }
        ]
      }
    }
  ) {
    class {
      name
    }
  }
  Country: createClass(
    input: {
        name: "Country",
        schemaFields: {
            addStrings: [{ name: "name" }]
        }
    }
  ) {
    class {
      name
    }
  }
}
```
```graphql
# A Bad Schema
mutation NotEfficientSchema {
  City: createClass(
    input: {
        name: "City",
        schemaFields: {
            addStrings: [{ name: "name" }]
        }
    }
  ) {
    class {
      name
    }
  }
  Country: createClass(
    input: {
      name: "Country"
      schemaFields: {
        addStrings: [{ name: "name" }]
        addRelations: [
            {
                name: "cities",
                targetClassName: "City"
            }
        ]
      }
    }
  ) {
    class {
      name
    }
  }
}
```

## GraphQL Clients

If you use a Graphql Client with a cache system like **Apollo Client** you must add the `id` field in each of your graphql `Queries` and `Mutations`, your client can now update dynamically its local cache based on your graphql operations.

**Note:** On `Mutation` it's recommended to ask to GraphQL to return the modified fields, then your GraphQL Client can update the object in the local cache.

Here a quick example:
```graphql
# Cache Optimized Mutation
mutation OptimizedMutation {
  updateUser(
    input: {
        id: "xxxx",
        fields: {
            firstname: "John",
            lastname: "Doe"
        }
    }
  ) {
    user {
      id
      firstname
      lastname
    }
  }
}

```
