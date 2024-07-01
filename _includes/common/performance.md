# Performance

As your app scales, you will want to ensure that it performs well under increased load and usage. This document provides guidelines on how you can optimize your app's performance. While you can use Parse Server for quick prototyping and not worry about performance, you will want to keep our performance guidelines in mind when you're initially designing your app. We strongly advise that you make sure you've followed all suggestions before releasing your app.

You can improve your app's performance by looking at the following:

* Writing efficient queries.
* Writing restrictive queries.
* Using client-side caching.
* Using Cloud Code.
* Avoiding count queries.
* Using efficient search techniques.

Keep in mind that not all suggestions may apply to your app. Let's look into each one of these in more detail.

## Write Efficient Queries

Parse objects are stored in a database. A Parse query retrieves objects that you are interested in based on conditions you apply to the query. To avoid looking through all the data present in a particular Parse class for every query, the database can use an index. An index is a sorted list of items matching a given criteria. Indexes help because they allow the database to do an efficient search and return matching results without looking at all of the data. Indexes are typically smaller in size and available in memory, resulting in faster lookups.

## Indexing

You are responsible for managing your database and maintaining indexes when using Parse Server. If your data is not indexed, every query will have to go through the the entire data for a class to return a query result. On the other hand, if your data is indexed appropriately, the number of documents scanned to return a correct query result should be low.

The order of a query constraint's usefulness is:

* Equal to
* Contained In
* Less than, Less than or Equal to, Greater than, Greater than or Equal to
* Prefix string matches
* Not equal to
* Not contained in
* Everything else

Take a look at the following query to retrieve GameScore objects:

{% if page.language == "js" %}
```javascript
var GameScore = Parse.Object.extend("GameScore");
var query = new Parse.Query(GameScore);
query.equalTo("score", 50);
query.containedIn("playerName",
    ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"]);
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query whereKey:@"score" equalTo:@50];
[query whereKey:@"playerName"
    containedIn:@[@"Jonathan Walsh", @"Dario Wunsch", @"Shawn Simon"]];
```
```swift
let query = PFQuery.queryWithClassName("GameScore")
query.whereKey("score", equalTo: 50)
query.whereKey("playerName", containedIn: ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"])
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");
query.whereEqualTo("score", 50);
query.whereContainedIn("playerName", Arrays.asList("Jonathan Walsh", "Dario Wunsch", "Shawn Simon"));
```
{% endif %}

{% if page.language == "cs" %}
```cs
var names = new[] { "Jonathan Walsh", "Dario Wunsch", "Shawn Simon" };
var query = new ParseObject.GetQuery("GameScore")
    .WhereEqualTo("score", 50)
    .WhereContainedIn("playerName", names);
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query = new ParseQuery("GameScore");

$query->equalTo("score", 50);
$query->containedIn("playerName",
    ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"]);
```
{% endif %}

Creating an index query based on the score field would yield a smaller search space in general than creating one on the `playerName` field.

When examining data types, booleans have a very low entropy and and do not make good indexes. Take the following query constraint:

{% if page.language == "js" %}
```javascript
query.equalTo("cheatMode", false);
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
[query whereKey:@"cheatMode" equalTo:@NO];
```
```swift
query.whereKey("cheatMode", equalTo: false)
```
{% endif %}

{% if page.language == "java" %}
```java
query.whereEqualTo("cheatMode", false);
```
</div>
{% endif %}

{% if page.language == "cs" %}
```cs
query.WhereEqualTo("cheatMode", false);
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query->equalTo("cheatMode", false);
```
{% endif %}

The two possible values for `"cheatMode"` are `true` and `false`. If an index was added on this field it would be of little use because it's likely that 50% of the records will have to be looked at to return query results.

Data types are ranked by their expected entropy of the value space for the key:

* GeoPoints
* Array
* Pointer
* Date
* String
* Number
* Other

Even the best indexing strategy can be defeated by suboptimal queries.

## Efficient Query Design

