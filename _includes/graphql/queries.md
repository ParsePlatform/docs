# Queries

## Get

For each class in your application's schema, Parse Server automatically generates a custom query for getting this class' objects through the API.

For example, if you have a class named `GameScore` in the schema, Parse Server automatically generates a new query called `gameScore`, and you should be able to run the code below in your GraphQL Playground:

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```
```graphql
# GraphQL
query getAGameScore {
  gameScore(id: "R2FtZVNjb3JlOjZtdGlNcmtXNnY=") {
    id
    score
    playerName
    score
    cheatMode
    ACL {
      public {
        read
        write
      }
    }
  }
}
```
```jsonc
// Response
{
  "data": {
    "gameScore": {
      "id": "R2FtZVNjb3JlOjZtdGlNcmtXNnY=",
      "score": 1337,
      "playerName": "Sean Plott",
      "cheatMode": false,
      "ACL": {
        "public": {
          "read": true,
          "write": true
        }
      }
    }
  }
}
```

## Get with Relay

With the Relay specification you also have the choice to use [GraphQL Fragments](https://graphql.org/learn/queries/#fragments) through the `node` GraphQL Query. For a `GameScore` object the following query will do the job.

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```
```graphql
# GraphQL
query getGameScoreWithNodeRelay {
  node(id: "R2FtZVNjb3JlOjZtdGlNcmtXNnY") {
    id
    __typename
    ... on GameScore {
      playerName
      score
      cheatMode
    }
  }
}
```

```jsonc
// Response
{
  "data": {
    "node": {
      "id": "R2FtZVNjb3JlOjZtdGlNcmtXNnY=",
      "__typename": "GameScore",
      "playerName": "Sean Plott",
      "score": 1337,
      "cheatMode": false
    }
  }
}
```

Here using `Node Relay` is useful for writing generic requests for your front end components. For example, assuming we already have a `User` with a `Relay Node Id: X1VzZXI6Q1lMeWJYMjFjcw==` and `username: "johndoe"`.

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```
```graphql
# GraphQL
query genericGet {
  node(id: "X1VzZXI6Q1lMeWJYMjFjcw==") {
    id
    __typename
    ... on User {
      id
      username
    }
    ... on GameScore {
      playerName
      score
      cheatMode
    }
  }
}
```
```jsonc
// Response
{
  "data": {
    "node": {
      "id": "X1VzZXI6Q1lMeWJYMjFjcw==",
      "__typename": "User",
      "username": "johndoe"
    }
  }
}
```

## Find

For each class in your application's schema, Parse Server automatically generates a custom query for finding this class' objects through the GraphQL API.

For example, if you have a class named `GameScore` in the schema, Parse Server automatically generates a new query called `gameScores`, and you should be able to run the code below in your GraphQL Playground:

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```
```graphql
# GraphQL
query getSomeGameScores{
  gameScores {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    count
    edges {
      cursor
      node {
        id
        playerName
        score
        cheatMode
      }
    }
  }
}
```
```jsonc
// Response
{
  "data": {
    "gameScores": {
      "pageInfo": {
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
        "endCursor": "YXJyYXljb25uZWN0aW9uOjI="
      },
      "count": 3,
      "edges": [
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjA=",
          "node": {
            "id": "R2FtZVNjb3JlOjZtdGlNcmtXNnY=",
            "playerName": "Sean Plott",
            "score": 1337,
            "cheatMode": false
          }
        },
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjE=",
          "node": {
            "id": "R2FtZVNjb3JlOnp2cHdTYXlmYnA=",
            "playerName": "John Doe",
            "score": 13,
            "cheatMode": true
          }
        },
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjI=",
          "node": {
            "id": "R2FtZVNjb3JlOjNmWjBoQVJDVU0=",
            "playerName": "Steve Jordan",
            "score": 134,
            "cheatMode": false
          }
        }
      ]
    }
  }
}
```

### Where

You can use the `where` argument to add constraints to a class find query. See the example below:

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```
```graphql
# GraphQL
query getSomeGameScores {
  gameScores(where: {
  	score: { greaterThan: 158 }
  }) {
    count
    edges {
      cursor
      node {
        id
        playerName
        score
        cheatMode
      }
    }
  }
}
```
```jsonc
// Response
{
  "data": {
    "gameScores": {
      "count": 1,
      "edges": [
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjA=",
          "node": {
            "id": "R2FtZVNjb3JlOjZtdGlNcmtXNnY=",
            "playerName": "Sean Plott",
            "score": 1337,
            "cheatMode": false
          }
        }
      ]
    }
  }
}
```
Visit your GraphQL Playground if you want to know all the available constraints.

### Order

You can use the `order` argument to select in which order the results are returned in a class find query. See the example below:

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```
```graphql
# GraphQL
query getSomeGameScores {
  gameScores(
  	where: {
  	  cheatMode: { equalTo: false }
  	},
  	order: score_ASC
  ) {
    count
    edges {
      cursor
      node {
        id
        playerName
        score
        cheatMode
      }
    }
  }
}
```
```jsonc
// Response
{
  "data": {
    "gameScores": {
      "count": 2,
      "edges": [
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjA=",
          "node": {
            "id": "R2FtZVNjb3JlOjNmWjBoQVJDVU0=",
            "playerName": "Steve Jordan",
            "score": 134,
            "cheatMode": false
          }
        },
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjE=",
          "node": {
            "id": "R2FtZVNjb3JlOjZtdGlNcmtXNnY=",
            "playerName": "Sean Plott",
            "score": 1337,
            "cheatMode": false
          }
        }
      ]
    }
  }
}
```

### Pagination

