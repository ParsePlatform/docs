# Queries

We've already seen how a `ParseQuery` with `get` can retrieve a single `ParseObject` from Parse. There are many other ways to retrieve data with `ParseQuery` - you can retrieve many objects at once, put conditions on the objects you wish to retrieve, and more.

## Basic Queries

In many cases, `get` isn't powerful enough to specify which objects you want to retrieve. `ParseQuery` offers different ways to retrieve an array of objects rather than just a single object.

The general pattern is to create a `ParseQuery`, put conditions on it, and then retrieve an `Array` of matching `ParseObject`s using `find`. For example, to retrieve of the scores with a particular `playerName`, use the `equalTo` method to constrain the value for a key.

```php
$query = new ParseQuery("GameScore");
$query->equalTo("playerName", "Dan Stemkoski");
$results = $query->find();
echo "Successfully retrieved " . count($results) . " scores.";
// Do something with the returned ParseObject values
for ($i = 0; $i < count($results); $i++) {
  $object = $results[$i];
  echo $object->getObjectId() . ' - ' . $object->get('playerName');
}
```

## Query Constraints

### Basics

There are several ways to put constraints on the objects found by a `ParseQuery`. You can filter out objects with a particular key-value pair with `notEqualTo`:

```php
$query->notEqualTo("playerName", "Michael Yabuti");
```

You can give multiple constraints, and objects will only be in the results if they match all of the constraints.  In other words, it's like an AND of constraints.

```php
$query->notEqualTo("playerName", "Michael Yabuti");
$query->greaterThan("playerAge", 18);
```

### Limit

You can limit the number of results by setting `limit`. By default, results are limited to 100. In the old Parse hosted backend, the maximum limit was 1,000, but Parse Server removed that constraint:

```php
$query->limit(10); // limit to at most 10 results
```

### First

If you want exactly one result, a more convenient alternative may be to use `first` instead of using `find`.

```php
$query = new ParseQuery("GameScore");
$query->equalTo("playerEmail", "dstemkoski@example.com");
$object = $query->first();
```

### Skip

You can skip the first results by setting `skip`. In the old Parse hosted backend, the maximum skip value was 10,000, but Parse Server removed that constraint. This can be useful for pagination:

```php
$query->skip(10); // skip the first 10 results
```

### With Count

If you want to know the total number of rows in a table satisfying your query, for  e.g. pagination purposes - you can use `withCount`. 

**Note:** Using this feature will change the structure of response, see the example below.

Let's say you have 200 rows in a table called `GameScore`:

```php
$query = new ParseQuery('GameScore');
$query->withCount();
$query->limit(25);

$response = $query->find();
$response['count'] // Returns 200 the total number of objects dispite limit / skip
$response['results'] // Returns 25 objects

// As of PHP 7.1 you can use Array Destructuring
['count' => $count, 'results' => $results] = $query->find();

// Use $count and $results
```
⚠️ Сount operations can be slow and expensive.

