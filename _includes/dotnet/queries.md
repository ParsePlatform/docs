# Queries

We've already seen how a `ParseQuery` with `GetAsync` can retrieve a single `ParseObject` from Parse. There are many other ways to retrieve data with `ParseQuery` - you can retrieve many objects at once, put conditions on the objects you wish to retrieve, and more.

## Basic Queries

In many cases, `GetAsync` isn't powerful enough to specify which objects you want to retrieve. The `ParseQuery` offers different ways to retrieve a list of objects rather than just a single object.

The general pattern is to create a `ParseQuery`, constraints to it, and then retrieve an `IEnumerable` of matching `ParseObjects`s using `FindAsync`. While `ParseQuery` supports a method-based approach for building your query, we highly recommend you use LINQ.  This allows to use the full power of the LINQ C# and Visual Basic language features to create rich queries over your data.

For example, to retrieve scores with a particular `playerName`, use a "where" clause to constrain the value for a key.

```cs
var query = from gameScore in ParseObject.GetQuery("GameScore")
            where gameScore.Get<string>("playerName") == "Dan Stemkoski"
            select gameScore;
IEnumerable<ParseObject> results = await query.FindAsync();

// or using LINQ
var query = ParseObject.GetQuery("GameScore")
    .WhereEqualTo("playerName", "Dan Stemkoski");
IEnumerable<ParseObject> results = await query.FindAsync();
```

## Query Constraints

There are several ways to put constraints on the objects found by a `ParseQuery`. You can filter out objects with a particular key-value pair with a LINQ `where ... != ...` clause or a call to `WhereNotEqualTo`:

```cs
var query = from gameScore in ParseObject.GetQuery("GameScore")
            where gameScore.Get<string>("playerName") != "Michael Yabuti"
            select gameScore;

// or using LINQ
var query = ParseObject.GetQuery("GameScore")
    .WhereNotEqualTo("playerName", "Michael Yabuti");
```

You can give multiple constraints, and objects will only be in the results if they match all of the constraints.  In other words, it's like an AND of constraints.

```cs
// The following queries are equivalent:
var query1 = from gameScore in ParseObject.GetQuery("GameScore")
             where !gameScore.Get<string>("playerName").Equals("Michael Yabuti")
             where gameScore.Get<int>("playerAge") > 18
             select gameScore;

var query2 = from gameScore in ParseObject.GetQuery("GameScore")
             where !gameScore.Get<string>("playerName").Equals("Michael Yabuti")
                 && gameScore.Get<int>("playerAge") > 18
             select gameScore;

// or using LINQ
var query = ParseObject.GetQuery("GameScore")
    .WhereNotEqualTo("playerName", "Michael Yabuti")
    .WhereGreaterThan("playerAge", 18);
```

You can limit the number of results by calling `Limit`. By default, results are limited to 100. In the old Parse hosted backend, the maximum limit was 1,000, but Parse Server removed that constraint:

```cs
query = query.Limit(10); // limit to at most 10 results
```

If you want exactly one result, a more convenient alternative may be to use `FirstAsync` or `FirstOrDefaultAsync` instead of using `FindAsync`.

```cs
var query = from gameScore in ParseObject.GetQuery("GameScore")
            where gameScore.Get<string>("playerEmail") == "dstemkoski@example.com"
            select gameScore;
ParseObject obj = await query.FirstAsync();

// or using LINQ
var query = ParseObject.GetQuery("GameScore")
    .WhereEqualTo("playerEmail", "dstemkoski@example.com");
ParseObject obj = await query.FirstAsync();
```

You can skip the first results by calling `Skip`. In the old Parse hosted backend, the maximum skip value was 10,000, but Parse Server removed that constraint. This can be useful for pagination:

```cs
query = query.Skip(10); // skip the first 10 results
```

For sortable types like numbers and strings, you can control the order in which results are returned:

```cs
// Sorts the results in ascending order by score and descending order by playerName
var query = from gameScore in ParseObject.GetQuery("GameScore")
            orderby gameScore.Get<int>("score") descending, gameScore.Get<string>("playerName")
            select gameScore;

// or using LINQ
// Sorts the results in ascending order by score and descending order by playerName
var query = ParseObject.GetQuery("GameScore")
    .OrderBy("score")
    .ThenByDescending("playerName");
```

