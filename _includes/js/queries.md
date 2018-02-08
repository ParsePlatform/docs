# Queries

We've already seen how a `Parse.Query` with `get` can retrieve a single `Parse.Object` from Parse. There are many other ways to retrieve data with `Parse.Query` - you can retrieve many objects at once, put conditions on the objects you wish to retrieve, and more.

## Basic Queries

In many cases, `get` isn't powerful enough to specify which objects you want to retrieve. `Parse.Query` offers different ways to retrieve a list of objects rather than just a single object.

The general pattern is to create a `Parse.Query`, put conditions on it, and then retrieve an `Array` of matching `Parse.Object`s using `find`. For example, to retrieve the scores that have a particular `playerName`, use the `equalTo` method to constrain the value for a key.

<pre><code class="javascript">
var GameScore = Parse.Object.extend("GameScore");
var query = new Parse.Query(GameScore);
query.equalTo("playerName", "Dan Stemkoski");
query.find({
  success: function(results) {
    alert("Successfully retrieved " + results.length + " scores.");
    // Do something with the returned Parse.Object values
    for (var i = 0; i < results.length; i++) {
      var object = results[i];
      alert(object.id + ' - ' + object.get('playerName'));
    }
  },
  error: function(error) {
    alert("Error: " + error.code + " " + error.message);
  }
});
</code></pre>

## Query Constraints

There are several ways to put constraints on the objects found by a `Parse.Query`. You can filter out objects with a particular key-value pair with `notEqualTo`:

<pre><code class="javascript">
query.notEqualTo("playerName", "Michael Yabuti");
</code></pre>

You can give multiple constraints, and objects will only be in the results if they match all of the constraints.  In other words, it's like an AND of constraints.

<pre><code class="javascript">
query.notEqualTo("playerName", "Michael Yabuti");
query.greaterThan("playerAge", 18);
</code></pre>

You can limit the number of results by setting `limit`. By default, results are limited to 100. In the old Parse hosted backend, the maximum limit was 1,000, but Parse Server removed that constraint:

<pre><code class="javascript">
query.limit(10); // limit to at most 10 results
</code></pre>

If you want exactly one result, a more convenient alternative may be to use `first` instead of using `find`.

<pre><code class="javascript">
var GameScore = Parse.Object.extend("GameScore");
var query = new Parse.Query(GameScore);
query.equalTo("playerEmail", "dstemkoski@example.com");
query.first({
  success: function(object) {
    // Successfully retrieved the object.
  },
  error: function(error) {
    alert("Error: " + error.code + " " + error.message);
  }
});
</code></pre>

You can skip the first results by setting `skip`. In the old Parse hosted backend, the maximum skip value was 10,000, but Parse Server removed that constraint. This can be useful for pagination:

<pre><code class="javascript">
query.skip(10); // skip the first 10 results
</code></pre>

For sortable types like numbers and strings, you can control the order in which results are returned:

<pre><code class="javascript">
// Sorts the results in ascending order by the score field
query.ascending("score");

// Sorts the results in descending order by the score field
query.descending("score");
</code></pre>

For sortable types, you can also use comparisons in queries:

<pre><code class="javascript">
// Restricts to wins < 50
query.lessThan("wins", 50);

// Restricts to wins <= 50
query.lessThanOrEqualTo("wins", 50);

// Restricts to wins > 50
query.greaterThan("wins", 50);

// Restricts to wins >= 50
query.greaterThanOrEqualTo("wins", 50);
</code></pre>

If you want to retrieve objects matching any of the values in a list of values, you can use `containedIn`, providing an array of acceptable values. This is often useful to replace multiple queries with a single query. For example, if you want to retrieve scores made by any player in a particular list:

<pre><code class="javascript">
// Finds scores from any of Jonathan, Dario, or Shawn
query.containedIn("playerName",
                  ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"]);
</code></pre>

If you want to retrieve objects that do not match any of  several values you can use `notContainedIn`, providing an array of acceptable values.  For example if you want to retrieve scores from players besides those in a list:

<pre><code class="javascript">
// Finds scores from anyone who is neither Jonathan, Dario, nor Shawn
query.notContainedIn("playerName",
                     ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"]);
</code></pre>

If you want to retrieve objects that have a particular key set, you can use `exists`. Conversely, if you want to retrieve objects without a particular key set, you can use `doesNotExist`.

<pre><code class="javascript">
// Finds objects that have the score set
query.exists("score");

// Finds objects that don't have the score set
query.doesNotExist("score");
</code></pre>

You can use the `matchesKeyInQuery` method to get objects where a key matches the value of a key in a set of objects resulting from another query.  For example, if you have a class containing sports teams and you store a user's hometown in the user class, you can issue one query to find the list of users whose hometown teams have winning records.  The query would look like:

<pre><code class="javascript">
var Team = Parse.Object.extend("Team");
var teamQuery = new Parse.Query(Team);
teamQuery.greaterThan("winPct", 0.5);
var userQuery = new Parse.Query(Parse.User);
userQuery.matchesKeyInQuery("hometown", "city", teamQuery);
userQuery.find({
  success: function(results) {
    // results has the list of users with a hometown team with a winning record
  }
});
</code></pre>

Conversely, to get objects where a key does not match the value of a key in a set of objects resulting from another query, use `doesNotMatchKeyInQuery`. For example, to find users whose hometown teams have losing records:

<pre><code class="javascript">
var losingUserQuery = new Parse.Query(Parse.User);
losingUserQuery.doesNotMatchKeyInQuery("hometown", "city", teamQuery);
losingUserQuery.find({
  success: function(results) {
    // results has the list of users with a hometown team with a losing record
  }
});
</code></pre>

You can restrict the fields returned by calling `select` with a list of keys. To retrieve documents that contain only the `score` and `playerName` fields (and also special built-in fields such as `objectId`, `createdAt`, and `updatedAt`):

<pre><code class="javascript">
var GameScore = Parse.Object.extend("GameScore");
var query = new Parse.Query(GameScore);
query.select("score", "playerName");
query.find().then(function(results) {
  // each of results will only have the selected fields available.
});
</code></pre>

The remaining fields can be fetched later by calling `fetch` on the returned objects:

<pre><code class="javascript">
query.first().then(function(result) {
  // only the selected fields of the object will now be available here.
  return result.fetch();
}).then(function(result) {
  // all fields of the object will now be available here.
});
</code></pre>

## Queries on Array Values

For keys with an array type, you can find objects where the key's array value contains 2 by:

<pre><code class="javascript">
// Find objects where the array in arrayKey contains 2.
query.equalTo("arrayKey", 2);
</code></pre>

You can also find objects where the key's array value contains each of the elements 2, 3, and 4 with the following:

<pre><code class="javascript">
// Find objects where the array in arrayKey contains all of the elements 2, 3, and 4.
query.containsAll("arrayKey", [2, 3, 4]);
</code></pre>

## Queries on String Values

<div class='tip info'><div>
 If you're trying to implement a generic search feature, we recommend taking a look at this blog post: <a href="http://blog.parse.com/learn/engineering/implementing-scalable-search-on-a-nosql-backend/">Implementing Scalable Search on a NoSQL Backend</a>.
</div></div>

Use `startsWith` to restrict to string values that start with a particular string. Similar to a MySQL LIKE operator, this is indexed so it is efficient for large datasets:

<pre><code class="javascript">
// Finds barbecue sauces that start with "Big Daddy's".
var query = new Parse.Query(BarbecueSauce);
query.startsWith("name", "Big Daddy's");
</code></pre>

The above example will match any `BarbecueSauce` objects where the value in the "name" String key starts with "Big Daddy's". For example, both "Big Daddy's" and "Big Daddy's BBQ" will match, but "big daddy's" or "BBQ Sauce: Big Daddy's" will not.

Queries that have regular expression constraints are very expensive, especially for classes with over 100,000 records. Parse restricts how many such operations can be run on a particular app at any given time.

### Full Text Search

You can use `fullText` for efficient search capabilities. Text indexes are automatically created for you. Your strings are turned into tokens for fast searching.

* Note: Full Text Search can be resource intensive. Ensure the cost of using indexes is worth the benefit, see [storage requirements & performance costs of text indexes.](https://docs.mongodb.com/manual/core/index-text/#storage-requirements-and-performance-costs).

* Parse Server 2.5.0+

<pre><code class="javascript">
var query = new Parse.Query(BarbecueSauce);
query.fullText('name', 'bbq');
</code></pre>

The above example will match any `BarbecueSauce` objects where the value in the "name" String key contains "bbq". For example, both "Big Daddy's BBQ", "Big Daddy's bbq" and "Big BBQ Daddy" will match.

<pre><code class="javascript">
// You can sort by weight / rank. ascending('') and select()
var query = new Parse.Query(BarbecueSauce);
query.fullText('name', 'bbq');
query.ascending('$score');
query.select('$score');
query.find()
  .then(function(results) {
    // results contains a weight / rank in result.get('score')
  })
  .catch(function(error) {
    // There was an error.
  });
</code></pre>



For Case or Diacritic Sensitive search, please use the [REST API](http://docs.parseplatform.org/rest/guide/#queries-on-string-values).

## Relational Queries

There are several ways to issue queries for relational data. If you want to retrieve objects where a field matches a particular `Parse.Object`, you can use `equalTo` just like for other data types. For example, if each `Comment` has a `Post` object in its `post` field, you can fetch comments for a particular `Post`:

<pre><code class="javascript">
// Assume Parse.Object myPost was previously created.
var query = new Parse.Query(Comment);
query.equalTo("post", myPost);
query.find({
  success: function(comments) {
    // comments now contains the comments for myPost
  }
});
</code></pre>

If you want to retrieve objects where a field contains a `Parse.Object` that matches a different query, you can use `matchesQuery`. In order to find comments for posts containing images, you can do:

<pre><code class="javascript">
var Post = Parse.Object.extend("Post");
var Comment = Parse.Object.extend("Comment");
var innerQuery = new Parse.Query(Post);
innerQuery.exists("image");
var query = new Parse.Query(Comment);
query.matchesQuery("post", innerQuery);
query.find({
  success: function(comments) {
    // comments now contains the comments for posts with images.
  }
});
</code></pre>

If you want to retrieve objects where a field contains a `Parse.Object` that does not match a different query, you can use `doesNotMatchQuery`.  In order to find comments for posts without images, you can do:

<pre><code class="javascript">
var Post = Parse.Object.extend("Post");
var Comment = Parse.Object.extend("Comment");
var innerQuery = new Parse.Query(Post);
innerQuery.exists("image");
var query = new Parse.Query(Comment);
query.doesNotMatchQuery("post", innerQuery);
query.find({
  success: function(comments) {
    // comments now contains the comments for posts without images.
  }
});
</code></pre>

You can also do relational queries by `objectId`:

<pre><code class="javascript">
var post = new Post();
post.id = "1zEcyElZ80";
query.equalTo("post", post);
</code></pre>

In some situations, you want to return multiple types of related objects in one query. You can do this with the `include` method. For example, let's say you are retrieving the last ten comments, and you want to retrieve their related posts at the same time:

<pre><code class="javascript">
var query = new Parse.Query(Comment);

// Retrieve the most recent ones
query.descending("createdAt");

// Only retrieve the last ten
query.limit(10);

// Include the post data with each comment
query.include("post");

query.find({
  success: function(comments) {
    // Comments now contains the last ten comments, and the "post" field
    // has been populated. For example:
    for (var i = 0; i < comments.length; i++) {
      // This does not require a network access.
      var post = comments[i].get("post");
    }
  }
});
</code></pre>

You can also do multi level includes using dot notation.  If you wanted to include the post for a comment and the post's author as well you can do:

<pre><code class="javascript">
query.include(["post.author"]);
</code></pre>

You can issue a query with multiple fields included by calling `include` multiple times. This functionality also works with Parse.Query helpers like `first` and `get`.

## Counting Objects

Note: In the old Parse hosted backend, count queries were rate limited to a maximum of 160 requests per minute. They also returned inaccurate results for classes with more than 1,000 objects. But, Parse Server has removed both constraints and can count objects well above 1,000.

If you just need to count how many objects match a query, but you do not need to retrieve all the objects that match, you can use `count` instead of `find`. For example, to count how many games have been played by a particular player:

<pre><code class="javascript">
var GameScore = Parse.Object.extend("GameScore");
var query = new Parse.Query(GameScore);
query.equalTo("playerName", "Sean Plott");
query.count({
  success: function(count) {
    // The count request succeeded. Show the count
    alert("Sean has played " + count + " games");
  },
  error: function(error) {
    // The request failed
  }
});
</code></pre>


## Compound Queries

For more complex queries you might need compound queries. A compound query is a logical combination (e. g. "and" or "or") of sub queries.

Note that we do not support GeoPoint or non-filtering constraints (e.g. `near`, `withinGeoBox`, `limit`, `skip`, `ascending`/`descending`, `include`) in the subqueries of the compound query.


### OR-ed query constraints

If you want to find objects that match one of several queries, you can use `Parse.Query.or` method to construct a query that is an OR of the queries passed in.  For instance if you want to find players who either have a lot of wins or a few wins, you can do:

<pre><code class="javascript">
var lotsOfWins = new Parse.Query("Player");
lotsOfWins.greaterThan("wins", 150);

var fewWins = new Parse.Query("Player");
fewWins.lessThan("wins", 5);

var mainQuery = Parse.Query.or(lotsOfWins, fewWins);
mainQuery.find()
  .then(function(results) {
    // results contains a list of players that either have won a lot of games or won only a few games.
  })
  .catch(function(error) {
    // There was an error.
  });
</code></pre>


### AND-ed query constraints

If you want to find objects that match all conditions, you normally would use just one query. You can add additional constraints to the newly created `Parse.Query` that act as an 'and' operator.

<pre><code class="javascript">
var query = new Parse.Query("User");
query.greaterThan("age", 18);
query.greaterThan("friends", 0);
query.find()
  .then(function(results) {
    // results contains a list of users both older than 18 and having friends.
  })
  .catch(function(error) {
    // There was an error.
  });
</code></pre>

Sometimes the world is more complex than this simple example and you may need a compound query of sub queries. You can use `Parse.Query.and` method to construct a query that is an AND of the queries passed in. For instance if you want to find users in the age of 16 or 18 who have either no friends or at least 2 friends, you can do:

<pre><code class="javascript">
var age16Query = new Parse.Query("User");
age16Query.equalTo("age", 16);

var age18Query = new Parse.Query("User");
age18Query.equalTo("age", 18);

var friends0Query = new Parse.Query("User");
friends0Query.equalTo("friends", 0);

var friends2Query = new Parse.Query("User");
friends2Query.greaterThan("friends", 2);

var mainQuery = Parse.Query.and(
  Parse.Query.or(age16Query, age18Query),
  Parse.Query.or(friends0Query, friends2Query)
);
mainQuery.find()
  .then(function(results) {
    // results contains a list of users in the age of 16 or 18 who have either no friends or at least 2 friends
    // results: (age 16 or 18) and (0 or >2 friends)
  })
  .catch(function(error) {
    // There was an error.
  });
</code></pre>

## Aggregate

Queries can be made using aggregates, allowing you to retrieve objects over a set of input values. The results will not be `Parse.Object`s since you will be aggregating your own fields

* Parse Server 2.7.1+
* `MasterKey` is Required.

Aggregates use stages to filter results by piping results from one stage to the next.

You can create a pipeline using an Array or an Object.

The following example is a pipeline similar to `distinct` grouping by name field.

<pre><code class="javascript">
var pipelineObject = {
  group: { objectId: '$name' }
 };

var pipelineArray = [
  { group: { objectId: '$name' } }
];
</code></pre>

For a list of available operators please refer to [Mongo Aggregate Documentation](https://docs.mongodb.com/v3.2/reference/operator/aggregation/).

* Note: Most operations in Mongo Aggregate Documentation will work with Parse Server, but `_id` doesn't exist. Please replace with `objectId`.

Group pipeline is similar to `distinct`.

You can group by a field.

<pre><code class="javascript">
// score is the field. $ before score lets the database know this is a field
var pipeline = [
  group: { objectId: '$score' }
];
var query = new Parse.Query("User");
query.aggregate(pipeline);
query.find()
  .then(function(results) {
    // results contains unique score values
  })
  .catch(function(error) {
    // There was an error.
  });
</code></pre>

You can apply collective calculations like $sum, $avg, $max, $min.

<pre><code class="javascript">
// total will be a newly created field to hold the sum of score field
var pipeline = [
  group: { objectId: null, total: { $sum: '$score' } }
];
var query = new Parse.Query("User");
query.aggregate(pipeline);
query.find()
  .then(function(results) {
    // results contains sum of score field and stores it in results[0].total
  })
  .catch(function(error) {
    // There was an error.
  });
</code></pre>

Project pipeline is similar to `keys` or `select`, add or remove existing fields.

<pre><code class="javascript">
var pipeline = [
  project: { name: 1 }
];
var query = new Parse.Query("User");
query.aggregate(pipeline);
query.find()
  .then(function(results) {
    // results contains only name field
  })
  .catch(function(error) {
    // There was an error.
  });
</code></pre>

Match pipeline is similar to `equalTo`.

<pre><code class="javascript">
var pipeline = [
  { match: { name: 'BBQ' } }
];
var query = new Parse.Query("User");
query.aggregate(pipeline);
query.find()
  .then(function(results) {
    // results contains name that matches 'BBQ'
  })
  .catch(function(error) {
    // There was an error.
  });
</code></pre>

You can match by comparison.

<pre><code class="javascript">
var pipeline = [
  match: { score: { $gt: 15 } }
];
var query = new Parse.Query("User");
query.aggregate(pipeline);
query.find()
  .then(function(results) {
    // results contains score greater than 15
  })
  .catch(function(error) {
    // There was an error.
  });
</code></pre>

## Distinct

Queries can be made using distinct, allowing you find unique values for a specified field.

* Parse Server 2.7.1+
* `MasterKey` is required.

<pre><code class="javascript">
var query = new Parse.Query("User");
query.distinct("age")
  .then(function(results) {
    // results contains unique age
  })
  .catch(function(error) {
    // There was an error.
  });
</code></pre>

You can also restrict results by using `equalTo`.

<pre><code class="javascript">
var query = new Parse.Query("User");
query.equalTo("name", "foo");
query.distinct("age")
  .then(function(results) {
    // results contains unique age where name is foo
  })
  .catch(function(error) {
    // There was an error.
  });
</code></pre>