Writing efficient queries means taking full advantage of indexes. Let's take a look at some query constraints that negate the use of indexes:

* Not Equal To
* Not Contained In

Additionally, the following queries under certain scenarios may result in slow query responses if they can't take advantage of indexes:

* Regular Expressions
* Ordered By

### Not Equal To

For example, let's say you're tracking high scores for a game in a GameScore class. Now say you want to retrieve the scores for all players except a certain one. You could create this query:

{% if page.language == "js" %}
```javascript
var GameScore = Parse.Object.extend("GameScore");
var query = new Parse.Query(GameScore);
query.notEqualTo("playerName", "Michael Yabuti");
query.find().then(function(results) {
  // Retrieved scores successfully
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playerName" notEqualTo:@"Michael Yabuti"];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // Retrieved scores successfully
  }
}];
```
```swift
let query = PFQuery.queryWithClassName("GameScore")
query.whereKey("playerName", notEqualTo: "Michael Yabuti")
query.findObjectsInBackgroundWithBlock {
  (objects, error) in
  if !error {
    // Retrieved scores successfully
  }
}
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");
query.whereNotEqualTo("playerName", "Michael Yabuti");
query.findInBackground(new FindCallback<ParseObject>() {
  @Override
  public void done(List<ParseObject> list, ParseException e) {
    if ( e == null) {
      // Retrieved scores successfully
    }
  }
});
```
{% endif %}

{% if page.language == "cs" %}
```cs
var results = await ParseObject.GetQuery("GameScore")
    .WhereNotEqualTo("playerName", "Michael Yabuti")
    .FindAsync();
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query = new ParseQuery("GameScore");

$query->notEqualTo("playerName", "Michael Yabuti");

$gameScores = $query->find();
// Retrieved game scores
```
{% endif %}

This query can't take advantage of indexes. The database has to look at all the objects in the `"GameScore"` class to satisfy the constraint and retrieve the results. As the number of entries in the class grows, the query takes longer to run.

Luckily, most of the time a “Not Equal To” query condition can be rewritten as a “Contained In” condition. Instead of querying for the absence of values, you ask for values which match the rest of the column values. Doing this allows the database to use an index and your queries will be faster.

For example if the User class has a column called state which has values “SignedUp”, “Verified”, and “Invited”, the slow way to find all users who have used the app at least once would be to run the query:


{% if page.language == "js" %}
```javascript
var query = new Parse.Query(Parse.User);
query.notEqualTo("state", "Invited");
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFUser query];
[query whereKey:@"state" notEqualTo:@"Invited"];
```
```swift
var query = PFUser.query()
query.whereKey("state", notEqualTo: "Invited")
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
ParseQuery<ParseUser> query = ParseQuery.getQuery(ParseUser.class);
query.whereNotEqualTo("state", "Invited");
```
{% endif %}

{% if page.language == "cs" %}
```cs
var query = ParseUser.Query
    .WhereNotEqualTo("state", "Invited");
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query = new ParseQuery("_User");

$query->notEqualTo("state", "Invited");
```
{% endif %}

It would be faster to use the “Contained In” condition when setting up the query:

{% if page.language == "js" %}
```javascript
query.containedIn("state", ["SignedUp", "Verified"]);
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
[query whereKey:@"state"
    containedIn:@[@"SignedUp", @"Verified"]];
```
```swift
query.whereKey("state", containedIn: ["SignedUp", "Verified"])
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
query.whereContainedIn("state", Arrays.asList("SignedUp", "Verified"));
```
{% endif %}

{% if page.language == "cs" %}
```cs
query.WhereContainedIn("state", new[] { "SignedUp", "Verified" });
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query->containedIn("state", ["SignedUp", "Verified"]);
```
{% endif %}

Sometimes, you may have to completely rewrite your query. Going back to the `"GameScore"` example, let's say we were running that query to display players who had scored higher than the given player. We could do this differently, by first getting the given player's high score and then using the following query:

{% if page.language == "js" %}
```javascript
var GameScore = Parse.Object.extend("GameScore");
var query = new Parse.Query(GameScore);
// Previously retrieved highScore for Michael Yabuti
query.greaterThan("score", highScore);
query.find().then(function(results) {
  // Retrieved scores successfully
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
// Previously retrieved highScore for Michael Yabuti
[query whereKey:@"score" greaterThan:highScore];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // Retrieved scores successfully
  }
}];
```
```swift
let query = PFQuery.queryWithClassName("GameScore")
// Previously retrieved highScore for Michael Yabuti
query.whereKey("score", greaterThan: highScore)
query.findObjectsInBackgroundWithBlock {
  (objects, error) in
  if !error {
    // Retrieved scores successfully
  }
}
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");
// Previously retrieved highScore for Michael Yabuti
query.whereGreaterThan("score", highScore);
query.findInBackground(new FindCallback<ParseObject>() {
  @Override
  public void done(List<ParseObject> list, ParseException e) {
    if (e == null) {
      // Retrieved scores successfully
    }
  }
});
```
{% endif %}

{% if page.language == "cs" %}
```cs
// Previously retrieved highScore for Michael Yabuti
var results = await ParseObject.GetQuery("GameScore")
    .WhereGreaterThan("score", highScore)
    .FindAsync();
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query = new ParseQuery("GameScore");

// Previously retrieved highScore for Michael Yabuti
$query->greaterThan("score", $highScore);

$gameScores = $query->find();
// Retrieved game scores
```
{% endif %}

The new query you use depends on your use case. This may sometimes mean a redesign of your data model.

### Not Contained In

Similar to “Not Equal To”, the “Not Contained In” query constraint can't use an index. You should try and use the complementary “Contained In” constraint. Building on the User example, if the state column had one more value, “Blocked”, to represent blocked users, a slow query to find active users would be:

{% if page.language == "js" %}
```javascript
var query = new Parse.Query(Parse.User);
query.notContainedIn("state", ["Invited", "Blocked"]);
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFUser query];
[query whereKey:@"state" notContainedIn:@[@"Invited", @"Blocked"]];
```
```swift
var query = PFUser.query()
query.whereKey("state", notContainedIn: ["Invited", "Blocked"])
```
{% endif %}

{% if page.language == "java" %}
```java
ParseQuery<ParseUser> query = ParseQuery.getQuery(ParseUser.class);
query.whereNotContainedIn("state", Arrays.asList("Invited", "Blocked"));
```
</div>
{% endif %}

{% if page.language == "cs" %}
```cs
var query = ParseUser.Query
    .WhereNotContainedIn("state", new[] { "Invited", "Blocked" });
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query = new ParseQuery("_User");

$query->notContainedIn("state", ["Invited", "Blocked"]);
```
{% endif %}

Using a complimentary “Contained In” query constraint will always be faster:

{% if page.language == "js" %}
```javascript
query.containedIn("state", ["SignedUp", "Verified"]);
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
[query whereKey:@"state" containedIn:@[@"SignedUp", @"Verified"]];
```
```swift
query.whereKey("state", containedIn: ["SignedUp", "Verified"])
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
query.whereContainedIn("state", Arrays.asList("SignedUp", "Verified"));
```
{% endif %}

{% if page.language == "cs" %}
```cs
query.WhereContainedIn("state", new[] { "SignedUp", "Verified"});
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query->containedIn("state", ["SignedUp", "Verified"]);
```
{% endif %}


This means rewriting your queries accordingly. Your query rewrites will depend on your schema set up. It may mean redoing that schema.

### Regular Expressions

Regular expression queries should be avoided due to performance considerations. MongoDB is not efficient for doing partial string matching except for the special case where you only want a prefix match. Queries that have regular expression constraints are therefore very expensive, especially for classes with over 100,000 records. Consider restricting how many such operations can be run on a particular app at any given time.

You should avoid using regular expression constraints that don't use indexes. For example, the following query looks for data with a given string in the `"playerName"` field. The string search is case insensitive and therefore cannot be indexed:

{% if page.language == "js" %}
```javascript
query.matches("playerName", "Michael", "i");
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
[query whereKey:@"playerName" matchesRegex:@"Michael" modifiers:@"i"];
```
```swift
query.whereKey("playerName", matchesRegex: "Michael", modifiers: "i")
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
query.whereMatches("playerName", "Michael", "i");
```
{% endif %}

{% if page.language == "cs" %}
```cs
query.WhereMatches("playerName", "Michael", "i")
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query->matches("playerName", "Michael", "i");
```
{% endif %}

The following query, while case sensitive, looks for any occurrence of the string in the field and cannot be indexed:

{% if page.language == "js" %}
```javascript
query.contains("playerName", "Michael");
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
[query whereKey:@"playerName" containsString:@"Michael"];
```
```swift
query.whereKey("playerName", containsString: "Michael")
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
query.whereContains("playerName", "Michael");
```
{% endif %}

{% if page.language == "cs" %}
```cs
query.WhereContains("playerName", "Michael")
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query->contains("playerName", "Michael");
```
{% endif %}

These queries are both slow. In fact, the `matches` and `contains` query constraints are not covered in our querying guides on purpose and we do not recommend using them. Depending on your use case, you should switch to using the following constraint that uses an index, such as:

{% if page.language == "js" %}
```javascript
query.startsWith("playerName", "Michael");
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
[query whereKey:@"playerName" hasPrefix:@"Michael"];
```
```swift
query.whereKey("playerName", hasPrefix: "Michael")
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
query.whereStartsWith("playerName", "Michael");
```
{% endif %}

{% if page.language == "cs" %}
```cs
query.WhereStartsWith("playerName", "Michael")
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query->startsWith("playerName", "Michael");
```
{% endif %}

This looks for data that starts with the given string. This query will use the backend index, so it will be faster even for large datasets.

As a best practice, when you use regular expression constraints, you'll want to ensure that other constraints in the query reduce the result set to the order of hundreds of objects to make the query efficient. If you must use the `matches` or `contains` constraints for legacy reasons, then use case sensitive, anchored queries where possible, for example:

{% if page.language == "js" %}
```javascript
query.matches("playerName", "^Michael");
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
[query whereKey:@"playerName" matchesRegex:@"^Michael"];
```
```swift
query.whereKey("playerName", matchesRegex: "^Michael")
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
query.whereMatches("playerName", "^Michael");
```
{% endif %}

{% if page.language == "cs" %}
```cs
query.WhereMatches("playerName", "^Michael")
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query->matches("playerName", "^Michael");
```
{% endif %}

Most of the use cases around using regular expressions involve implementing search. A more performant way of implementing search is detailed later.

## Write Restrictive Queries