[Relay Node Cursor](https://facebook.github.io/relay/graphql/connections.htm) provides a simple way to get efficient and easy to use pagination.

With Relay you can build flexible pagination based on cursors, here is the main effect of each argument:
* `skip`: a regular skip to exclude some results
* `first`: similar to a `limit` parameter but starts from the first result, e.g. `first: 10` retrieves the first 10 results
* `last`: retrieve the last results, e.g. `last: 10` retrieves the last 10 results
* `before`: get objects before the provided `Cursor`, in combination with `after` it allows you to build inverted pagination
* `after`: get objects after the provided `Cursor`, in combination with `first` you get a classic pagination similar to `skip & limit`

You can combine multiple parameters like: `before & last` or `after & first`, assuming you have an existing `cursor`.

Note: `cursor` is different to `id`, it is a temporary pagination ID for the query.

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```
```graphql
# GraphQL
query getSomeGameScores {
  gameScores(after: "YXJyYXljb25uZWN0aW9uOjE") {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    count
    edges {
      cursor
      node {
        id
        playerName
        score
        cheatMode
      }
    }
  }
}
```
```jsonc
// Response
{
  "data": {
    "gameScores": {
      "pageInfo": {
        "hasNextPage": false,
        "hasPreviousPage": true,
        "startCursor": "YXJyYXljb25uZWN0aW9uOjI=",
        "endCursor": "YXJyYXljb25uZWN0aW9uOjI="
      },
      "count": 3,
      "edges": [
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjI=",
          "node": {
            "id": "R2FtZVNjb3JlOjNmWjBoQVJDVU0=",
            "playerName": "Steve Jordan",
            "score": 134,
            "cheatMode": false
          }
        }
      ]
    }
  }
}
```

**Note**: `count` is a global count for available results, it's not the number of edges returned by the request.

## Nested Query

The GraphQL API supports nested queries, so you can find object and then execute query on relational child fields. Assuming that we have classes `Country`, `City`, `Company`:

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```

```graphql
query aNestedQuery {
  countries(where: {
    name: { matchesRegex: "Ma", options: "i" }
  }) {
    edges {
      node {
        name
        cities(where: {
          name: { matchesRegex: "pha", options: "i"}
        }) {
          edges {
            node {
              name
            }
          }
        }
      }
    }
  }
}
```
```jsonc
// Response
{
  "data": {
    "countries": {
      "edges": [
        {
          "node": {
            "name": "Mars",
            "cities": {
              "edges": [
                {
                  "node": {
                    "name": "Alpha"
                  }
                }
              ]
            }
          }
        }
      ]
    }
  }
}
```

## Relational Query
The GraphQL API supports complex parent relational queries. It means that all the `Pointer` and `Relation` fields in your database can be used easily throughout the API to query complex relational data. Let's take a look at the power of this feature.

### Parent Relation Style
Assuming that we have a `Country` class, `City` class, `Street` class and `House` class.
* `Country` has a `cities` `Relation` field.
* `City` has a `streets` `Relation` field.
* `Street` has a `houses` `Relation` field.

Let's build a query matching countries that contain at least one city with more than 20,000 people and that contain at least one street that matches `/rue/i` regex and this street should contain at least one house with a name equal to `Parse Members`.

The GraphQL API can handle this type of complex relational query with ease.

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```
```graphql
# GraphQL
{
  countries(
    where: {
      cities: {
        have: {
          peoplesNumber: { greaterThan: 20000 }
          streets: {
            have: {
              name: { matchesRegex: "rue", options: "i" }
              houses: { have: { name: { equalTo: "Parse Members" } } }
            }
          }
        }
      }
    }
  ) {
    edges {
      node {
        name
        cities {
          edges {
            node {
              name
              peoplesNumber
              streets {
                edges {
                  node {
                    name
                    houses {
                      edges {
                        node {
                          name
                        }
                        ... too many brackets here
}
```
```jsonc
// Response
{
  "data": {
    "countries": {
      "edges": [
        {
          "node": {
            "name": "France",
            "cities": {
              "edges": [
                {
                  "node": {
                    "name": "Toulouse",
                    "peoplesNumber": 400000,
                    "streets": {
                      "edges": [
                        {
                          "node": {
                            "name": "rue jean jaures",
                            "houses": {
                              "edges": [
                                {
                                  "node": {
                                    "name": "Parse Members"
                                  }
                                  ... too many brackets here
}
```

### Child Relation Style
Assuming that we have a `Country` class, `City` class, `Street` class, `House` class.
* `House` has a `street` `Pointer` field.
* `Street` has a `city` `Pointer` field.
* `City` has a `country` `Pointer` field.

Let's build a query matching houses where the street has a city that has a country with a name equal to `France`.

```jsonc
// Header
{
  "X-Parse-Application-Id": "APPLICATION_ID",
  "X-Parse-Master-Key": "MASTER_KEY" // (optional)
}
```
```graphql
# GraphQL
{
  houses(
    where: {
      street: {
        have: {
          city: {
            have: {
              country: {
                have: {
                  name: { equalTo: "France" }
                }
              }
            }
          }
        }
      }
    }
  ) {
    edges {
      node {
        name
        street {
          name
          city {
            name
            country {
              name
            }
          }
        }
      }
    }
  }
}

```
```jsonc
// Response
{
  "data": {
    "houses": {
      "edges": [
        {
          "node": {
            "name": "Parse Members",
            "street": {
              "name": "rue jean jaures",
              "city": {
                "name": "Toulouse",
                "country": {
                  "name": "France"
                }
              }
            }
          }
        }
      ]
    }
  }
}
```
