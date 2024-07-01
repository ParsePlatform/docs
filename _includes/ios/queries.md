# Queries

We've already seen how a `PFQuery` with `getObjectInBackgroundWithId:block:` can retrieve a single `PFObject` from Parse. There are many other ways to retrieve data with `PFQuery` - you can retrieve many objects at once, put conditions on the objects you wish to retrieve, cache queries automatically to avoid writing that code yourself, and more.

## Basic Queries

In many cases, `getObjectInBackgroundWithId:block:` isn't powerful enough to specify which objects you want to retrieve. The `PFQuery` offers different ways to retrieve a list of objects rather than just a single object.

The general pattern is to create a `PFQuery`, put conditions on it, and then retrieve a `NSArray` of matching `PFObject`s using either `findObjectsInBackgroundWithBlock:` or `findObjectsInBackgroundWithTarget:selector:`. For example, to retrieve scores with a particular `playerName`, use the `whereKey:equalTo:` method to constrain the value for a key.

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playerName" equalTo:@"Dan Stemkoski"];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // The find succeeded.
    NSLog(@"Successfully retrieved %d scores.", objects.count);
    // Do something with the found objects
    for (PFObject *object in objects) {
        NSLog(@"%@", object.objectId);
    }
  } else {
    // Log details of the failure
    NSLog(@"Error: %@ %@", error, [error userInfo]);
  }
}];
```
```swift
let query = PFQuery(className:"GameScore")
query.whereKey("playerName", equalTo:"Sean Plott")
query.findObjectsInBackground { (objects: [PFObject]?, error: Error?) in
    if let error = error {
        // Log details of the failure
        print(error.localizedDescription)
    } else if let objects = objects {
        // The find succeeded.
        print("Successfully retrieved \(objects.count) scores.")
        // Do something with the found objects
        for object in objects {
            print(object.objectId as Any)
        }
    }
}
```
</div>

Both `findObjectsInBackgroundWithBlock:` and `findObjectsInBackgroundWithTarget:selector:` work similarly in that they assure the network request is done without blocking, and run the block/callback in the main thread. There is a corresponding `findObjects` method that blocks the calling thread, if you are already in a background thread:

<div class="language-toggle" markdown="1">
```objective_c
// Only use this code if you are already running it in a background
// thread, or for testing purposes!

// Using PFQuery
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playerName" equalTo:@"Dan Stemkoski"];
NSArray* scoreArray = [query findObjects];

// Using NSPredicate
NSPredicate *predicate = [NSPredicate predicateWithFormat:@"playerName = 'Dan Stemkosk'"];
PFQuery *query = [PFQuery queryWithClassName:@"GameScore" predicate:predicate];
NSArray* scoreArray = [query findObjects];
```
```swift
// Only use this code if you are already running it in a background
// thread, or for testing purposes!

// Using PFQuery
let query = PFQuery(className: "GameScore")
query.whereKey("playerName", equalTo: "Dan Stemkoski")
let scoreArray = query.findObjects()

// Using NSPredicate
let predicate = NSPredicate(format:"playerName = 'Dan Stemkosk'")
let query = PFQuery(className: "GameScore", predicate: predicate)
let scoreArray = query.findObjects()
```
</div>

## Specifying Constraints with NSPredicate

To get the most out of `PFQuery` we recommend using its methods listed below to add constraints. However, if you prefer using `NSPredicate`, a subset of the constraints can be specified by providing an `NSPredicate` when creating your `PFQuery`.

<div class="language-toggle" markdown="1">
```objective_c
NSPredicate *predicate = [NSPredicate predicateWithFormat:@"playerName = 'Dan Stemkosk'"];
PFQuery *query = [PFQuery queryWithClassName:@"GameScore" predicate:predicate];
```
```swift
let predicate = NSPredicate(format: "playerName = 'Dan Stemkosk'")
let query = PFQuery(className: "GameScore", predicate: predicate)
```
</div>

These features are supported:

*   Simple comparisons such as `=`, `!=`, `<`, `>`, `<=`, `>=`, and `BETWEEN` with a key and a constant.
*   Containment predicates, such as `x IN {1, 2, 3}`.
*   Key-existence predicates, such as `x IN SELF`.
*   `BEGINSWITH` expressions.
*   Compound predicates with `AND`, `OR`, and `NOT`.
*   Sub-queries with `"key IN %@", subquery`.

The following types of predicates are **not** supported:

*   Aggregate operations, such as `ANY`, `SOME`, `ALL`, or `NONE`.
*   Regular expressions, such as `LIKE`, `MATCHES`, `CONTAINS`, or `ENDSWITH`.
*   Predicates comparing one key to another.
*   Complex predicates with many `OR`ed clauses.

## Query Constraints

There are several ways to put constraints on the objects found by a `PFQuery`. You can filter out objects with a particular key-value pair with `whereKey:notEqualTo`:

<div class="language-toggle" markdown="1">
```objective_c
// Using PFQuery
[query whereKey:@"playerName" notEqualTo:@"Michael Yabuti"];

