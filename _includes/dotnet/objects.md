# Objects

## The ParseObject

Storing data on Parse is built around the `ParseObject`. Each `ParseObject` contains key-value pairs of JSON-compatible data. This data is schemaless, which means that you don't need to specify ahead of time what keys exist on each `ParseObject`. You simply set whatever key-value pairs you want, and our backend will store it.

For example, let's say you're tracking high scores for a game. A single `ParseObject` could contain:

```javascript
score: 1337, playerName: "Sean Plott", cheatMode: false
```

Keys must start with a letter, and can contain alphanumeric characters and underscores. Values can be strings, numbers, booleans, or even arrays and dictionaries - anything that can be JSON-encoded.

Each `ParseObject` has a class name that you can use to distinguish different sorts of data. For example, we could call the high score object a `GameScore`. We recommend that you NameYourClassesLikeThis and nameYourKeysLikeThis, just to keep your code looking pretty.


## Saving Objects

Let's say you want to save the `GameScore` described above to your Parse Server. The interface is similar to an `IDictionary<string, object>`, plus the `SaveAsync` method:

```cs
ParseObject gameScore = new ParseObject("GameScore");
gameScore["score"] = 1337;
gameScore["playerName"] = "Sean Plott";
await gameScore.SaveAsync();
```

After this code runs, you will probably be wondering if anything really happened. To make sure the data was saved, you can look at the Data Browser in your app on Parse. You should see something like this:

```jsonc
{
  "objectId": "xWMyZ4YEGZ",
  "score": 1337,
  "playerName": "Sean Plott",
  "cheatMode": false,
  "createdAt":"2022-01-01T12:23:45.678Z",
  "updatedAt":"2022-01-01T12:23:45.678Z"
}
```

There are two things to note here. You didn't have to configure or set up a new Class called `GameScore` before running this code. Your Parse app lazily creates this Class for you when it first encounters it.

There are also a few fields you don't need to specify that are provided as a convenience. `ObjectId` is a unique identifier for each saved object. `CreatedAt` and `UpdatedAt` represent the time that each object was created and last modified in your Parse Server. Each of these fields is filled in by Parse, so they don't exist on a `ParseObject` until a save operation has completed.

## Data Types

So far we've used values with type `string` and `int` assigned to fields of a `ParseObject`. Parse also supports `double`, `DateTime`, and `null`. You can also nest `IDictionary<string, T>` and `IList<T>` objects to store more structured data within a single `ParseObject`. Overall, the following types are allowed for each field in your object:

* String => `string`
* Number => primitive numeric values such as `double`s, `long`s, or `float`s
* Bool => `bool`
* Array => objects that implement `IList<T>`
* Object => objects that implement `IDictionary<string, T>`
* Date => `DateTime`
* File => `ParseFile`
* Pointer => other `ParseObject`
* Relation => `ParseRelation`
* Null => `null`

Some examples:

```cs
int number = 42;
string str = "the number is " + number;
DateTime date = DateTime.Now;
IList<object> list = new List<object> { str, number };
IDictionary<string, object> dictionary = new Dictionary<string, object>
{
    { "number", number },
    { "string", str }
};

var bigObject = new ParseObject("BigObject");
bigObject["myNumber"] = number;
bigObject["myString"] = str;
bigObject["myDate"] = date;
bigObject["myList"] = list;
bigObject["myDictionary"] = dictionary;
await bigObject.SaveAsync();
```

