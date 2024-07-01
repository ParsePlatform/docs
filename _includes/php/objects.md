# Objects

## ParseObject

Storing data on Parse is built around the `ParseObject`. Each `ParseObject` contains key-value pairs of JSON-compatible data. This data is schemaless, which means that you don't need to specify ahead of time what keys exist on each `ParseObject`. You simply set whatever key-value pairs you want, and our backend will store it.

For example, let's say you're tracking high scores for a game. A single `ParseObject` could contain:

```php
score: 1337, playerName: "Sean Plott", cheatMode: false
```

Keys must be alphanumeric strings. Values can be strings, numbers, booleans, or even sequential arrays and associative arrays - anything that can be JSON-encoded.  Note however that Arrays and Associative Arrays require separate methods to set them on a `ParseObject`.

## Saving Objects

Let's say you want to save the `GameScore` described above to the Parse Cloud. The interface is similar to a our other SDKs, including the `save` method:

```php
$gameScore = new ParseObject("GameScore");

$gameScore->set("score", 1337);
$gameScore->set("playerName", "Sean Plott");
$gameScore->set("cheatMode", false);

try {
  $gameScore->save();
  echo 'New object created with objectId: ' . $gameScore->getObjectId();
} catch (ParseException $ex) {  
  // Execute any logic that should take place if the save fails.
  // error is a ParseException object with an error code and message.
  echo 'Failed to create new object, with error message: ' . $ex->getMessage();
}
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

There are also a few fields you don't need to specify that are provided as a convenience. `objectId` is a unique identifier for each saved object. `createdAt` and `updatedAt` represent the time that each object was created and last modified in the cloud. Each of these fields is filled in by Parse, so they don't exist on a `ParseObject` until a save operation has completed.

## Retrieving Objects

Saving data to the cloud is fun, but it's even more fun to get that data out again. If the `ParseObject` has been uploaded to the server, you can retrieve it with its `objectId` using a `ParseQuery`:

```php
$query = new ParseQuery("GameScore");
try {
  $gameScore = $query->get("xWMyZ4YEGZ");
  // The object was retrieved successfully.
} catch (ParseException $ex) {
  // The object was not retrieved successfully.
  // error is a ParseException with an error code and message.
}
```

To get the values out of the `ParseObject`, use the `get` method.

```php
$score = $gameScore->get("score");
$playerName = $gameScore->get("playerName");
$cheatMode = $gameScore->get("cheatMode");
```

The four special values are provided as the result of methods:

```php
$objectId = $gameScore->getObjectId();
$updatedAt = $gameScore->getUpdatedAt();
$createdAt = $gameScore->getCreatedAt();
$acl = $gameScore->getACL();
```

If you need to refresh an object you already have with the latest data that
    is in the Parse Cloud, you can call the `fetch` method like so:

```php
$gameScore->fetch();
```

If you need to check if an object has been fetched, you can call the `isDataAvailable()` method:

```php
if (!$gameScore->isDataAvailable()) {
  $gameScore->fetch();
}
```

## Updating Objects

Updating an object is simple. Just set some new data on it and call the save method. For example:

```php
// Create the object.
$gameScore = new ParseObject("GameScore");

$gameScore->set("score", 1337);
$gameScore->set("playerName", "Sean Plott");
$gameScore->set("cheatMode", false);
$gameScore->setArray("skills", ["pwnage", "flying"]);

$gameScore->save();
// Now let's update it with some new data. In this case, only cheatMode and score
// will get sent to the cloud. playerName hasn't changed.
$gameScore->set("cheatMode", true);
$gameScore->set("score", 1338);
$gameScore->save();
```

Parse automatically figures out which data has changed so only "dirty" fields will be sent to the Parse Cloud. You don't need to worry about squashing data that you didn't intend to update.

### Counters

The above example contains a common use case. The "score" field is a counter that we'll need to continually update with the player's latest score. Using the above method works but it's cumbersome and can lead to problems if you have multiple clients trying to update the same counter.

To help with storing counter-type data, Parse provides methods that atomically increment (or decrement) any number field. So, the same update can be rewritten as:

```php
$gameScore->increment("score");
$gameScore->save();
```

You can also increment by any amount by passing in a second argument to `increment`. When no amount is specified, 1 is used by default.

### Arrays

To help with storing array data, there are three operations that can be used to atomically change an array associated with a given key:

*   `add` append the given object to the end of an array field.
*   `addUnique` add the given object only if it isn't already contained in an array field. The position of the insert is not guaranteed.
*   `remove` remove all instances of the given object from an array field.

For example, we can add items to the set-like "skills" field like so:

```php
$gameScore->addUnique("skills", ["flying"]);
$gameScore->addUnique("skills", ["kungfu"]);
$gameScore->save();
```

Note that it is not currently possible to atomically add and remove items from an array in the same save.
    You will have to call `save` in between every different kind of array operation.

## Encoding/Decoding

Using version **1.3.0** or later of the php sdk gives you the ability to encode/decode instances of `ParseObject`.
Encoding an object will give you a JSON encoded array that can be later decoded to get the original object back, unsaved changes included.
```php
// create an object
$obj = new ParseObject("YourClass");
$obj->set('info', 'an encodable object');

// encode this object
$encoded = $obj->encode();

// save this encoded object somewhere for later use...