// Using NSPredicate
NSPredicate *predicate = [NSPredicate predicateWithFormat:   @"playerName != 'Michael Yabuti'"];
PFQuery *query = [PFQuery queryWithClassName:@"GameScore" predicate:predicate];
```
```swift
// Using PFQuery
query.whereKey("playerName", notEqualTo: "Michael Yabuti")

// Using NSPredicate
let predicate = NSPredicate(format:"playerName != 'Michael Yabuti'")
let query = PFQuery(className: "GameScore", predicate: predicate)
```
</div>

You can give multiple constraints, and objects will only be in the results if they match all of the constraints.  In other words, it's like an AND of constraints.

<div class="language-toggle" markdown="1">
```objective_c
// Using PFQuery
[query whereKey:@"playerName" notEqualTo:@"Michael Yabuti"];
[query whereKey:@"playerAge" greaterThan:@18];

// Using NSPredicate
NSPredicate *predicate = [NSPredicate predicateWithFormat:   @"playerName != 'Michael Yabuti' AND playerAge > 18"];
PFQuery *query = [PFQuery queryWithClassName:@"GameScore" predicate:predicate];
```
```swift
// Using PFQuery
query.whereKey("playerName", notEqualTo: "Michael Yabuti")
query.whereKey("playerAge", greaterThan: 18)

// Using NSPredicate
let predicate = NSPredicate(format:"playerName != 'Michael Yabuti' AND playerAge > 18")
let query = PFQuery(className: "GameScore", predicate: predicate)
```
</div>

You can limit the number of results by setting `limit`. By default, results are limited to 100. In the old Parse hosted backend, the maximum limit was 1,000, but Parse Server removed that constraint:

<div class="language-toggle" markdown="1">
```objective_c
query.limit = 10; // limit to at most 10 results
```
```swift
query.limit = 10 // limit to at most 10 results
```
</div>

If you want exactly one result, a more convenient alternative may be to use `getFirstObject` or `getFirstObjectInBackground` instead of using `findObject`.

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playerEmail" equalTo:@"dstemkoski@example.com"];
[query getFirstObjectInBackgroundWithBlock:^(PFObject *object, NSError *error) {
  if (!object) {
    NSLog(@"The getFirstObject request failed.");
  } else {
    // The find succeeded.
    NSLog(@"Successfully retrieved the object.");
  }
}];
```
```swift
let query = PFQuery(className: "GameScore")
query.whereKey("playerEmail", equalTo: "dstemkoski@example.com")
query.getFirstObjectInBackground { (object: PFObject?, error: Error?) in
    if let error = error {
        // The query failed
        print(error.localizedDescription)
    } else if let object = object {
        // The query succeeded with a matching result
        print(object)
    } else {
        // The query succeeded but no matching result was found
    }
}
```
</div>

You can skip the first results by setting `skip`. In the old Parse hosted backend, the maximum skip value was 10,000, but Parse Server removed that constraint. This can be useful for pagination:

<div class="language-toggle" markdown="1">
```objective_c
query.skip = 10; // skip the first 10 results
```
```swift
query.skip = 10
```
</div>

For sortable types like numbers and strings, you can control the order in which results are returned:

<div class="language-toggle" markdown="1">
```objective_c
// Sorts the results in ascending order by the score field
[query orderByAscending:@"score"];

// Sorts the results in descending order by the score field
[query orderByDescending:@"score"];
```
```swift
// Sorts the results in ascending order by the score field
query.order(byAscending: "score")

// Sorts the results in descending order by the score field
query.order(byDescending: "score")
```
</div>

You can add more sort keys to the query as follows:

<div class="language-toggle" markdown="1">
```objective_c
// Sorts the results in ascending order by the score field if the previous sort keys are equal.
[query addAscendingOrder:@"score"];

// Sorts the results in descending order by the score field if the previous sort keys are equal.
[query addDescendingOrder:@"score"];
```
```swift
// Sorts the results in ascending order by the score field if the previous sort keys are equal.
query.addAscendingOrder("score")

// Sorts the results in descending order by the score field if the previous sort keys are equal.
query.addDescendingOrder("score")
```
</div>

For sortable types, you can also use comparisons in queries:

<div class="language-toggle" markdown="1">
```objective_c
// Restricts to wins < 50
[query whereKey:@"wins" lessThan:@50];
// Or with NSPredicate
NSPredicate *predicate = [NSPredicate predicateWithFormat:@"wins < 50"];
PFQuery *query = [PFQuery queryWithClassName:@"GameScore" predicate:predicate];

// Restricts to wins <= 50
[query whereKey:@"wins" lessThanOrEqualTo:@50];
// Or with NSPredicate
predicate = [NSPredicate predicateWithFormat:@"wins <= 50"];
query = [PFQuery queryWithClassName:@"GameScore" predicate:predicate]

// Restricts to wins > 50
[query whereKey:@"wins" greaterThan:@50];
// Or with NSPredicate
predicate = [NSPredicate predicateWithFormat:@"wins > 50"];
query = [PFQuery queryWithClassName:@"GameScore" predicate:predicate];

// Restricts to wins >= 50
[query whereKey:@"wins" greaterThanOrEqualTo:@50];
// Or with NSPredicate
predicate = [NSPredicate predicateWithFormat:@"wins >= 50"];
query = [PFQuery queryWithClassName:@"GameScore" predicate:predicate];
```
```swift
// Restricts to wins < 50
query.whereKey("wins", lessThan: 50)
// Or with NSPredicate
let predicate = NSPredicate(format: "wins < 50")
let query = PFQuery(className: "GameScore", predicate: predicate)

// Restricts to wins <= 50
query.whereKey("wins", lessThanOrEqualTo: 50)
// Or with NSPredicate
let predicate = NSPredicate(format: "wins <= 50")
let query = PFQuery(className: "GameScore", predicate: predicate)

// Restricts to wins > 50
query.whereKey("wins", greaterThan: 50)
// Or with NSPredicate
let predicate = NSPredicate(format: "wins > 50")
let query = PFQuery(className: "GameScore", predicate: predicate)

// Restricts to wins >= 50
query.whereKey("wins", greaterThanOrEqualTo: 50)
// Or with NSPredicate
let predicate = NSPredicate(format: "wins >= 50")
let query = PFQuery(className: "GameScore", predicate: predicate)
```
</div>

If you want to retrieve objects matching several different values, you can use `whereKey:containedIn:`, providing an array of acceptable values. This is often useful to replace multiple queries with a single query. For example, if you want to retrieve scores made by any player in a particular list:

<div class="language-toggle" markdown="1">
```objective_c
// Finds scores from any of Jonathan, Dario, or Shawn
// Using PFQuery
NSArray *names = @[@"Jonathan Walsh", @"Dario Wunsch", @"Shawn Simon"];
[query whereKey:@"playerName" containedIn:names];

// Using NSPredicate
NSArray *names = @[@"Jonathan Walsh", @"Dario Wunsch", @"Shawn Simon"];
NSPredicate *pred = [NSPredicate predicateWithFormat: @"playerName IN %@", names];
PFQuery *query = [PFQuery queryWithClassName:@"GameScore" predicate:pred];
```
```swift
// Finds scores from any of Jonathan, Dario, or Shawn
// Using PFQuery
let names = ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"]
query.whereKey("playerName", containedIn: names)

// Using NSPredicate
let names = ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"]
let predicate = NSPredicate(format: "playerName IN %@", names)
let query = PFQuery(className: "GameScore", predicate: predicate)
```
</div>

If you want to retrieve objects that do not match any of several values you can use `whereKey:notContainedIn:`, providing an array of acceptable values. For example, if you want to retrieve scores from players besides those in a list:

<div class="language-toggle" markdown="1">
```objective_c
// Finds scores from anyone who is neither Jonathan, Dario, nor Shawn
// Using PFQuery
NSArray *names = @[@"Jonathan Walsh", @"Dario Wunsch", @"Shawn Simon"];
[query whereKey:@"playerName" notContainedIn:names];

// Using NSPredicate
NSArray *names = @[@"Jonathan Walsh", @"Dario Wunsch", @"Shawn Simon"];
NSPredicate *pred = [NSPredicate predicateWithFormat: @"NOT (playerName IN %@)", names];
PFQuery *query = [PFQuery queryWithClassName:@"GameScore" predicate:pred];
```
```swift
// Finds scores from anyone who is neither Jonathan, Dario, nor Shawn
// Using PFQuery
let names = ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"]
query.whereKey("playerName", notContainedIn: names)

// Using NSPredicate
let names = ["Jonathan Walsh", "Dario Wunsch", "Shawn Simon"]
let predicate = NSPredicate(format: "NOT (playerName IN %@)", names)
let query = PFQuery(className: "GameScore", predicate: predicate)
```
</div>

If you want to retrieve objects that have a particular key set, you can use `whereKeyExists`. Conversely, if you want to retrieve objects without a particular key set, you can use `whereKeyDoesNotExist`.

<div class="language-toggle" markdown="1">
```objective_c
// Finds objects that have the score set
[query whereKeyExists:@"score"];
// Or using NSPredicate
NSPredicate *predicate = [NSPredicate predicateWithFormat:@"score IN SELF"];
PFQuery *query = [PFQuery queryWithClassName:@"GameScore" predicate:predicate];

// Finds objects that don't have the score set
[query whereKeyDoesNotExist:@"score"];
// Or using NSPredicate
NSPredicate *predicate = [NSPredicate predicateWithFormat:@"NOT (score IN SELF)"];
PFQuery *query = [PFQuery queryWithClassName:@"GameScore" predicate:predicate];
```
```swift
// Finds objects that have the score set
query.whereKeyExists("score")
// Or using NSPredicate
let predicate = NSPredicate(format: "score IN SELF")
let query = PFQuery(className: "GameScore", predicate: predicate)

// Finds objects that don't have the score set
query.whereKeyDoesNotExist("score")
// Or using NSPredicate
let predicate = NSPredicate(format: "NOT (score IN SELF)")
let query = PFQuery(className: "GameScore", predicate: predicate)
```
</div>

