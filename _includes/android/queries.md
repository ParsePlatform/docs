# Queries

We've already seen how a `ParseQuery` with `getInBackground` can retrieve a single `ParseObject` from Parse. There are many other ways to retrieve data with `ParseQuery` - you can retrieve many objects at once, put conditions on the objects you wish to retrieve, cache queries automatically to avoid writing that code yourself, and more.

## Basic Queries

In many cases, `getInBackground` isn't powerful enough to specify which objects you want to retrieve. The `ParseQuery` offers different ways to retrieve a list of objects rather than just a single object.

The general pattern is to create a `ParseQuery`, put conditions on it, and then retrieve a `List` of matching `ParseObject`s using the `findInBackground` method with a `FindCallback`. For example, to retrieve scores with a particular `playerName`, use the `whereEqualTo` method to constrain the value for a key:

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");
query.whereEqualTo("playerName", "Dan Stemkoski");
query.findInBackground(new FindCallback<ParseObject>() {
    public void done(List<ParseObject> scoreList, ParseException e) {
        if (e == null) {
            Log.d("score", "Retrieved " + scoreList.size() + " scores");
        } else {
            Log.d("score", "Error: " + e.getMessage());
        }
    }
});
```

`findInBackground` works similarly to `getInBackground` in that it assures the network request is done on a background thread, and runs its callback in the main thread.

## Query Constraints

There are several ways to put constraints on the objects found by a `ParseQuery`. You can filter out objects with a particular key-value pair with `whereNotEqualTo`:

```java
query.whereNotEqualTo("playerName", "Michael Yabuti");
```

You can give multiple constraints, and objects will only be in the results if they match all of the constraints.  In other words, it's like an AND of constraints.

```java
query.whereNotEqualTo("playerName", "Michael Yabuti");
query.whereGreaterThan("playerAge", 18);
```

You can limit the number of results with `setLimit`. By default, results are limited to 100. In the old Parse hosted backend, the maximum limit was 1,000, but Parse Server removed that constraint:

```java
query.setLimit(10); // limit to at most 10 results
```

If you want exactly one result, a more convenient alternative may be to use `getFirst` or `getFirstInBackground` instead of using `find`.

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");
query.whereEqualTo("playerEmail", "dstemkoski@example.com");
query.getFirstInBackground(new GetCallback<ParseObject>() {
  public void done(ParseObject object, ParseException e) {
    if (object == null) {
      Log.d("score", "The getFirst request failed.");
    } else {
      Log.d("score", "Retrieved the object.");
    }
  }
});
```

You can skip the first results with `setSkip`. In the old Parse hosted backend, the maximum skip value was 10,000, but Parse Server removed that constraint. This can be useful for pagination:

```java
query.setSkip(10); // skip the first 10 results
```

For sortable types like numbers and strings, you can control the order in which results are returned:

```java
// Sorts the results in ascending order by the score field
query.orderByAscending("score");

// Sorts the results in descending order by the score field
query.orderByDescending("score");
```

You can add more sort keys to the query as follows:

```java
// Sorts the results in ascending order by the score field if the previous sort keys are equal.
query.addAscendingOrder("score");

// Sorts the results in descending order by the score field if the previous sort keys are equal.
query.addDescendingOrder("score");
```

For sortable types, you can also use comparisons in queries:

```java
// Restricts to wins < 50
query.whereLessThan("wins", 50);

// Restricts to wins <= 50
query.whereLessThanOrEqualTo("wins", 50);

// Restricts to wins > 50
query.whereGreaterThan("wins", 50);

// Restricts to wins >= 50
query.whereGreaterThanOrEqualTo("wins", 50);
```

If you want to retrieve objects matching several different values, you can use `whereContainedIn`, providing a collection of acceptable values. This is often useful to replace multiple queries with a single query. For example, if you want to retrieve scores made by any player in a particular list:

```java
String[] names = {"Jonathan Walsh", "Dario Wunsch", "Shawn Simon"};
query.whereContainedIn("playerName", Arrays.asList(names));
```

If you want to retrieve objects that do not match any of several values you can use `whereNotContainedIn`, providing an array of acceptable values.  For example, if you want to retrieve scores from players besides those in a list:

```java
String[] names = {"Jonathan Walsh", "Dario Wunsch", "Shawn Simon"};
query.whereNotContainedIn("playerName", Arrays.asList(names));
```

If you want to retrieve objects that have a particular key set, you can use `whereExists`. Conversely, if you want to retrieve objects without a particular key set, you can use `whereDoesNotExist`.

```java
// Finds objects that have the score set
query.whereExists("score");

// Finds objects that don't have the score set
query.whereDoesNotExist("score");
```

You can use the `whereMatchesKeyInQuery` method to get objects where a key matches the value of a key in a set of objects resulting from another query.  For example, if you have a class containing sports teams and you store a user's hometown in the user class, you can issue one query to find the list of users whose hometown teams have winning records.  The query would look like:

```java
ParseQuery<ParseObject> teamQuery = ParseQuery.getQuery("Team");
teamQuery.whereGreaterThan("winPct", 0.5);
ParseQuery<ParseUser> userQuery = ParseUser.getQuery();
userQuery.whereMatchesKeyInQuery("hometown", "city", teamQuery);
userQuery.findInBackground(new FindCallback<ParseUser>() {
  void done(List<ParseUser> results, ParseException e) {
    // results has the list of users with a hometown team with a winning record
  }
});
```

Conversely, to get objects where a key does not match the value of a key in a set of objects resulting from another query, use `whereDoesNotMatchKeyInQuery`. For example, to find users whose hometown teams have losing records:

```java
ParseQuery<ParseUser> losingUserQuery = ParseUser.getQuery();
losingUserQuery.whereDoesNotMatchKeyInQuery("hometown", "city", teamQuery);
losingUserQuery.findInBackground(new FindCallback<ParseUser>() {
  void done(List<ParseUser> results, ParseException e) {
    // results has the list of users with a hometown team with a losing record
  }
});
```
<p>To filter rows based on <code class="highlighter-rouge">objectId</code>’s from pointers in a second table, you can use dot notation:</p>

```java
ParseQuery<ParseObject> chartersOfTypeX = ParseQuery.getQuery("Charter");
charterOfTypeX.equalTo('type', 'x');

ParseQuery<ParseObject> groupsWithoutCharterX = ParseQuery.getQuery("Group");
groupsWithoutCharterX.doesNotMatchKeyInQuery("objectId", "belongsTo.objectId", chartersOfTypeX);
groupsWithoutCharterX.findInBackground(new FindCallback<ParseObject>() {
  void done(List<ParseObject> results, ParseException e) {
   // results has the list of groups without charter x
 });
```