Writing restrictive queries allows you to return only the data that the client needs. This is critical in a mobile environment were data usage can be limited and network connectivity unreliable. You also want your mobile app to appear responsive and this is directly affected by the objects you send back to the client. The [Querying section](#queries) shows the types of constraints you can add to your existing queries to limit the data returned. When adding constraints, you want to pay attention and design efficient queries.

You can use skip and limit to page through results and load the data as is needed. The query limit is 100 by default:

{% if page.language == "js" %}
```javascript
query.limit(10); // limit to at most 10 results
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
query.limit = 10; // limit to at most 10 results
```
```swift
query.limit = 10 // limit to at most 10 results
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
query.setLimit(10); // limit to at most 10 results
```
{% endif %}

{% if page.language == "cs" %}
```cs
query.Limit(10); // limit to at most 10 results
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query->limit(10); // limit to at most 10 results
```
{% endif %}

If you're issuing queries on GeoPoints, make sure you specify a reasonable radius:

{% if page.language == "js" %}
```javascript
var query = new Parse.Query(PlaceObject);
query.withinMiles("location", userGeoPoint, 10.0);
query.find().then(function(placesObjects) {
  // Get a list of objects within 10 miles of a user's location
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"Place"];
[query whereKey:@"location" nearGeoPoint:userGeoPoint withinMiles:10.0];
[query findObjectsInBackgroundWithBlock:^(NSArray *places, NSError *error) {
  if (!error) {
    // List of objects within 10 miles of a user's location
  }
}];
```
```swift
let query = PFQuery.queryWithClassName("Place")
query.whereKey("location", nearGeoPoint: userGeoPoint, withinMiles: 10.0)
query.findObjectsInBackgroundWithBlock {
  (places, error) in
  if !error {
    // List of places within 10 miles of a user's location
  }
}
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("Place");
query.whereWithinMiles("location", userGeoPoint, 10.0);
query.findInBackground(new FindCallback<ParseObject>() {
  @Override
  public void done(List<ParseObject> list, ParseException e) {
    if (e == null) {
      // List of places within 10 miles of a user's location
    }
  }
});
```
{% endif %}

{% if page.language == "cs" %}
```cs
var results = await ParseObject.GetQuery("GameScore")
    .WhereWithinDistance("location", userGeoPoint, ParseGeoDistance.FromMiles(10.0))
    .FindAsync();
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query = new ParseQuery("Place");

$query->withinMiles("location", $userGeoPoint, 10);

$placeObjects = $query.find();
// Gets an array of objects within 10 miles of a user's location
```
{% endif %}

You can further limit the fields returned by calling select:

{% if page.language == "js" %}
```javascript
var GameScore = Parse.Object.extend("GameScore");
var query = new Parse.Query(GameScore);
query.select("score", "playerName");
query.find().then(function(results) {
  // each of results will only have the selected fields available.
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query selectKeys:@[@"score", @"playerName"]];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // each of results will only have the selected fields available.
  }
}];
```
```swift
let query = PFQuery.queryWithClassName("GameScore")
query.selectKeys(["score", "playerName"])
query.findObjectsInBackgroundWithBlock {
  (objects, error) in
  if !error {
    // each of results will only have the selected fields available.
  }
}
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");
query.selectKeys(Arrays.asList("score", "playerName"));
query.findInBackground(new FindCallback<ParseObject>() {
  @Override
  public void done(List<ParseObject> list, ParseException e) {
    if (e == null) {
      // each of results will only have the selected fields available.
    }
  }
});
```
{% endif %}

{% if page.language == "cs" %}
```cs
var results = await ParseObject.GetQuery("GameScore")
     .Select(new[] { "score", "playerName" })
     .FindAsync();
// each of results will only have the selected fields available.
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query = new ParseQuery("GameScore");

$query->select(["score", "playerName"]);

$results = $query->find();
// each of results will only have the selected fields available.
```
{% endif %}

## Client-side Caching

For queries run from iOS and Android, you can turn on query caching. See the [iOS]({{ site.baseUrl }}/ios/guide/#caching-queries) and [Android]({{ site.baseUrl }}/android/guide/#caching-queries) guides for more details. Caching queries will increase your mobile app's performance especially in cases where you want to display cached data while fetching the latest data from Parse.

{% if page.language == "js" %}

Under the hood, each object field is constructed from two pieces of data: the last-known server value, and any local changes that have not been saved yet. If you `.get()` the attribute value, it will calculate the response by applying the unsaved change to the server data.

If you called `.set()` on a field but did not save it, then calling `.get()` will always return your unsaved value, regardless of how the server data changes underneath.

If this is not a desired behaviour, use `.revert()` to clear unsaved changes applied to the object.

`.revert()` clears any changes to this object made since the last call to save()

```javascript
var GameScore = Parse.Object.extend("GameScore");
var query = new Parse.Query(GameScore);
query.find().then(function(results) {
  // Retrieved scores successfully
  results.forEach(function(result){
    result.revert() //clear all unsaved cchnges
  })
});
```
{% endif %}




## Use Cloud Code

Cloud Code allows you to run custom JavaScript logic on Parse Server instead of on the client.

You can use this to offload processing to the Parse servers thus increasing your app's perceived performance.  You can create hooks that run whenever an object is saved or deleted. This is useful if you want to validate or sanitize your data. You can also use Cloud Code to modify related objects or kick off other processes such as sending off a push notification.

We saw examples of limiting the data returned by writing restrictive queries. You can also use [Cloud Functions]({{ site.baseUrl }}/cloudcode/guide/#cloud-functions) to help limit the amount of data returned to your app. In the following example, we use a Cloud Function to get a movie's average rating:

```javascript
Parse.Cloud.define("averageStars", async (request) => {
  const query = new Parse.Query("Review");
  query.equalTo("movie", request.params.movie);
  const results = await query.find();
  let sum = 0;
  for (let i = 0; i < results.length; ++i) {
    sum += results[i].get("stars");
  }
  return sum / results.length;
});
```

You could have ran a query on the Review class on the client, returned only the stars field data and computed the result on the client. As the number of reviews for a movie increases you can see that the data being returned to the device using this methodology also increases. Implementing the functionality through a Cloud Function returns the one result if successful.

As you look at optimizing your queries, you'll find that you may have to change the queries - sometimes even after you've shipped your app to the App Store or Google Play. The ability to change your queries without a client update is possible if you use [Cloud Functions]({{ site.baseUrl }}/cloudcode/guide/#cloud-functions). Even if you have to redesign your schema, you could make all the changes in your Cloud Functions while keeping the client interface the same to avoid an app update. Take the average stars Cloud Function example from before, calling it from a client SDK would look like this:

{% if page.language == "js" %}
```javascript
Parse.Cloud.run("averageStars", { "movie": "The Matrix" }).then(function(ratings) {
  // ratings is 4.5
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
[PFCloud callFunctionInBackground:@"averageStars"
                  withParameters:@{@"movie": @"The Matrix"}
                           block:^(NSNumber *ratings, NSError *error) {
  if (!error) {
    // ratings is 4.5
  }
}];
```
```swift
PFCloud.callFunctionInBackground("averageStars", withParameters: ["movie": "The Matrix"]) {
  (ratings, error) in
  if !error {
    // ratings is 4.5
  }
}
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
HashMap<String, String> params = new HashMap();
params.put("movie", "The Matrix");
ParseCloud.callFunctionInBackground("averageStars", params, new FunctionCallback<Float>() {
  @Override
  public void done(Float aFloat, ParseException e) {
    if (e == null) {
      // ratings is 4.5
    }
  }
});
```
{% endif %}

{% if page.language == "cs" %}
```cs
IDictionary<string, object> dictionary = new Dictionary<string, object>
{
    { "movie", "The Matrix" }
};

ParseCloud.CallFunctionAsync<float>("averageStars", dictionary).ContinueWith(t => {
  var result = t.Result;
  // result is 4.5
});
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$rating = ParseCloud::run("averageStars", ["movie" => "The Matrix" ]);
// rating is 4.5
```
{% endif %}

If later on, you need to modify the underlying data model, your client call can remain the same, as long as you return back a number that represents the ratings result.

## Avoid Count Operations

When counting objects frequently, instead consider storing a count variable in the database that is incremented each time an object is added. Then, the count can quickly be retrieved by simply retrieving the variable stored.

Suppose you are displaying movie information in your app and your data model consists of a Movie class and a Review class that contains a pointer to the corresponding movie. You might want to display the review count for each movie on the top-level navigation screen using a query like this:

{% if page.language == "js" %}
```javascript
var Review = Parse.Object.extend("Review");
var query = new Parse.Query("Review");
query.equalTo("movie", movie);
query.count().then(function(count) {
  // Request succeeded
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"Review"];
[query whereKey:@"movie" equalTo:movie];
[query countObjectsInBackgroundWithBlock:^(int number, NSError *error) {
  if (!error) {
    // Request succeeded
  }
}];
```
```swift
let query = PFQuery.queryWithClassName("Review")
query.whereKey("movie", equalTo: movie)
query.countObjectsInBackgroundWithBlock {
  (number, error) in
  if !error {
    // Request succeeded
  }
}
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("Review");
// movieId corresponds to a given movie's id
query.whereEqualTo("movie", movieId);
query.countInBackground(new CountCallback() {
  @Override
  public void done(int i, ParseException e) {
    if ( e == null) {
      // Request succeeded
    }
  }
});
```
{% endif %}

{% if page.language == "cs" %}
```cs
var count = await ParseObject.GetQuery("Review")
// movieId corresponds to a given movie's id
    .WhereEqualTo("movie", movieId)
    .CountAsync();
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query = new ParseQuery("Review");

// $movieId corresponds to a given movie's id
$query->equalTo("movie", $movieId);

$count = $query.count();
```
{% endif %}

If you run the count query for each of the UI elements, they will not run efficiently on large data sets. One approach to avoid using the `count()` operator could be to add a field to the Movie class that represents the review count for that movie. When saving an entry to the Review class you could increment the corresponding movie's review count field. This can be done in an `afterSave` handler:

```javascript
Parse.Cloud.afterSave("Review", function(request) {
  // Get the movie id for the Review
  var movieId = request.object.get("movie").id;
  // Query the Movie represented by this review
  var Movie = Parse.Object.extend("Movie");
  var query = new Parse.Query(Movie);
  query.get(movieId).then(function(movie) {
    // Increment the reviews field on the Movie object
    movie.increment("reviews");
    movie.save();
  }, function(error) {
    throw "Got an error " + error.code + " : " + error.message;
  });
});
```

Your new optimized query would not need to look at the Review class to get the review count:


{% if page.language == "js" %}
```javascript
var Movie = Parse.Object.extend("Movie");
var query = new Parse.Query(Movie);
query.find().then(function(results) {
  // Results include the reviews count field
}, function(error) {
  // Request failed
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"Movie"];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // Results include the reviews count field
  }
}];
```
```swift
let query = PFQuery.queryWithClassName("Movie")
query.findObjectsInBackgroundWithBlock {
  (objects, error) in
  if !error {
    // Results include the reviews count field
  }
}
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("Movie");
query.findInBackground(new FindCallback<ParseObject>() {
  @Override
  public void done(List<ParseObject> list, ParseException e) {
    if (e == null) {
      // Results include the reviews count field
    }
  }
});
```
{% endif %}

{% if page.language == "cs" %}
```cs
var results = await ParseObject.GetQuery("Movie")
    .FindAsync();
// Results include the reviews count field
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query = new ParseQuery("Movie");

$results = $query.find();
// Results include the reviews count field
```
{% endif %}

You could also use a separate Parse Object to keep track of counts for each review. Whenever a review gets added or deleted, you can increment or decrement the counts in an `afterSave` or `afterDelete` Cloud Code handler. The approach you choose depends on your use case.

## Implement Efficient Searches

As mentioned previously, MongoDB is not efficient for doing partial string matching. However, this is an important use case when implementing search functionality that scales well in production.

Simplistic search algorithms simply scan through all the class data and executes the query on each entry. The key to making searches run efficiently is to minimize the number of data that has to be examined when executing each query by using an index as we've outlined earlier. You’ll need to build your data model in a way that it’s easy for us to build an index for the data you want to be searchable. For example, string matching queries that don’t match an exact prefix of the string won’t be able to use an index leading to timeout errors as the data set grows.

Let's walk through an example of how you could build an efficient search. You can apply the concepts you learn in this example to your use case. Say your app has users making posts, and you want to be able to search those posts for hashtags or particular keywords. You’ll want to pre-process your posts and save the list of hashtags and words into array fields. You can do this processing either in your app before saving the posts, or you can use a Cloud Code `beforeSave` hook to do this on the fly:

```javascript
var _ = require("underscore");
Parse.Cloud.beforeSave("Post", request => {
  var post = request.object;
  var toLowerCase = function(w) { return w.toLowerCase(); };
  var words = post.get("text").split(/\b/);
  words = _.map(words, toLowerCase);
  var stopWords = ["the", "in", "and"]
  words = _.filter(words, function(w) {
    return w.match(/^\w+$/) && !   _.contains(stopWords, w);
  });
  var hashtags = post.get("text").match(/#.+?\b/g);
  hashtags = _.map(hashtags, toLowerCase);
  post.set("words", words);
  post.set("hashtags", hashtags);
});
```

This saves your words and hashtags in array fields, which MongoDB will store with a multi-key index. There are some important things to notice about this. First of all it’s converting all words to lower case so that we can look them up with lower case queries, and get case insensitive matching. Secondly, it’s filtering out common words like ‘the’, ‘in’, and ‘and’ which will occur in a lot of posts, to additionally reduce useless scanning of the index when executing the queries.

Once you've got the keywords set up, you can efficiently look them up using “All” constraint on your query:

{% if page.language == "js" %}
```javascript
var Post = Parse.Object.extend("Post");
var query = new Parse.Query(Post);
query.containsAll("hashtags", ["#parse", "#ftw"]);
query.find().then(function(results) {
  // Request succeeded
}, function(error) {
  // Request failed
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"Post"];
[query whereKey:@"hashtags" containsAllObjectsInArray:@[@"#parse", @"#ftw"]];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // Request succeeded
  }
}];
```
```swift
let query = PFQuery.queryWithClassName("Post")
query.whereKey("hashtags", containsAllObjectsInArray: ["#parse", "#ftw"])
query.findObjectsInBackgroundWithBlock {
  (objects, error) in
  if !error {
    // Request succeeded
  }
}
```
</div>
{% endif %}

{% if page.language == "java" %}
```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("Post");
query.whereContainsAll("hashtags", Arrays.asList("#parse", "#ftw"));
query.findInBackground(new FindCallback<ParseObject>() {
  @Override
  public void done(List<ParseObject> list, ParseException e) {
    if (e == null) {
      // Request succeeded
    }
  }
});
```
{% endif %}

{% if page.language == "cs" %}
```cs
var results = await ParseObject.GetQuery("Post")
    .WhereContainsAll("hashtags", new[] { "#parse", "#ftw" })
    .FindAsync();
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

{% if page.language == "php" %}
```php
$query = new ParseQuery("Post");

$query->containsAll("hashtags", ["#parse", "#ftw"]);

$posts = $query->find();
// posts containing all the given hash tags
```
{% endif %}

## Limits and Other Considerations

There are some limits in place to ensure the API can provide the data you need in a performant manner. We may adjust these in the future. Please take a moment to read through the following list:

**Objects**
* We recommend against storing large pieces of binary data like images or documents in a Parse Object.
* We recommend against creating more than 64 fields on a single Parse Object to ensure that we can build effective indexes for your queries.
* We recommend against using field names that are longer than 1,024 characters, otherwise an index for the field will not be created.

**Queries**

* Queries return 100 objects by default. Use the `limit` parameter to change this.
* Skips and limits can only be used on the outer query.
* Constraints that collide with each other will result in only one of the constraints being applied. An example of this would be two `equalTo` constraints over the same key with two different values, which contradicts itself (perhaps you're looking for 'contains').
* No geo-queries inside compound OR queries.
* Using `$exists: false` is not advised.
* The `each` query method in the JavaScript SDK cannot be used in conjunction with queries using geo-point constraints.
* A `containsAll` query constraint can only take up to 9 items in the comparison array.

**Push Notifications**

* [Delivery of notifications is a “best effort”, not guaranteed](https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/APNSOverview.html#//apple_ref/doc/uid/TP40008194-CH8-SW1). It is not intended to deliver data to your app, only to notify the user that there is new data available.

**Cloud Code**

* The `params` payload that is passed to a Cloud Function is limited to 50 MB.