You can use the `whereKey:matchesKey:inQuery:` method to get objects where a key matches the value of a key in a set of objects resulting from another query.  For example, if you have a class containing sports teams and you store a user's hometown in the user class, you can issue one query to find the list of users whose hometown teams have winning records.  The query would look like:

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *teamQuery = [PFQuery queryWithClassName:@"Team"];
[teamQuery whereKey:@"winPct" greaterThan:@(0.5)];
PFQuery *userQuery = [PFQuery queryForUser];
[userQuery whereKey:@"hometown" matchesKey:@"city" inQuery:teamQuery];
[userQuery findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
    // results will contain users with a hometown team with a winning record
}];
```
```swift
let teamQuery = PFQuery(className:"Team")
teamQuery.whereKey("winPct", greaterThan:0.5)
let userQuery = PFUser.query()
userQuery?.whereKey("hometown", matchesKey: "city", in: teamQuery)
userQuery?.findObjectsInBackground(block: { (results: [PFObject]?, error: Error?) in
    if let error = error {
        // The query failed
        print(error.localizedDescription)
    } else {
        // results will contain users with a hometown team with a winning record
    }
})
```
</div>

Conversely, to get objects where a key does not match the value of a key in a set of objects resulting from another query, use `whereKey:doesNotMatchKey:inQuery:`.  For example, to find users whose hometown teams have losing records:

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *losingUserQuery = [PFQuery queryForUser];
[losingUserQuery whereKey:@"hometown" doesNotMatchKey:@"city" inQuery:teamQuery];
[losingUserQuery findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
    // results will contain users with a hometown team with a losing record
}];
```
```swift
let teamQuery = PFQuery(className:"Team")
teamQuery.whereKey("winPct", greaterThan:0.5)
let losingUserQuery = PFUser.query()
losingUserQuery?.whereKey("hometown", doesNotMatchKey:"city", in: teamQuery)
losingUserQuery?.findObjectsInBackground(block: { (results: [PFObject]?, error: Error?) in
    if let error = error {
        // The query failed
        print(error.localizedDescription)
    } else {
        // results will contain users with a hometown team with a losing records
    }
})
```
</div>

You can restrict the fields returned by calling `selectKeys:` with an `NSArray` of keys. To retrieve documents that contain only the `score` and `playerName` fields (and also special built-in fields such as `objectId`, `createdAt`, and `updatedAt`):

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query selectKeys:@[@"playerName", @"score"]];
[query findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
    // objects in results will only contain the playerName and score fields
}];
```
```swift
let query = PFQuery(className:"GameScore")
query.selectKeys(["playerName", "score"])
query.findObjectsInBackground { (objects: [PFObject]?, error: Error?) in
    if let error = error {
        // The query failed
        print(error.localizedDescription)
    } else {
        // objects in results will only contain the playerName and score fields
    }
}
```
</div>

The remaining fields can be fetched later by calling one of the `fetchIfNeeded` variants on the returned objects:

<div class="language-toggle" markdown="1">
```objective_c
PFObject *object = (PFObject*)results[0];
[object fetchIfNeededInBackgroundWithBlock:^(PFObject *object, NSError *error) {
  // all fields of the object will now be available here.
}];
```
```swift
// Use array of PFObjects from earlier query
var object = objects?[0] as! PFObject
object.fetchInBackground(block: { (object: PFObject?, error: Error?) in
    if let error = error {
        // The request failed
        print(error.localizedDescription)
    } else {
        // all fields of the object will now be available here.
    }
})
```
</div>

## Queries on Array Values

For keys with an array type, you can find objects where the key's array value contains 2 by:

<div class="language-toggle" markdown="1">
```objective_c
// Find objects where the array in arrayKey contains 2.
// Using PFQuery
[query whereKey:@"arrayKey" equalTo:@2];

// Or using NSPredicate
NSPredicate *predicate = [NSPredicate predicateWithFormat:@"2 IN arrayKey"];
PFQuery *query = [PFQuery queryWithClassName:@"MyClass" predicate:predicate];
```
```swift
// Find objects where the array in arrayKey contains 2.
// Using PFQuery
query.whereKey("arrayKey", equalTo: 2)