You can restrict the fields returned by calling `selectKeys` with a collection of keys. To retrieve documents that contain only the `score` and `playerName` fields (and also special built-in fields such as `objectId`, `createdAt`, and `updatedAt`):

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");
query.selectKeys(Arrays.asList("playerName", "score"));;
List<ParseObject> results = query.find();
```

The remaining fields can be fetched later by calling one of the `fetchIfNeeded` variants on the returned objects:

```java
ParseObject object = results.get(0);
object.fetchIfNeededInBackground(new GetCallback<ParseObject>() {
  public void done(ParseObject object, ParseException e) {
    // all fields of the object will now be available here.
  }
});
```

## Queries on Array Values

If a key contains an array value, you can search for objects where the key's array value contains 2 by:

```java
// Find objects where the array in arrayKey contains the number 2.
query.whereEqualTo("arrayKey", 2);
```

You can also search for objects where the key's array value contains each of the values 2, 3, and 4 with the following:

```java
// Find objects where the array in arrayKey contains all of the numbers 2, 3, and 4.
ArrayList<Integer> numbers = new ArrayList<Integer>();
numbers.add(2);
numbers.add(3);
numbers.add(4);
query.whereContainsAll("arrayKey", numbers);
```

## Queries on String Values

Use `whereStartsWith` to restrict to string values that start with a particular string. Similar to a MySQL LIKE operator, this is indexed so it is efficient for large datasets:

```java
// Finds barbecue sauces that start with 'Big Daddy's'.
ParseQuery<ParseObject> query = ParseQuery.getQuery("BarbecueSauce");
query.whereStartsWith("name", "Big Daddy's");
```

The above example will match any `BarbecueSauce` objects where the value in the "name" String key starts with "Big Daddy's". For example, both "Big Daddy's" and "Big Daddy's BBQ" will match, but "big daddy's" or "BBQ Sauce: Big Daddy's" will not.

Queries that have regular expression constraints are very expensive. Refer to the [Performance Guide](#regular-expressions) for more details.

### Full Text Search

You can use `whereFullText` for efficient search capabilities. Text indexes are automatically created for you. Your strings are turned into tokens for fast searching.

* Note: Full Text Search can be resource intensive. Ensure the cost of using indexes is worth the benefit, see [storage requirements & performance costs of text indexes.](https://docs.mongodb.com/manual/core/index-text/#storage-requirements-and-performance-costs).

* Requires Parse Server 2.5.0+

```java
// Finds barbecue sauces that start with 'Big Daddy's'.
ParseQuery<ParseObject> query = ParseQuery.getQuery("BarbecueSauce");
query.whereFullText("name", "bbq");
```

The above example will match any `BarbecueSauce` objects where the value in the "name" String key contains "bbq". For example, both "Big Daddy's BBQ", "Big Daddy's bbq" and "Big BBQ Daddy" will match.

```java
// You can sort by weight / rank. orderByAscending() and selectKeys()
ParseQuery<ParseObject> query = ParseQuery.getQuery("BarbecueSauce");
query.whereFullText("name", "Big Daddy's");
query.orderByAscending("$score");
query.selectKeys(Arrays.asList("$score"));
// results will contain $score, results[0].getInt("$score");
List<ParseObject> results = query.find();
```


For Case or Diacritic Sensitive search, please use the [REST API](http://docs.parseplatform.org/rest/guide/#queries-on-string-values).


## Relational Queries

There are several ways to issue queries for relational data. If you want to retrieve objects where a field matches a particular `ParseObject`, you can use `whereEqualTo` just like for other data types. For example, if each `Comment` has a `Post` object in its `post` field, you can fetch comments for a particular `Post`:

```java
// Assume ParseObject myPost was previously created.
ParseQuery<ParseObject> query = ParseQuery.getQuery("Comment");
query.whereEqualTo("post", myPost);

query.findInBackground(new FindCallback<ParseObject>() {
  public void done(List<ParseObject> commentList, ParseException e) {
    // commentList now has the comments for myPost
  }
});
```

If you want to retrieve objects where a field contains a `ParseObject` that matches a different query, you can use `whereMatchesQuery`. In order to find comments for posts containing images, you can do:

```java
ParseQuery<ParseObject> innerQuery = ParseQuery.getQuery("Post");
innerQuery.whereExists("image");
ParseQuery<ParseObject> query = ParseQuery.getQuery("Comment");
query.whereMatchesQuery("post", innerQuery);
query.findInBackground(new FindCallback<ParseObject>() {
  public void done(List<ParseObject> commentList, ParseException e) {
    // comments now contains the comments for posts with images.
  }
});
```

If you want to retrieve objects where a field contains a `ParseObject` that does not match a different query, you can use `whereDoesNotMatchQuery`. In order to find comments for posts without images, you can do:

```java
ParseQuery<ParseObject> innerQuery = ParseQuery.getQuery("Post");
innerQuery.whereExists("image");
ParseQuery<ParseObject> query = ParseQuery.getQuery("Comment");
query.whereDoesNotMatchQuery("post", innerQuery);
query.findInBackground(new FindCallback<ParseObject>() {
  public void done(List<ParseObject> commentList, ParseException e) {
    // comments now contains the comments for posts without images.
  }
});
```

In some situations, you want to return multiple types of related objects in one query. You can do this with the `include` method. For example, let's say you are retrieving the last ten comments, and you want to retrieve their related posts at the same time:

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("Comment");

// Retrieve the most recent ones
query.orderByDescending("createdAt");

// Only retrieve the last ten
query.setLimit(10);

// Include the post data with each comment
query.include("post");

query.findInBackground(new FindCallback<ParseObject>() {
  public void done(List<ParseObject> commentList, ParseException e) {
    // commentList now contains the last ten comments, and the "post"
    // field has been populated. For example:
    for (ParseObject comment : commentList) {
      // This does not require a network access.
      ParseObject post = comment.getParseObject("post");
      Log.d("post", "retrieved a related post");
    }
  }
});
```