For sortable types, you can also use comparisons in queries:

```cs
// Restricts to wins < 50
query = from gameScore in query
        where gameScore.Get<int>("wins") < 50
        select gameScore;

// Restricts to wins <= 50
query = from gameScore in query
        where gameScore.Get<int>("wins") <= 50
        select gameScore;

// Restricts to wins > 50
query = from gameScore in query
        where gameScore.Get<int>("wins") > 50
        select gameScore;

// Restricts to wins >= 50
query = from gameScore in query
        where gameScore.Get<int>("wins") >= 50
        select gameScore;

// or using LINQ
// Restricts to wins < 50
query = query.WhereLessThan("wins", 50);

// Restricts to wins <= 50
query = query.WhereLessThanOrEqualTo("wins", 50);

// Restricts to wins > 50
query = query.WhereGreaterThan("wins", 50);

// Restricts to wins >= 50
query = query.WhereGreaterThanOrEqualTo("wins", 50);
```

If you want to retrieve objects matching several different values, you can use `WhereContainedIn` or a `Contains` LINQ query, providing an list of acceptable values. This is often useful to replace multiple queries with a single query. For example, if you want to retrieve scores made by any player in a particular list:

```cs
// Finds scores from any of Jonathan, Dario, or Shawn
var names = new[] { "Jonathan Walsh", "Dario Wunsch", "Shawn Simon" };
var query = from gameScore in ParseObject.GetQuery("GameScore")
            where names.Contains(gameScore.Get<string>("playerName"))
            select gameScore;

// or using LINQ
// Finds scores from any of Jonathan, Dario, or Shawn
var names = new[] { "Jonathan Walsh", "Dario Wunsch", "Shawn Simon" };
var query = ParseObject.GetQuery("GameScore")
    .WhereContainedIn("playerName", names);
```

If you want to retrieve objects that do not match any of several values you can use `WhereNotContainedIn` or a `!Contains` LINQ query, providing an list of acceptable values. For example, if you want to retrieve scores from players besides those in a list:

```cs
// Finds scores from any of Jonathan, Dario, or Shawn
var names = new[] { "Jonathan Walsh", "Dario Wunsch", "Shawn Simon" };
var query = from gameScore in ParseObject.GetQuery("GameScore")
            where !names.Contains(gameScore.Get<string>("playerName"))
            select gameScore;

// or using LINQ
// Finds scores from any of Jonathan, Dario, or Shawn
var names = new[] { "Jonathan Walsh", "Dario Wunsch", "Shawn Simon" };
var query = ParseObject.GetQuery("GameScore")
    .WhereNotContainedIn("playerName", names);
```

If you want to retrieve objects that have a particular key set, you can use `WhereExists` or an `ContainsKey` LINQ query. Conversely, if you want to retrieve objects without a particular key set, you can use `WhereDoesNotExist` or an `!ContainsKey` LINQ query.

```cs
// Finds objects that have the score set
var query = from gameScore in ParseObject.GetQuery("GameScore")
            where gameScore.ContainsKey("score")
            select gameScore;

// Finds objects that don't have the score set
var query = from gameScore in ParseObject.GetQuery("GameScore")
            where !gameScore[.ContainsKey("score")
            select gameScore;

// or using LINQ
// Finds objects that have the score set
var query = ParseObject.GetQuery("GameScore")
    .WhereExists("score");

// Finds objects that don't have the score set
var query = ParseObject.GetQuery("GameScore")
    .WhereDoesNotExist("score");
```

You can use the `WhereMatchesKeyInQuery` method or a `join` LINQ query to get objects where a key matches the value of a key in a set of objects resulting from another query.  For example, if you have a class containing sports teams and you store a user's hometown in the user class, you can issue one query to find the list of users whose hometown teams have winning records.  The query would look like:

```cs
var teamQuery = from team in ParseObject.GetQuery("Team")
                where team.Get<double>("winPct") > 0.5
                select team;
var userQuery = from user in ParseUser.Query
                join team in teamQuery on user["hometown"] equals team["city"]
                select user;
IEnumerable<ParseUser> results = await userQuery.FindAsync();
// results will contain users with a hometown team with a winning record

// or using LINQ
var teamQuery = ParseQuery.GetQuery("Team")
    .WhereGreaterThan("winPct", 0.5);
var userQuery = ParseUser.Query
    .WhereMatchesKeyInQuery("hometown", "city", teamQuery);
IEnumerable<ParseUser> results = await userQuery.FindAsync();
// results will contain users with a hometown team with a winning record
```