// Or using NSPredicate
let predicate = NSPredicate(format: "2 IN arrayKey")
let query = PFQuery(className: "MyClass", predicate: predicate)
```
</div>

You can also find objects where the key's array value contains each of the values 2, 3, and 4 with the following:

<div class="language-toggle" markdown="1">
```objective_c
// Find objects where the array in arrayKey contains each of the
// elements 2, 3, and 4.
[query whereKey:@"arrayKey" containsAllObjectsInArray:@[@2, @3, @4]];
```
```swift
// Find objects where the array in arrayKey contains each of the
// elements 2, 3, and 4.
query.whereKey("arrayKey", containsAllObjectsIn:[2, 3, 4])
```
</div>

## Queries on String Values

Use `whereKey:hasPrefix:` to restrict to string values that start with a particular string. Similar to a MySQL LIKE operator, this is indexed so it is efficient for large datasets:

<div class="language-toggle" markdown="1">
```objective_c
// Finds barbecue sauces that start with "Big Daddy".
// Using PFQuery
PFQuery *query = [PFQuery queryWithClassName:@"BarbecueSauce"];
[query whereKey:@"name" hasPrefix:@"Big Daddy's"];

// Using NSPredicate
NSPredicate *pred = [NSPredicate predicateWithFormat:@"name BEGINSWITH 'Big Daddy"];
PFQuery *query = [PFQuery queryWithClassName:@"BarbecueSauce" predicate:pred];
```
```swift
// Finds barbecue sauces that start with "Big Daddy".
// Using PFQuery
let query = PFQuery(className: "BarbecueSauce")
query.whereKey("name", hasPrefix: "Big Daddy's")

// Using NSPredicate
let pred = NSPredicate(format: "name BEGINSWITH 'Big Daddy")
let query = PFQuery(className: "BarbecueSauce", predicate: predicate)
```
</div>

The above example will match any `BarbecueSauce` objects where the value in the "name" String key starts with "Big Daddy's". For example, both "Big Daddy's" and "Big Daddy's BBQ" will match, but "big daddy's" or "BBQ Sauce: Big Daddy's" will not.

Queries that have regular expression constraints are very expensive. Refer to the [Performance Guide](#regular-expressions) for more details.

### Full Text Search

You can use `whereKey:matchesText` for efficient search capabilities. Text indexes are automatically created for you. Your strings are turned into tokens for fast searching.

* Note: Full Text Search can be resource intensive. Ensure the cost of using indexes is worth the benefit, see [storage requirements & performance costs of text indexes.](https://docs.mongodb.com/manual/core/index-text/#storage-requirements-and-performance-costs).

* Requires Parse Server 2.5.0+

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"BarbecueSauce"];
[query whereKey:@"name" matchesText:@"bbq"];
```
```swift
let query = PFQuery(className: "BarbecueSauce")
query.whereKey("name", matchesText: "bbq")
```
</div>

The above example will match any `BarbecueSauce` objects where the value in the "name" String key contains "bbq". For example, both "Big Daddy's BBQ", "Big Daddy's bbq" and "Big BBQ Daddy" will match.

<div class="language-toggle" markdown="1">
```objective_c
// You can sort by weight / rank. orderByAscending and selectKeys
PFQuery *query = [PFQuery queryWithClassName:@"BarbecueSauce"];
[query whereKey:@"name" matchesText:@"bbq"];
[query orderByAscending:@"$score"];
[query selectKeys:@[@"$score"]];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // The find succeeded.
    for (PFObject *object in objects) {
      NSLog(@"Successfully retrieved %d weight / rank.", object[@"$score"]);
    }
  } else {
    // Log details of the failure
    NSLog(@"Error: %@ %@", error, [error userInfo]);
  }
}];
```
```swift
let query = PFQuery(className: "BarbecueSauce")
query.whereKey("name", matchesText: "bbq")
query.order(byAscending: "$score")
query.selectKeys(["$score"])
query.findObjectsInBackground { (objects: [PFObject]?, error: Error?) in
    if let error = error {
        // The request failed
        print(error.localizedDescription)
    } else if let objects = objects {
        objects.forEach { (object) in
            print("Successfully retrieved \(String(describing: object["$score"])) weight / rank.");
        }
    }
}
```
</div>