You can also do multi level includes using dot notation.  If you wanted to include the post for a comment and the post's author as well you can do:

```java
query.include("post.author");
```

You can issue a query with multiple fields included by calling `include` multiple times. This functionality also works with ParseQuery helpers like `getFirst()` and `getInBackground()`.

## Using the Local Datastore

If you have enabled the local datastore by calling `Parse.enableLocalDatastore()` before your call to `Parse.initialize()`, then you can also query against the objects stored locally on the device. To do this, call the `fromLocalDatastore` method on the query.

```java
query.fromLocalDatastore();
query.findInBackground(new FindCallback<ParseObject>() {
  public void done(final List<ParseObject> scoreList, ParseException e) {
    if (e == null) {
      // Results were successfully found from the local datastore.
    } else {
      // There was an error.
    }
  }
});
```

You can query from the local datastore using exactly the same kinds of queries you use over the network. The results will include every object that matches the query that's been pinned to your device. The query even takes into account any changes you've made to the object that haven't yet been saved to the cloud. For example, if you call `deleteEventually`, on an object, it will no longer be returned from these queries.

## Caching Queries

### With Local Datastore enabled

It's often useful to cache the result of a query on a device. This lets you show data when the user's device is offline, or when the app has just started and network requests have not yet had time to complete. The easiest way to do this is with the local datastore. When you pin objects, you can attach a label to the pin, which lets you manage a group of objects together. For example, to cache the results of the query above, you can call `pinAllInBackground` and give it a label.

```java
final String TOP_SCORES_LABEL = "topScores";

// Query for the latest objects from Parse.
query.findInBackground(new FindCallback<ParseObject>() {
  public void done(final List<ParseObject> scoreList, ParseException e) {
    if (e != null) {
      // There was an error or the network wasn't available.
      return;
    }

    // Release any objects previously pinned for this query.
    ParseObject.unpinAllInBackground(TOP_SCORES_LABEL, scoreList, new DeleteCallback() {
      public void done(ParseException e) {
        if (e != null) {
          // There was some error.
          return;
        }

        // Add the latest results for this query to the cache.
        ParseObject.pinAllInBackground(TOP_SCORES_LABEL, scoreList);
      }
    });
  }
});
```

Now when you do any query with `fromLocalDatastore`, these objects will be included in the results if they still match the query. `ParseQuery` lets you choose whether to query the network (`fromNetwork`) or the local datastore (`fromLocalDatastore` or `fromPin(label)` to query just a subset). It is also possible to chain both requests, or execute them in parallel.

For instance, to query the cache first and then the network,

```java
final ParseQuery query = ParseQuery.getQuery("GameScore");
query.fromLocalDatastore().findInBackground().continueWithTask((task) -> {
  // Update UI with results from Local Datastore ...
  ParseException error = task.getError();
  if(error == null){
    List<ParseObject> gameScore = task.getResult();
    for(ParseObject game : gameScore){
        //...
    }
  }
  // Now query the network:
  return query.fromNetwork().findInBackground();
}, Task.UI_EXECUTOR).continueWithTask((task) -> {
  // Update UI with results from Network ...
  ParseException error = task.getError();
  if(error == null){
    List<ParseObject> gameScore = task.getResult();
    for(ParseObject game : gameScore){
        //...
    }
  }
  return task;
}, Task.UI_EXECUTOR);
```

Or you might want to query the cache, and if that fails, fire a network call:

```java
final ParseQuery query = ParseQuery.getQuery("GameScore");
query.fromLocalDatastore().findInBackground().continueWithTask((task) -> {
  Exception error = task.getError();
  if (error instanceof ParseException && ((ParseException) error).getCode() == ParseException.CACHE_MISS) {
    // No results from cache. Let's query the network.
    ParseException error = task.getError();
    if(error == null){
      List<ParseObject> gameScore = task.getResult();
      for(ParseObject game : gameScore){
          //...
      }
    }
    return query.fromNetwork().findInBackground();
  }
  return task;
}).continueWithTask((task) -> {
  // Update UI with results ...
  return task;
}, Task.UI_EXECUTOR);
```