// decode to get our object as it was before,
// unsaved changes included
$decoded = ParseObject::decode($encoded);
```

An object that is encoded can easily be stored away, sent across the wire or even saved as a value under another `ParseObject`.
This can be used to create a snapshot of an object at a point in time (unsaved changes included), allowing you to later go back, decode and inspect that object later on.

## Destroying Objects

To delete an object from the cloud:

```php
$gameScore->destroy();
```

You can delete a single field from an object with the `delete` method:

```php
// After this, the playerName field will be empty
$gameScore->delete("playerName");

// Saves the field deletion to the Parse Cloud
$gameScore->save();
```

## Relational Data

Objects may have relationships with other objects. For example, in a blogging application, a `Post` object may have many `Comment` objects. Parse supports all kind of relationships, including one-to-one, one-to-many, and many-to-many.

### One-to-One and One-to-Many Relationships

One-to-one and one-to-many relationships are modeled by saving a `ParseObject` as a value in the other object. For example, each `Comment` in a blogging app might correspond to one `Post`.

To create a new `Post` with a single `Comment`, you could write:

```php
// Create the post
$myPost = new ParseObject("Post");
$myPost->set("title", "I'm Hungry");
$myPost->set("content", "Where should we go for lunch?");

// Create the comment
$myComment = new ParseObject("Comment");
$myComment->set("content", "Let's do Sushirrito.");

// Add the post as a value in the comment
$myComment->set("parent", $myPost);

// This will save both myPost and myComment
$myComment->save();
```

Internally, the Parse framework will store the referred-to object in just one place, to maintain consistency. You can also link objects using just their `objectId`s like so:

```php
$post = new ParseObject("Post", "1zEcyElZ80");

$myComment->set("parent", $post);
```

By default, when fetching an object, related `ParseObject`s are not fetched.  These objects' values cannot be retrieved until they have been fetched like so:

```php
$post = $fetchedComment->get("parent");
$post->fetch();
$title = $post->get("title");
```

### Many-to-Many Relationships

Many-to-many relationships are modeled using `ParseRelation`. This works similar to storing an array of `ParseObject`s in a key, except that you don't need to fetch all of the objects in a relation at once.  In addition, this allows `ParseRelation` to scale to many more objects than the array of `ParseObject` approach.  For example, a `User` may have many `Posts` that she might like. In this case, you can store the set of `Posts` that a `User` likes using `relation`.  In order to add a `Post` to the "likes" array of the `User`, you can do:

```php
$user = ParseUser::getCurrentUser();
$relation = $user->getRelation("likes");
$relation->add($post);
$user->save();
```

 You can remove a post from a `ParseRelation`:

```php
$relation->remove($post);
$user->save();
```

You can call `add` and `remove` multiple times before calling save:

```php
$relation->remove($post1);
$relation->remove($post2);
$user->save();
```

You can also pass in an array of `ParseObject` to `add` and `remove`:

```php
$relation->add([$post1, $post2, $post3]);
$user->save();
```

By default, the array of objects in this relation are not downloaded.  You can get an array of the posts that a user likes by using the `ParseQuery` returned by `getQuery`.  The code looks like:

```php
$postsLiked = $relation->getQuery()->find();
// $postsLiked contains the posts that the current user likes.
```

If you want only a subset of the Posts, you can add extra constraints to the `ParseQuery` returned by query like this:

```php
$query = $relation->getQuery();
$query->equalTo("title", "I'm Hungry");
$postsLiked = $query->find();
// $postsLiked contains post liked by the current user which have the title "I'm Hungry".
```

For more details on `ParseQuery`, please look at the query portion of this guide. A `ParseRelation` behaves similar to an array of `ParseObject` for querying purposes, so any query you can do on an array of objects, you can do on a `ParseRelation`.


## Data Types

So far we've used values with type `String`, `Integer`, and `ParseObject`. Parse also supports PHP `DateTime`s and `null`. You can nest PHP arrays and associative arrays (JSON Objects) to store more structured data within a single `ParseObject`. Overall, the following types are allowed for each field in your object:

* String => `String`
* Number => `Integer` and `float`
* Bool => `Boolean`
* Array => PHP arrays
* Object => associative arrays (JSON Objects)
* Date => `DateTime`
* File => `ParseFile`
* Pointer => other `ParseObject`
* Relation => `ParseRelation`
* GeoPoint => `ParseGeoPoint`
* Null => `null`

Some examples:

```php
$number = 42;
$string = "the number is " . $number;
$date = new DateTime();
$array = [$string, $number];
$object = ["number" => $number, "string" => $string];
$geoPoint = new ParseGeoPoint(37.75, -122.68); // san fran

$bigObject = new ParseObject("BigObject");
$bigObject->set("myNumber", $number);
$bigObject->set("myString", $string);
$bigObject->set("myDate", $date);
$bigObject->setArray("myArray", $array);
$bigObject->setAssociativeArray("myObject", $object);
$bigObject->set("myGeoPoint", $geoPoint);
$bigObject->set("anyKey", null); // this value can only be saved to an existing key
$bigObject->save();
```

We do not recommend storing large pieces of binary data like images or documents on `ParseObject`. We recommend you use `ParseFile`s to store images, documents, and other types of files. You can do so by instantiating a `ParseFile` object and setting it on a field. See [Files](#files) for more details.

For more information about how Parse handles data, check out our documentation on [Data](#data).

## Subclassing ParseObject

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
    return $this->get("strength") > 18;
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

If you want to override the __construct method, make sure the first three params are exactly as same as the parent ParseObject constructor:

```php
class GameScore extends ParseObject
{
  public static $parseClassName = "GameScore";

  public function __construct($className = null, $objectId = null, $isPointer = false, $another_param) {
    parent::__construct("GameScore", $objectId, $isPointer);
    // ...
  }
}
```