For Case or Diacritic Sensitive search, please use the [REST API](http://docs.parseplatform.org/rest/guide/#queries-on-string-values).


## Relational Queries

There are several ways to issue queries for relational data. If you want to retrieve objects where a field matches a particular `PFObject`, you can use `whereKey:equalTo:` just like for other data types. For example, if each `Comment` has a `Post` object in its `post` field, you can fetch comments for a particular `Post`:

<div class="language-toggle" markdown="1">
```objective_c
// Assume PFObject *myPost was previously created.
// Using PFQuery
PFQuery *query = [PFQuery queryWithClassName:@"Comment"];
[query whereKey:@"post" equalTo:myPost];

[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments now contains the comments for myPost
}];

// Using NSPredicate
NSPredicate *predicate = [NSPredicate predicateWithFormat:@"post = %@", myPost];
PFQuery *query = [PFQuery queryWithClassName:@"Comment" predicate:predicate];

[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments now contains the comments for myPost
}];
```
```swift
// Assume PFObject *myPost was previously created.
// Using PFQuery
let query = PFQuery(className: "Comment")
query.whereKey("post", equalTo: myPost)
query.findObjectsInBackground { (comments: [PFObject]?, error: Error?) in
    if let error = error {
        // The request failed
        print(error.localizedDescription)
    } else {
        // comments now contains the comments for myPost
    }
}

// Using NSPredicate
let predicate = NSPredicate(format: "post = %@", myPost)
let query = PFQuery(className: "Comment", predicate: predicate)

query.findObjectsInBackground { (comments: [PFObject]?, error: Error?) in
    if let error = error {
        // The request failed
        print(error.localizedDescription)
    } else {
        // comments now contains the comments for myPost
    }
}
```
</div>

You can also do relational queries by `objectId`:

<div class="language-toggle" markdown="1">
```objective_c
// Using PFQuery
[query whereKey:@"post" equalTo:[PFObject objectWithoutDataWithClassName:@"Post" objectId:@"1zEcyElZ80"]];

// Using NSPredicate
[NSPredicate predicateWithFormat:@"post = %@",
    [PFObject objectWithoutDataWithClassName:@"Post" objectId:@"1zEcyElZ80"]];
```
```swift
// Using PFQuery
query.whereKey("post", equalTo: PFObject(withoutDataWithClassName: "Post", objectId: "1zEcyElZ80"))

// Using NSPredicate
NSPredicate(format: "post = %@", PFObject(withoutDataWithClassName: "Post", objectId: "1zEcyElZ80"))
```
</div>

If you want to retrieve objects where a field contains a `PFObject` that match a different query, you can use `whereKey:matchesQuery`. In order to find comments for posts with images, you can do:

<div class="language-toggle" markdown="1">
```objective_c
// Using PFQuery
PFQuery *innerQuery = [PFQuery queryWithClassName:@"Post"];
[innerQuery whereKeyExists:@"image"];
PFQuery *query = [PFQuery queryWithClassName:@"Comment"];
[query whereKey:@"post" matchesQuery:innerQuery];
[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments now contains the comments for posts with images
}];

// Using NSPredicate
NSPredicate *innerPred = [NSPredicate predicateWithFormat:@"image IN SELF"];
PFQuery *innerQuery = [PFQuery queryWithClassName:@"Post" predicate:innerPred];

NSPredicate *pred = [NSPredicate predicateWithFormat:@"post IN %@", innerQuery];
PFQuery *query = [PFQuery queryWithClassName:@"Comment" predicate:pred];

[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments now contains the comments for posts with images
}];
```
```swift
// Using PFQuery
let innerQuery = PFQuery(className: "Post")
innerQuery.whereKeyExists("image")
let query = PFQuery(className: "Comment")
query.whereKey("post", matchesQuery: innerQuery)
query.findObjectsInBackground { (comments: [PFObject]?, error: Error?) in
    if let error = error {
        // The request failed
        print(error.localizedDescription)
    } else {
        // comments now contains the comments for posts with images

    }
}

// Using NSPredicate
let innerPred = NSPredicate(format: "image IN SELF")
let innerQuery = PFQuery(className: "Post", predicate: innerPred)

let pred = NSPredicate(format: "post IN %@", innerQuery)
let query = PFQuery(className: "Comment", predicate: pred)

query.findObjectsInBackground { (comments: [PFObject]?, error: Error?) in
    if let error = error {
        // The request failed
        print(error.localizedDescription)
    } else {
        // comments now contains the comments for posts with images

    }
}
```
</div>

If you want to retrieve objects where a field contains a `PFObject` that does not match a different query, you can use `whereKey:doesNotMatchQuery`.  In order to find comments for posts without images, you can do:

<div class="language-toggle" markdown="1">
```objective_c
// Using PFQuery
PFQuery *innerQuery = [PFQuery queryWithClassName:@"Post"];
[innerQuery whereKeyExists:@"image"];
PFQuery *query = [PFQuery queryWithClassName:@"Comment"];
[query whereKey:@"post" doesNotMatchQuery:innerQuery];
[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments now contains the comments for posts without images
}];

// Using NSPredicate
NSPredicate *innerPred = [NSPredicate predicateWithFormat:@"image IN SELF"];
PFQuery *innerQuery = [PFQuery queryWithClassName:@"Post" predicate:innerPred];

NSPredicate *pred = [NSPredicate predicateWithFormat:@"NOT (post IN %@)", innerQuery];
PFQuery *query = [PFQuery queryWithClassName:@"Comment" predicate:pred];

[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments now contains the comments for posts without images
}];
```
```swift
// Using PFQuery
let innerQuery = PFQuery(className: "Post")
innerQuery.whereKeyExists("image")
let query = PFQuery(className: "Comment")
query.whereKey("post", doesNotMatch: innerQuery)
query.findObjectsInBackground { (comments: [PFObject]?, error: Error?) in
    if let error = error {
        // The request failed
        print(error.localizedDescription)
    } else {
        // comments now contains the comments for posts without images

    }
}

// Using NSPredicate
let innerPred = NSPredicate(format: "image IN SELF")
let innerQuery = PFQuery(className: "Post", predicate: innerPred)

let pred = NSPredicate(format: "NOT (post IN %@)", innerQuery)
let query = PFQuery(className: "Comment", predicate: pred)

query.findObjectsInBackground { (comments: [PFObject]?, error: Error?) in
    if let error = error {
        // The request failed
        print(error.localizedDescription)
    } else {
        // comments now contains the comments for posts without images

    }
}
```
</div>

In some situations, you want to return multiple types of related objects in one query. You can do this with the `includeKey:` method. For example, let's say you are retrieving the last ten comments, and you want to retrieve their related posts at the same time:

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"Comment"];