### Without Local Datastore

If you aren't using the local datastore, you can use the per-query cache for `ParseQuery` instead. The default query behavior doesn't use the cache, but you can enable caching with `setCachePolicy`. For example, to try the network and then fall back to cached data if the network is not available:

```java
query.setCachePolicy(ParseQuery.CachePolicy.NETWORK_ELSE_CACHE);
query.findInBackground(new FindCallback<ParseObject>() {
  public void done(List<ParseObject> scoreList, ParseException e) {
    if (e == null) {
      // Results were successfully found, looking first on the
      // network and then on disk.
    } else {
      // The network was inaccessible and we have no cached data
      // for this query.
    }
  }
});
```

Parse provides several different cache policies:

*   `IGNORE_CACHE`: The query does not load from the cache or save results to the cache. `IGNORE_CACHE` is the default cache policy.
*   `CACHE_ONLY`: The query only loads from the cache, ignoring the network. If there are no cached results, that causes a `ParseException`.
*   `NETWORK_ONLY`: The query does not load from the cache, but it will save results to the cache.
*   `CACHE_ELSE_NETWORK`: The query first tries to load from the cache, but if that fails, it loads results from the network. If neither cache nor network succeed, there is a `ParseException`.
*   `NETWORK_ELSE_CACHE`: The query first tries to load from the network, but if that fails, it loads results from the cache. If neither network nor cache succeed, there is a `ParseException`.
*   `CACHE_THEN_NETWORK`: The query first loads from the cache, then loads from the network. In this case, the `FindCallback` will actually be called twice - first with the cached results, then with the network results. This cache policy can only be used asynchronously with `findInBackground`.

If you need to control the cache's behavior, you can use methods provided in ParseQuery to interact with the cache.  You can do the following operations on the cache:

*   Check to see if there is a cached result for the query with:
```java
boolean isInCache = query.hasCachedResult();
```
*   Remove any cached results for a query with:
```java
query.clearCachedResult();
```
*   Remove cached results for all queries with:
```java
ParseQuery.clearAllCachedResults();
```

Query caching also works with ParseQuery helpers including `getFirst()` and `getInBackground()`.

## Counting Objects

Note: In the old Parse hosted backend, count queries were rate limited to a maximum of 160 requests per minute. They also returned inaccurate results for classes with more than 1,000 objects. But, Parse Server has removed both constraints and can count objects well above 1,000.

If you just need to count how many objects match a query, but you do not need to retrieve all the objects that match, you can use `count` instead of `find`. For example, to count how many games have been played by a particular player:

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");
query.whereEqualTo("playerName", "Sean Plott");
query.countInBackground(new CountCallback() {
  public void done(int count, ParseException e) {
    if (e == null) {
      // The count request succeeded. Log the count
      Log.d("score", "Sean has played " + count + " games");
    } else {
      // The request failed
    }
  }
});
```

If you want to block the calling thread, you can also use the synchronous `query.count()` method.

## Compound Queries

If you want to find objects that match one of several queries, you can use `ParseQuery.or` method to construct a query that is an or of the queries passed in.  For instance if you want to find players who either have a lot of wins or a few wins, you can do:

```java
ParseQuery<ParseObject> lotsOfWins = ParseQuery.getQuery("Player");
lotsOfWins.whereGreaterThan(150);

ParseQuery<ParseObject> fewWins = ParseQuery.getQuery("Player");
fewWins.whereLessThan(5);

List<ParseQuery<ParseObject>> queries = new ArrayList<ParseQuery<ParseObject>>();
queries.add(lotsOfWins);
queries.add(fewWins);

ParseQuery<ParseObject> mainQuery = ParseQuery.or(queries);
mainQuery.findInBackground(new FindCallback<ParseObject>() {
  public void done(List<ParseObject> results, ParseException e) {
    // results has the list of players that win a lot or haven't won much.
  }
});
```

You can add additional constraints to the newly created `ParseQuery` that act as an 'and' operator.

Note that we do not, however, support GeoPoint or non-filtering constraints (e.g. `whereNear`, `withinGeoBox`, `setLimit`, `skip`, `orderBy...`, `include`) in the subqueries of the compound query.