## Queries on List Values

For keys with an array type, you can find objects where the key's array value contains 2 by:

 ```cs
// Find objects where the list in listKey contains 2.
var query = from obj in ParseObject.GetQuery("MyClass")
            where obj.Get<IList<int>>("listKey").Contains(2)
            select obj;

// or using LINQ
// Find objects where the list in listKey contains 2.
var query = ParseObject.GetQuery("MyClass")
    .WhereEqualTo("listKey", 2);
```

## Queries on String Values

Use `WhereStartsWith` or a `StartsWith` LINQ query to restrict to string values that start with a particular string. Similar to a MySQL LIKE operator, this is indexed so it is efficient for large datasets:

```cs
// Finds barbecue sauces that start with "Big Daddy's".
var query = from sauce in ParseObject.GetQuery("BarbecueSauce")
            where sauce.Get<string>("name").StartsWith("Big Daddy's")
            select sauce;

// or using LINQ
// Finds barbecue sauces that start with "Big Daddy's".
var query = ParseObject.GetQuery("BarbecueSauce")
    .WhereStartsWith("name", "Big Daddy's");
```

The above example will match any `BarbecueSauce` objects where the value in the "name" String key starts with "Big Daddy's". For example, both "Big Daddy's" and "Big Daddy's BBQ" will match, but "big daddy's" or "BBQ Sauce: Big Daddy's" will not.