// Retrieve the most recent ones
[query orderByDescending:@"createdAt"];

// Only retrieve the last ten
query.limit = 10;

// Include the post data with each comment
[query includeKey:@"post"];

[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // Comments now contains the last ten comments, and the "post" field
    // has been populated. For example:
    for (PFObject *comment in comments) {
         // This does not require a network access.
         PFObject *post = comment[@"post"];
         NSLog(@"retrieved related post: %@", post);
    }
}];
```
```swift
let query = PFQuery(className:"Comment")

// Retrieve the most recent ones
query.order(byDescending: "createdAt")

// Only retrieve the last ten
query.limit = 10

// Include the post data with each comment
query.includeKey("post")

query.findObjectsInBackground { (comments: [PFObject]?, error: Error?) in
    if let error = error {
        // The request failed
        print(error.localizedDescription)
    } else if let comments = comments {
        // Comments now contains the last ten comments, and the "post" field
        // has been populated. For example:
        for comment in comments {
            // This does not require a network access.
            let post = comment["post"] as? PFObject
            print("retrieved related post: \(String(describing: post))")
        }

    }
}
```
</div>

You can also do multi level includes using dot notation.  If you wanted to include the post for a comment and the post's author as well you can do:

<div class="language-toggle" markdown="1">
```objective_c
[query includeKey:@"post.author"];
```
```swift
query.includeKey("post.author")
```
</div>

You can issue a query with multiple fields included by calling `includeKey:` multiple times. This functionality also works with PFQuery helpers like `getFirstObject` and `getObjectInBackground`

## Using the Local Datastore

If you have enabled the local datastore by calling `[Parse enableLocalDatastore]` before your call to `[Parse setApplicationId:clientKey:]`, then you can also query against the objects stored locally on the device. To do this, call the `fromLocalDatastore` method on the query.

<div class="language-toggle" markdown="1">
```objective_c
[query fromLocalDatastore];
[[query findObjectsInBackground] continueWithBlock:^id(BFTask *task) {
  if (!task.error) {
    // There was an error.
    return task;
  }

  // Results were successfully found from the local datastore.
  return task;
}];
```
```swift
let query = PFQuery(className:"Comment")
query.fromLocalDatastore()
query.findObjectsInBackground().continueWith { (task: BFTask<NSArray>) -> Any? in
    if task.error != nil {
        // There was an error.
        return task
    }

    // Results were successfully found from the local datastore.

    return task
}
```
</div>

You can query from the local datastore using exactly the same kinds of queries you use over the network. The results will include every object that matches the query that's been pinned to your device. The query even takes into account any changes you've made to the object that haven't yet been saved to the cloud. For example, if you call `deleteEventually`, on an object, it will no longer be returned from these queries.

## Caching Queries

It's often useful to cache the result of a query on disk. This lets you show data when the user's device is offline, or when the app has just started and network requests have not yet had time to complete. Parse takes care of automatically flushing the cache when it takes up too much space.

The default query behavior doesn't use the cache, but you can enable caching by setting `query.cachePolicy`. For example, to try the network and then fall back to cached data if the network is not available:

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
query.cachePolicy = kPFCachePolicyNetworkElseCache;
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // Results were successfully found, looking first on the
    // network and then on disk.
  } else {
    // The network was inaccessible and we have no cached data for
    // this query.
  }
}];
```
```swift
let query = PFQuery(className:"GameScore")
query.cachePolicy = .cacheElseNetwork
query.findObjectsInBackground { (objects: [PFObject]?, error: Error?) in
    if let error = error {
        // The network was inaccessible and we have no cached data for
        // this query.
        print(error.localizedDescription)
    } else {
        // Results were successfully found, looking first on the
        // network and then on disk.
    }
}
```
</div>

Parse provides several different cache policies:

*   `IgnoreCache`: The query does not load from the cache or save results to the cache. `IgnoreCache` is the default cache policy.
*   `CacheOnly`: The query only loads from the cache, ignoring the network. If there are no cached results, that causes a `PFError`.
*   `NetworkOnly`: The query does not load from the cache, but it will save results to the cache.
*   `CacheElseNetwork`: The query first tries to load from the cache, but if that fails, it loads results from the network. If neither cache nor network succeed, there is a `PFError`.
*   `NetworkElseCache`:  The query first tries to load from the network, but if that fails, it loads results from the cache. If neither network nor cache succeed, there is a `PFError`.
*   `CacheThenNetwork`: The query first loads from the cache, then loads from the network. In this case, the callback will actually be called twice - first with the cached results, then with the network results. Since it returns two results at different times, this cache policy cannot be used synchronously with `findObjects`.

If you need to control the cache's behavior, you can use methods provided in PFQuery to interact with the cache.  You can do the following operations on the cache:

*   Check to see if there is a cached result for the query with:
<div class="language-toggle" markdown="1">
```objective_c
BOOL isInCache = [query hasCachedResult];
```
```swift
let isInCache = query.hasCachedResult
```
*   Remove any cached results for a query with:
<div class="language-toggle" markdown="1">
```objective_c
[query clearCachedResult];
```
```swift
query.clearCachedResult()
```
*   Remove cached results for queries with:
<div class="language-toggle" markdown="1">
```objective_c
[PFQuery clearAllCachedResults];
```
```swift
PFQuery.clearAllCachedResults()
```
</div>

Query caching also works with PFQuery helpers including `getFirstObject` and `getObjectInBackground`.

## Counting Objects

Note: In the old Parse hosted backend, count queries were rate limited to a maximum of 160 requests per minute. They also returned inaccurate results for classes with more than 1,000 objects. But, Parse Server has removed both constraints and can count objects well above 1,000.

If you just need to count how many objects match a query, but you do not need to retrieve the objects that match, you can use `countObjects` instead of `findObjects`. For example, to count how many games have been played by a particular player:

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playername" equalTo:@"Sean Plott"];
[query countObjectsInBackgroundWithBlock:^(int count, NSError *error) {
  if (!error) {
    // The count request succeeded. Log the count
    NSLog(@"Sean has played %d games", count);
  } else {
    // The request failed
  }
}];
```
```swift
let query = PFQuery(className:"GameScore")
query.whereKey("playerName", equalTo:"Sean Plott")
query.countObjectsInBackground { (count: Int32, error: Error?) in
    if let error = error {
        // The request failed
        print(error.localizedDescription)
    } else {
        print("Sean has played \(count) games")
    }
}
```
</div>

If you want to block the calling thread, you can also use the synchronous `countObjects` method.

## Compound Queries

If you want to find objects that match one of several queries, you can use `orQueryWithSubqueries:` method.  For instance, if you want to find players with either have a lot of wins or a few wins, you can do:

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *lotsOfWins = [PFQuery queryWithClassName:@"Player"];
[lotsOfWins whereKey:@"wins" greaterThan:@150];

PFQuery *fewWins = [PFQuery queryWithClassName:@"Player"];
[fewWins whereKey:@"wins" lessThan:@5];
PFQuery *query = [PFQuery orQueryWithSubqueries:@[fewWins,lotsOfWins]];
[query findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
  // results contains players with lots of wins or only a few wins.
}];
```
```swift
let lotsOfWins = PFQuery(className:"Player")
lotsOfWins.whereKey("wins", greaterThan:150)

let fewWins = PFQuery(className:"Player")
fewWins.whereKey("wins", lessThan:5)

let query = PFQuery.orQuery(withSubqueries: [lotsOfWins, fewWins])
query.findObjectsInBackground { (results: [PFObject]?, error: Error?) in
    if let error = error {
        // The request failed
        print(error.localizedDescription)
    } else {
        // results contains players with lots of wins or only a few wins.
    }
}
```
</div>

You can add additional constraints to the newly created `PFQuery` that act as an 'and' operator.

Note that we do not, however, support GeoPoint or non-filtering constraints (e.g. `nearGeoPoint`, `withinGeoBox...:`, `limit`, `skip`, `orderBy...:`, `includeKey:`) in the subqueries of the compound query.

## Subclass Queries

You can get a query for objects of a particular subclass using the class method `query`. The following example queries for armors that the user can afford:

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [Armor query];
[query whereKey:@"rupees" lessThanOrEqualTo:[PFUser currentUser][@"rupees"]];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    Armor *firstArmor = [objects firstObject];
    // ...
  }
}];
```
```swift
let query = Armor.query()
query.whereKey("rupees", lessThanOrEqualTo: PFUser.current()?["rupees"] as Any)
query.findObjectsInBackground { (objects: [PFObject]?, error: Error?) in
    if let error = error {
        // The request failed
        print(error.localizedDescription)
    } else if let objects = objects as? [Armor], let firstArmor = objects.first {
       //...
    }
}
```
</div>