We do not recommend storing large pieces of binary data like images or documents on `ParseObject`. We recommend you use `ParseFile`s to store images, documents, and other types of files. You can do so by instantiating a `ParseFile` object and setting it on a field. See [Files](#files) for more details.

For more information about how Parse handles data, check out our documentation on [Data](#data).

## Retrieving Objects

Saving data to the cloud is fun, but it's even more fun to get that data out again. If the `ParseObject` has been uploaded to the server, you can retrieve it with the `ObjectId` using a `ParseQuery`:

```cs
ParseQuery<ParseObject> query = ParseObject.GetQuery("GameScore");
ParseObject gameScore = await query.GetAsync("xWMyZ4YEGZ");
```

To get the values out of the `ParseObject`, use the `Get<T>` method.

```cs
int score = gameScore.Get<int>("score");
string playerName = gameScore.Get<string>("playerName");
bool cheatMode = gameScore.Get<bool>("cheatMode");
```

The four special values are provided as properties:

```cs
string objectId = gameScore.ObjectId;
DateTime? updatedAt = gameScore.UpdatedAt;
DateTime? createdAt = gameScore.CreatedAt;
ParseACL? acl = gameScore.ACL;
```

If you need to get an object's latest data from Parse, you can call the `FetchAsync` method like so:

```cs
await myObject.FetchAsync();
```

## Updating Objects

Updating an object is simple. Just set some new data on it and call one of the save methods. For example:

```cs
// Create the object.
var gameScore = new ParseObject("GameScore")
{
    { "score", 1337 },
    { "playerName", "Sean Plott" },
    { "cheatMode", false },
    { "skills", new List<string> { "pwnage", "flying" } },
};
await gameScore.SaveAsync();

// Now let's update it with some new data.  In this case, only cheatMode
// and score will get sent to the cloud.  playerName hasn't changed.
gameScore["cheatMode"] = true;
gameScore["score"] = 1338;
await gameScore.SaveAsync();
```

The client automatically figures out which data has changed so only "dirty" fields will be sent to Parse. You don't need to worry about squashing data that you didn't intend to update.

### Counters

The above example contains a common use case. The "score" field is a counter that we'll need to continually update with the player's latest score. Using the above method works but it's cumbersome and can lead to problems if you have multiple clients trying to update the same counter.

To help with storing counter-type data, Parse provides methods that atomically increment (or decrement) any number field. So, the same update can be rewritten as:

```cs
gameScore.Increment("score");
await gameScore.SaveAsync();
```

You can also increment by any amount using `Increment(key, amount)`.

### Lists

To help with storing list data, there are three operations that can be used to atomically change a list field:

*   `AddToList` and `AddRangeToList` append the given objects to the end of an list field.
*   `AddUniqueToList` and `AddRangeUniqueToList` add only the given objects which aren't already contained in an list field to that field. The position of the insert is not guaranteed.
*   `RemoveAllFromList` removes all instances of each given object from an array field.

For example, we can add items to the set-like "skills" field like so:

```cs
gameScore.AddRangeUniqueToList("skills", new[] { "flying", "kungfu" });
await gameScore.SaveAsync();
```

Note that it is not currently possible to atomically add and remove items from a list in the same save. You will have to call `save` in between every different kind of list operation.

## Deleting Objects

To delete an object from the cloud:

```cs
await myObject.DeleteAsync();
```

You can delete a single field from an object with the `Remove` method:

```cs
// After this, the playerName field will be empty
myObject.Remove("playerName");

// Saves the field deletion to Parse Server
await myObject.SaveAsync();
```

## Relational Data

Objects can have relationships with other objects. To model one-to-many relationships, any `ParseObject` can be used as a value in other `ParseObject`s. Internally, the Parse framework will store the referred-to object in just one place to maintain consistency.

For example, each `Comment` in a blogging app might correspond to one `Post`. To create a new `Post` with a single `Comment`, you could write:

```cs
// Create the post
var myPost = new ParseObject("Post")
{
    { "title", "I'm Hungry" },
    { "content", "Where should we go for lunch?" }
};

// Create the comment
var myComment = new ParseObject("Comment")
{
    { "content", "Let's do Sushirrito." }
};

// Add a relation between the Post and Comment
myComment["parent"] = myPost;

// This will save both myPost and myComment
await myComment.SaveAsync();
```

You can also link objects using just their `ObjectId`s like so:

```cs
myComment["parent"] = ParseObject.CreateWithoutData("Post", "1zEcyElZ80");
```

By default, when fetching an object, related `ParseObject`s are not fetched.  These objects' values cannot be retrieved until they have been fetched like so:

```cs
ParseObject post = fetchedComment.Get<ParseObject>("parent");
await post.FetchIfNeededAsync();
```

For a many-to-many relationship, use the `ParseRelation` object.  This works similar to a `List<ParseObject>`, except that you don't need to download all the objects in a relation at once.  This allows `ParseRelation` to scale to many more objects than the `List<ParseObject>` approach.  For example, a `ParseUser` may have many `Post`s that they might like.  In this case, you can store the set of `Post`s that a `ParseUser` likes using `GetRelation`.  In order to add a post to the list, the code would look something like:

```cs
var user = ParseUser.CurrentUser;
var relation = user.GetRelation<ParseObject>("likes");
relation.Add(post);
await user.SaveAsync();
```

You can remove a post from the `ParseRelation` with something like:

```cs
relation.Remove(post);
```

By default, the list of objects in this relation are not downloaded.  You can get the list of `Post`s by using calling `FindAsync` on the `ParseQuery` returned by `Query`.  The code would look like:

```cs
IEnumerable<ParseObject> relatedObjects = await relation.Query.FindAsync();
```

If you want only a subset of the `Post`s you can add extra constraints to the `ParseQuery` returned by `Query` like this:

```cs
var query = from post in relation.Query
            where post.CreatedAt > DateTime.Now - TimeSpan.FromDays(10)
                  // alternatively, add any other query constraints
            select post;
var relatedObjects = await query.FindAsync();

// or using LINQ
var query = relation.Query
    .WhereGreaterThan("createdAt", DateTime.Now - TimeSpan.FromDays(10));
    // alternatively, add any other query constraints
var relatedObjects = await query.FindAsync();
```

For more details on `ParseQuery` please look at the [query](#queries) portion of this guide.  A `ParseRelation` behaves similar to a `List<ParseObject>`, so any queries you can do on lists of objects you can do on `ParseRelation`s.

## Subclasses

Parse is designed to get you up and running as quickly as possible. You can access all of your data using the `ParseObject` class and access any field with `Get<T>()`. In mature codebases, subclasses have many advantages, including terseness, extensibility, type-safety, and support for IntelliSense. Subclassing is completely optional, but can transform this code:

```cs
// Using dictionary-initialization syntax:
var shield = new ParseObject("Armor")
{
  { "displayName", "Wooden Shield" },
  { "fireproof", false },
  { "rupees", 50 }
};

// And later:
Console.WriteLine(shield.Get<string>("displayName"));
shield["fireproof"] = true;
shield["rupees"] = 500;
```

Into this:

```cs
// Using object-initialization syntax:
var shield = new Armor
{
  DisplayName = "Wooden Shield",
  IsFireproof = false,
  Rupees = 50
};

// And later:
Console.WriteLine(shield.DisplayName);
shield.IsFireproof = true;
shield.Rupees = 500;
```

### Subclassing ParseObject

To create a `ParseObject` subclass:

1.  Declare a subclass which extends `ParseObject`.
2.  Add a `ParseClassName` attribute. Its value should be the string you would pass into the `ParseObject` constructor, and makes all future class name references unnecessary.
3.  Ensure that your subclass has a public default (i.e. zero-argument) constructor. You must not modify any `ParseObject` fields in this constructor.
4.  Call `ParseObject.RegisterSubclass<YourClass>()` in your code before calling `ParseClient.Initialize()`. The following code sucessfully implements and registers the `Armor` subclass of `ParseObject`:

```cs
// Armor.cs
using Parse;

[ParseClassName("Armor")]
public class Armor : ParseObject
{
}

// App.xaml.cs
using Parse;

public class App : Application
{
  public App()
  {
    ParseObject.RegisterSubclass<Armor>();
    ParseClient.Initialize(ParseApplicationId, ParseWindowsKey);
  }
}
```

### Properties and Methods

Adding methods and properties to your `ParseObject` subclass helps encapsulate logic about the class. You can keep all your logic about a subject in one place rather than using separate classes for business logic and storage/transmission logic.

You can add properties for the fields of your `ParseObject` easily. Declare the getter and setter for the field as you normally would, but implement them in terms of `GetProperty<T>()` and `SetProperty<T>()`. Finally, add a `ParseFieldName` attribute to the property to fully integrate the property with Parse, enabling functionality like LINQ support and automatically raising `INotifyPropertyChanged` notifications. The following example creates a `displayName` field in the `Armor` class:

```cs
// Armor.cs
[ParseClassName("Armor")]
public class Armor : ParseObject
{
  [ParseFieldName("displayName")]
  public string DisplayName
  {
    get { return GetProperty<string>(); }
    set { SetProperty<string>(value); }
  }
}
```

You can now access the displayName field using `armor.DisplayName` and assign to it using `armor.DisplayName = "Wooden Sword"`. This allows your IDE to provide autocompletion as you develop your app and allows typos to be caught at compile-time.

`ParseRelation`-typed properties can also be easily defined using `GetRelationProperty<T>`.  For example:

```cs
// Armor.cs
[ParseClassName("Armor")]
public class Armor : ParseObject
{
  [ParseFieldName("attribute")]
  public ParseRelation<ArmorAttribute> Attributes
  {
    get { return GetRelationProperty<ArmorAttribute>(); }
  }
}
```

If you need more complicated logic than simple field access, you can declare your own methods as well:

```cs
public void TakeDamage(int amount) {
  // Decrease the armor's durability and determine whether it has broken
  this.Increment("durability", -amount);
  if (this.Durability < 0) {
    this.IsBroken = true;
  }
}
```

### Initializing Subclasses

You should create new instances of your subclasses using the constructors you have defined. Your subclass must define a public default constructor that does not modify fields of the `ParseObject`, which will be used throughout the Parse SDK to create strongly-typed instances of your subclass.

To create a reference to an existing object, use `ParseObject.CreateWithoutData<T>()`:

```cs
var armorReference = ParseObject.CreateWithoutData<Armor>(armor.ObjectId);
```

### Queries on Subclasses

You can get a query for objects of a particular subclass using the generic `ParseQuery<T>` class. The following example queries for armors that the user can afford:

```cs
var query = from armor in new ParseQuery<Armor>()
            where armor.Rupees <= ((Player)ParseUser.CurrentUser).Rupees
            select armor;
IEnumerable<Armor> result = await query.FindAsync();

// or using LINQ
var query = new ParseQuery<Armor>()
    .WhereLessThanOrEqualTo("rupees", ((Player)ParseUser.CurrentUser).Rupees);
IEnumerable<Armor> result = await query.FindAsync();
```

Note that the `ParseQuery` LINQ provider understands properties with the `ParseFieldName` attribute, allowing you to use these strongly-typed properties fluently within your LINQ queries.