Queries that have regular expression constraints are very expensive. Refer to the [Performance Guide](#regular-expressions) for more details.


## Relational Queries

There are several ways to issue queries for relational data. If you want to retrieve objects where a field matches a particular `ParseObject`, you can use `WhereEqualTo` or a `==` LINQ query just like for other data types. For example, if each `Comment` has a `Post` object in its `post` field, you can fetch comments for a particular `Post`:

```cs
// Assume ParseObject myPost was previously created.
var query = from comment in ParseObject.GetQuery("Comment")
            where comment["post"] == myPost
            select comment;

var comments = await query.FindAsync();
// comments now contains the comments for myPost

// or using LINQ
// Assume ParseObject myPost was previously created.
var query = ParseObject.GetQuery("Comment")
    .WhereEqualTo("post", myPost);

var comments = await query.FindAsync();
//comments now contains the comments for myPost
```

You can also do relational queries by `ObjectId`:

```cs
var query = from comment in ParseObject.GetQuery("Comment")
            where comment["post"] == ParseObject.CreateWithoutData("Post", "1zEcyElZ80")
            select comment;

// or using LINQ
var query = ParseObject.GetQuery("Comment")
    .WhereEqualTo("post", ParseObject.CreateWithoutData("Post", "1zEcyElZ80"));
```

If you want to retrieve objects where a field contains a `ParseObject` that matches a different query, you can use `WhereMatchesQuery` or a `join` LINQ query. In order to find comments for posts with images, you can do:

```cs
var imagePosts = from post in ParseObject.GetQuery("Post")
                 where post.ContainsKey("image")
                 select post;
var query = from comment in ParseObject.GetQuery("Comment")
            join post in imagePosts on comment["post"] equals post
            select comment;

var comments = await query.FindAsync();
// comments now contains the comments for posts with images

// or using LINQ
var imagePosts = ParseObject.GetQuery("Post")
    .WhereExists("image");
var query = ParseObject.GetQuery("Comment")
    .WhereMatchesQuery("post", imagePosts);

var comments = await query.FindAsync();
// comments now contains the comments for posts with images
```

If you want to retrieve objects where a field contains a `ParseObject` that does not match a different query, you can use `WhereDoesNotMatchQuery`.  In order to find comments for posts without images, you can do:

```cs
var imagePosts = from post in ParseObject.GetQuery("Post")
                 where post.ContainsKey("image")
                 select post;
var query = ParseObject.GetQuery("Comment")
    .WhereDoesNotMatchQuery("post", imagePosts);

var comments = await query.FindAsync();
// comments now contains the comments for posts without images

// or using LINQ
var imagePosts = ParseObject.GetQuery("Post")
    .WhereExists("image");
var query = ParseObject.GetQuery("Comment")
    .WhereDoesNotMatchQuery("post", imagePosts);

var comments = await query.FindAsync();
// comments now contains the comments for posts without images
```

In some situations, you want to return multiple types of related objects in one query. You can do this with the `Include` method. For example, let's say you are retrieving the last ten comments, and you want to retrieve their related posts at the same time:

```cs
// Retrieve the most recent comments
var query = from comment in ParseObject.GetQuery("Comment")
                                       // Only retrieve the last 10 comments
                                       .Limit(10)
                                       // Include the post data with each comment
                                       .Include("post")
            orderby comment.CreatedAt descending
            select comment;

var comments = await comments.FindAsync();

// Comments now contains the last ten comments, and the "post" field
// contains an object that has already been fetched.  For example:
foreach (var comment in comments)
{
    // This does not require a network access.
    var post = comment.Get<ParseObject>("post");
    Debug.WriteLine("Post title: " + post["title"]);
}

// or using LINQ
// Retrieve the most recent comments
var query = ParseObject.GetQuery("Comment")
    .OrderByDescending("createdAt")
    .Limit(10) // Only retrieve the last 10 comments
    .Include("post"); // Include the post data with each comment

// Only retrieve the last 10 comments
query = query.Limit(10);

// Include the post data with each comment
query = query.Include("post");

var comments = await comments.FindAsync();

// Comments now contains the last ten comments, and the "post" field
// contains an object that has already been fetched.  For example:
foreach (var comment in comments)
{
    // This does not require a network access.
    var post = comment.Get<ParseObject>("post");
    Debug.WriteLine("Post title: " + post["title"]);
}
```

You can also do multi level includes using dot notation.  If you wanted to include the post for a comment and the post's author as well you can do:

```cs
query = query.Include("post.author");
```

You can issue a query with multiple fields included by calling `Include` multiple times. This functionality also works with `ParseQuery` helpers like `FirstAsync` and `GetAsync`

## Counting Objects

Note: In the old Parse hosted backend, count queries were rate limited to a maximum of 160 requests per minute. They also returned inaccurate results for classes with more than 1,000 objects. But, Parse Server has removed both constraints and can count objects well above 1,000.

If you just need to count how many objects match a query, but you do not need to retrieve the objects that match, you can use `CountAsync` instead of `FindAsync`. For example, to count how many games have been played by a particular player:

```cs
var query = from gameScore in ParseObject.GetQuery("GameScore")
            where gameScore["playerName"] == "Sean Plott"
            select gameScore;
var count = await query.CountAsync();

// or using LINQ
// First set up a callback.
var query = ParseObject.GetQuery("GameScore")
    .WhereEqualTo("playerName", "Sean Plott");
var count = await query.CountAsync();
```

## Compound Queries

If you want to find objects that match one of several queries, you can use the `Or` method.  For instance, if you want to find players with either have a lot of wins or a few wins, you can do:

```cs
var lotsOfWins = from player in ParseObject.GetQuery("Player")
                 where player.Get<int>("wins") > 150
                 select player;

var fewWins = from player in ParseObject.GetQuery("Player")
              where player.Get<int>("wins") < 5
              select player;

ParseQuery<ParseObject> query = lotsOfWins.Or(fewWins);

var results = await query.FindAsync();
// results contains players with lots of wins or only a few wins.

// or using LINQ
var lotsOfWins = ParseObject.GetQuery("Player")
    .WhereGreaterThan("wins", 150);

var fewWins = ParseObject.GetQuery("Player")
    .WhereLessThan("wins", 5);

ParseQuery<ParseObject> query = lotsOfWins.Or(fewWins);
// results contains players with lots of wins or only a few wins.
```

You can add additional constraints to the newly created `ParseQuery` that act as an 'and' operator.

Note that we do not, however, support GeoPoint or non-filtering constraints (e.g. `Near`, `WhereWithinGeoBox`, `Limit`, `Skip`, `OrderBy...`, `Include`) in the subqueries of the compound query.