If you only want to get the count without objects - use [Counting Objects](#counting-objects).

### Ascending and Descending

For sortable types like numbers and strings, you can control the order in which results are returned:

```php
// Sorts the results in ascending order by the score field
$query->ascending("score");

// Sorts the results in descending order by the score field
$query->descending("score");
```

### Less than Greater than

For sortable types, you can also use comparisons in queries:

```php
// Restricts to wins < 50
$query->lessThan("wins", 50);

// Restricts to wins <= 50
$query->lessThanOrEqualTo("wins", 50);

// Restricts to wins > 50
$query->greaterThan("wins", 50);

// Restricts to wins >= 50
$query->greaterThanOrEqualTo("wins", 50);
```

### Within Polygon

For sorting by `ParseGeoPoint` you can query for whether an object lies within a polygon of geo points:

```php
// construct 3 geo points
$geoPoint1 = new ParseGeoPoint();
$geoPoint2 = new ParseGeoPoint();
$geoPoint3 = new ParseGeoPoint();

// restrict to any objects where `myGeoPoint` lies within a polygon made by 3 or more geo points
$query->withinPolygon("myGeoPoint", [$geoPoint1, $geoPoint2, $geoPoint3]);
```

### Contained In

If you want to retrieve objects matching several different values, you can use `containedIn`, providing an array of acceptable values. This is often useful to replace multiple queries with a single query. For example, if you want to retrieve scores made by any player in a particular array:

```php
// Finds scores from any of Jonathan, Dario, or Shawn
$query->containedIn("playerName",
                  ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"]);
```

If you want to retrieve objects that do not match any of  several values you can use `notContainedIn`, providing an array of acceptable values.  For example if you want to retrieve scores from players besides those in an array:

```php
// Finds scores from anyone who is neither Jonathan, Dario, nor Shawn
$query->notContainedIn("playerName",
                     ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"]);
```

### Exists

If you want to retrieve objects that have a particular key set, you can use `exists`. Conversely, if you want to retrieve objects without a particular key set, you can use `doesNotExist`.

```php
// Finds objects that have the score set
$query->exists("score");

// Finds objects that don't have the score set
$query->doesNotExist("score");
```

### Matches Key in Query

You can use the `matchesKeyInQuery` method to get objects where a key matches the value of a key in a set of objects resulting from another query.  For example, if you have a class containing sports teams and you store a user's hometown in the user class, you can issue one query to find the array of users whose hometown teams have winning records.  The query would look like:

```php
$teamQuery = new ParseQuery("Team");
$teamQuery->greaterThan("winPct", 0.5);
$userQuery = ParseUser::query();
$userQuery->matchesKeyInQuery("hometown", "city", $teamQuery);
$results = $userQuery->find();
// results has the array of users with a hometown team with a winning record
```

Conversely, to get objects where a key does not match the value of a key in a set of objects resulting from another query, use `doesNotMatchKeyInQuery`. For example, to find users whose hometown teams have losing records:

```php
$losingUserQuery = ParseUser::query();
$losingUserQuery->doesNotMatchKeyInQuery("hometown", "city", teamQuery);
$results = $losingUserQuery->find();
// results has the array of users with a hometown team with a losing record
```

### Select

To filter rows based on `objectId`'s from pointers in a second table, you can use dot notation:

```javascript
$rolesOfTypeX = new ParseQuery('Role');
$rolesOfTypeX->equalTo('type', 'x');

$groupsWithRoleX = new ParseQuery('Group');
$groupsWithRoleX->matchesKeyInQuery('objectId', 'belongsTo.objectId', rolesOfTypeX);
$results = $groupsWithRoleX->find();
// results has the list of groups with role x
```

You can restrict the fields returned by calling `select` with an array of keys. To retrieve documents that contain only the `score` and `playerName` fields (and also special built-in fields such as `objectId`, `createdAt`, and `updatedAt`):

```php
$query = new ParseQuery("GameScore");
$query->select(["score", "playerName"]);
$results = $query->find();
// each of results will only have the selected fields available.
```

The remaining fields can be fetched later by calling `fetch` on the returned objects:

```php
$result = $query->first();
// only the selected fields of the object will now be available here.
$result->fetch();
// all fields of the object will now be available here.
```

### Aggregate

Queries can be made using aggregates, allowing you to retrieve objects over a set of input values. Note that the MasterKey is Required.

For a list of available operators please refer to [Mongo Aggregate Documentation](https://docs.mongodb.com/v3.2/reference/operator/aggregation/).

```php
// group pipeline is similar to distinct, can apply $sum, $avg, $max, $min
// accumulate sum and store in total field
$pipeline = [
    'group' => [
        'objectId' => null,
        'total' => [ '$sum' => '$score']
    ]
];
$results = $query->aggregate($pipeline);

// project pipeline is similar to keys, add or remove existing fields
// includes name key
$pipeline = [
    'project' => [
        'name' => 1
    ]
];
$results = $query->aggregate($pipeline);

// match pipeline is similar to equalTo
// filter out objects with score greater than 15
 $pipeline = [
    'match' => [
        'score' => [ '$gt' => 15 ]
    ]
];
$results = $query->aggregate($pipeline);
```

### Distinct

Queries can be made using distinct, allowing you find unique values for a specified field.
Keep in mind that the MasterKey is required.

```php
// finds score that are unique
$results = $query->distinct('score');

// can be used with equalTo
$query = new ParseQuery('TestObject');
$query->equalTo('name', 'foo');
$results = $query->distinct('score');
```

### Relative Time

Queries can be made using relative time, allowing you to retrieve objects over a varying ranges of relative dates. Keep in mind that all relative queries are performed using the server's time and timezone.

```php
// greater than 2 weeks ago
$query->greaterThanRelativeTime('createdAt', '2 weeks ago');

// less than 1 day in the future
$query->lessThanRelativeTime('updatedAt', 'in 1 day');

// can make queries to very specific points in time
$query->greaterThanOrEqualToRelativeTime('createdAt', '1 year 2 weeks 30 days 2 hours 5 minutes 10 seconds ago');

// can make queries based on right now
// gets everything updated up to this point in time
$query->lessThanOrEqualToRelativeTime('updatedAt', 'now');

// shorthand keywords work as well
$query->greaterThanRelativeTime('date', '1 yr 2 wks 30 d 2 hrs 5 mins 10 secs ago');
```

## Queries on Array Values

For keys with an array type, you can find objects where the key's array value contains 2 by:

```php
// Find objects where the array in arrayKey contains 2.
$query->equalTo("arrayKey", 2);
```

You can also find objects where the key's array value contains each of the elements 2, 3, and 4 with the following:

```php
// Find objects where the array in arrayKey contains all of the elements 2, 3, and 4.
$query->containsAll("arrayKey", [2, 3, 4]);
```

## Queries on String Values

Use `startsWith` to restrict to string values that start with a particular string. Similar to a MySQL LIKE operator, this is indexed so it is efficient for large datasets:

```php
// Finds barbecue sauces that start with "Big Daddy's".
$query = new ParseQuery("BarbecueSauce");
$query->startsWith("name", "Big Daddy's");
```

The above example will match any `BarbecueSauce` objects where the value in the "name" String key starts with "Big Daddy's". For example, both "Big Daddy's" and "Big Daddy's BBQ" will match, but "big daddy's" or "BBQ Sauce: Big Daddy's" will not.

You may also use `endsWith` to restrict to string values that end with a particular string instead:

```php
// Finds barbecue sauces that end with "Sauce".
$query = new ParseQuery("BarbecueSauce");
$query->endsWith("name", "Sauce");
```

The above example will match any `BarbecueSauce` objects where the value in the "name" String key ends with "Sauce". For example, both "Big Daddy's BBQ Sauce" and "Home Style BBQ Sauce" will match, but "Big Daddy's BBQ" or "Best Sauce: Big Daddy's" will not.

Queries that have regular expression constraints are very expensive, especially for classes with over 100,000 records. Parse restricts how many such operations can be run on a particular app at any given time.


## Relational Queries

There are several ways to issue queries for relational data. If you want to retrieve objects where a field matches a particular `ParseObject`, you can use `equalTo` just like for other data types. For example, if each `Comment` has a `Post` object in its `post` field, you can fetch comments for a particular `Post`:

```php
// Assume ParseObject $myPost was previously created.
$query = new ParseQuery("Comment");
$query->equalTo("post", $myPost);
$comments = $query->find();
// comments now contains the comments for myPost
```

If you want to retrieve objects where a field contains a `ParseObject` that matches a different query, you can use `matchesQuery`. In order to find comments for posts containing images, you can do:

```php
$innerQuery = new ParseQuery("Post");
$innerQuery->exists("image");
$query = new ParseQuery("Comment");
$query->matchesQuery("post", $innerQuery);
$comments = $query->find();
// comments now contains the comments for posts with images.
```

If you want to retrieve objects where a field contains a `ParseObject` that does not match a different query, you can use `doesNotMatchQuery`.  In order to find comments for posts without images, you can do:

```php
$innerQuery = new ParseQuery("Post");
$innerQuery->exists("image");
$query = new ParseQuery("Comment");
$query->doesNotMatchQuery("post", $innerQuery);
$query->find();
// comments now contains the comments for posts without images.
```

You can also do relational queries by `objectId`:

```php
$post = new ParseObject("Post", "1zEcyElZ80");
$query->equalTo("post", $post);
```

In some situations, you want to return multiple types of related objects in one query. You can do this with the `include` method. For example, let's say you are retrieving the last ten comments, and you want to retrieve their related posts at the same time:

```php
$query = new ParseQuery("Comment");

// Retrieve the most recent ones
query->descending("createdAt");

// Only retrieve the last ten
query->limit(10);

// Include the post data with each comment
query->includeKey("post");

$comments = query->find();
// Comments now contains the last ten comments, and the "post" field
// has been populated. For example:
for ($i = 0; $i < count($comments); $i++) {
  // This does not require a network access.
  $post = $comments[$i]->get("post");
}
```

You can also do multi level includes using dot notation.  If you wanted to include the post for a comment and the post's author as well you can do:

```php
$query->includeKey("post.author");
```

You can issue a query with multiple fields included by calling `includeKey` multiple times. This functionality also works with ParseQuery helpers like `first` and `get`.

## Counting Objects

Note: In the old Parse hosted backend, count queries were rate limited to a maximum of 160 requests per minute. They also returned inaccurate results for classes with more than 1,000 objects. But, Parse Server has removed both constraints and can count objects well above 1,000.

If you just need to count how many objects match a query, but you do not need to retrieve all the objects that match, you can use `count` instead of `find`. For example, to count how many games have been played by a particular player:

```php
$query = new ParseQuery("GameScore");
$query->equalTo("playerName", "Sean Plott");
$count = $query->count();
// The count request succeeded. Show the count
echo "Sean has played " . $count . " games";
```

## Compound Queries

 If you want to find objects that match one of several queries, you can use `ParseQuery.or` method to construct a query that is an OR of the queries passed in.  For instance if you want to find players who either have a lot of wins or a few wins, you can do:

```php
$lotsOfWins = new ParseQuery("Player");
$lotsOfWins->greaterThan("wins", 150);

$fewWins = new ParseQuery("Player");
$fewWins->lessThan("wins", 5);

$mainQuery = ParseQuery::orQueries([$lotsOfWins, $fewWins]);
$results = $mainQuery->find();
// results contains an array of players that either have won a lot of games or won only a few games.
```

You can add additional constraints to the newly created `ParseQuery` that act as an 'and' operator.

Note that we do not, however, support GeoPoint or non-filtering constraints (e.g. `near`, `withinGeoBox`, `limit`, `skip`, `ascending`/`descending`, `includeKey`) in the subqueries of the compound query.

Each `ParseObject` is an instance of a specific subclass with a class name that you can use to distinguish different sorts of data. For example, we could call the high score object a `GameScore`. We recommend that you NameYourClassesLikeThis and nameYourKeysLikeThis, just to keep your code looking pretty.

To create a new subclass, create a new class which extends the `ParseObject` class, add the `$parseClassName` static property, and call the `registerSubclass` method before use.  Any `ParseQuery` will return instances of the new class for any `ParseObject` with the same class name.

```php
class GameScore extends ParseObject
{
  public static $parseClassName = "GameScore";
}
```

```php
// Do this once, at the start of your app, before ParseClient::initialize(...);
GameScore::registerSubclass();

// Create a new instance of that class.
$gameScore = new GameScore();
```

You can add additional methods and properties to your subclasses of `ParseObject`.

```php
// A complex subclass of ParseObject
class Monster extends ParseObject
{
  public static $parseClassName = "Monster";

  public function hasSuperHumanStrength() {
    return this->get("strength") > 18;
  }

  public static function spawn($strength) {
    $monster = new Monster();
    $monster->set("strength", $strength);
    return $monster;
  }
}
```

```php
$monster = Monster::spawn(200);
echo monster->strength();  // Displays 200.
echo monster->hasSuperHumanStrength();  // Displays true.
```

## Read Preference

When using a MongoDB replica set, you can use the `$query->readPreference(readPreference, includeReadPreference, subqueryReadPreference)` function to choose from which replica the objects will be retrieved. The `includeReadPreference` argument chooses from which replica the included pointers will be retrieved and the `subqueryReadPreference` argument chooses in which replica the subqueries will run. The possible values are `PRIMARY` (default), `PRIMARY_PREFERRED`, `SECONDARY`, `SECONDARY_PREFERRED`, or `NEAREST`. If the `includeReadPreference` argument is not passed, the same replica chosen for `readPreference` will be also used for the includes. The same rule applies for the `subqueryReadPreference` argument.

```javascript
$query->readPreference(
  "SECONDARY",
  "SECONDARY_PREFERRED",
  "NEAREST"
);
```
