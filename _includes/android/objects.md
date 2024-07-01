# Objects

## The ParseObject

Storing data on Parse is built around the `ParseObject`. Each `ParseObject` contains key-value pairs of JSON-compatible data. This data is schemaless, which means that you don't need to specify ahead of time what keys exist on each `ParseObject`. You simply set whatever key-value pairs you want, and our backend will store it.

For example, let's say you're tracking high scores for a game. A single `ParseObject` could contain:

```javascript
score: 1337, playerName: "Sean Plott", cheatMode: false
```

Keys must be alphanumeric strings. Values can be strings, numbers, booleans, or even arrays and objects - anything that can be JSON-encoded.

Each `ParseObject` has a class name that you can use to distinguish different sorts of data. For example, we could call the high score object a `GameScore`. We recommend that you NameYourClassesLikeThis and nameYourKeysLikeThis, just to keep your code looking pretty.

## Saving Objects

Let's say you want to save the `GameScore` described above to your Parse Server. The interface is similar to a `Map`, plus the `saveInBackground` method:

```java
ParseObject gameScore = new ParseObject("GameScore");
gameScore.put("score", 1337);
gameScore.put("playerName", "Sean Plott");
gameScore.put("cheatMode", false);
gameScore.saveInBackground();
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

Saving data to the cloud is fun, but it's even more fun to get that data out again. If you have the `objectId`, which is available once the `ParseObject` been uploaded to the server, you can retrieve the whole `ParseObject` using a `ParseQuery`:

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");
query.getInBackground("xWMyZ4YEGZ", new GetCallback<ParseObject>() {
  public void done(ParseObject object, ParseException e) {
    if (e == null) {
      // object will be your game score
    } else {
      // something went wrong
    }
  }
});
```

To get the values out of the `ParseObject`, there's a `getX` method for each data type:

```java
int score = gameScore.getInt("score");
String playerName = gameScore.getString("playerName");
boolean cheatMode = gameScore.getBoolean("cheatMode");
```

If you don't know what type of data you're getting out, you can call `get(key)`, but then you probably have to cast it right away anyways. In most situations you should use the typed accessors like `getString`.

The four special values have their own accessors:

```java
String objectId = gameScore.getObjectId();
Date updatedAt = gameScore.getUpdatedAt();
Date createdAt = gameScore.getCreatedAt();
ParseACL acl = gameScore.getACL();
```

If you need to refresh an object you already have with the latest data that
    is in the cloud, you can call the `fetchInBackground` method like so:

```java
myObject.fetchInBackground(new GetCallback<ParseObject>() {
  public void done(ParseObject object, ParseException e) {
    if (e == null) {
      // Success!
    } else {
      // Failure!
    }
  }
});
```

The code in the `GetCallback` will be run on the main thread.

## The Local Datastore

Parse also lets you store objects in a [local datastore](#local-datastore) on the Android device itself. You can use this for data that doesn't need to be saved to the cloud, but this is especially useful for temporarily storing data so that it can be synced later. To enable the datastore, call `Parse.enableLocalDatastore()` in your `Application` constructor before calling `Parse.initialize()`. Once the local datastore is enabled, you can store an object by pinning it.

```java
ParseObject gameScore = new ParseObject("GameScore");
gameScore.put("score", 1337);
gameScore.put("playerName", "Sean Plott");
gameScore.put("cheatMode", false);
gameScore.pinInBackground();
```

As with saving, this recursively stores every object and file that `gameScore` points to, if it has been fetched from the cloud. Whenever you save changes to the object, or fetch new changes from Parse, the copy in the datastore will be automatically updated, so you don't have to worry about it.

## Retrieving Objects from the Local Datastore

Storing an object is only useful if you can get it back out. To get the data for a specific object, you can use a `ParseQuery` just like you would while on the network, but using the `fromLocalDatastore` method to tell it where to get the data.

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");
query.fromLocalDatastore();
query.getInBackground("xWMyZ4YEGZ", new GetCallback<ParseObject>() {
  public void done(ParseObject object, ParseException e) {
    if (e == null) {
      // object will be your game score
    } else {
      // something went wrong
    }
  }
});
```

If you already have an instance of the object, you can instead use the `fetchFromLocalDatastoreInBackground` method.

```java
ParseObject object = ParseObject.createWithoutData("GameScore", "xWMyZ4YEGZ");
object.fetchFromLocalDatastoreInBackground(new GetCallback<ParseObject>() {
  public void done(ParseObject object, ParseException e) {
    if (e == null) {
      // object will be your game score
    } else {
      // something went wrong
    }
  }
});
```

## Unpinning Objects

When you are done with the object and no longer need to keep it on the device, you can release it with `unpinInBackground`.

```java
gameScore.unpinInBackground();
```

## Saving Objects Offline

Most save functions execute immediately, and inform your app when the save is complete. If you don't need to know when the save has finished, you can use `saveEventually` instead. The advantage is that if the user currently doesn't have a network connection, `saveEventually` will store the update on the device until a network connection is re-established. If your app is closed before the connection is back, Parse will try again the next time the app is opened. All calls to `saveEventually` (and `deleteEventually`) are executed in the order they are called, so it is safe to call `saveEventually` on an object multiple times. If you have the local datastore enabled, then any object you `saveEventually` will be pinned as long as that save is in progress. That makes it easy to retrieve your local changes while waiting for the network to be available.

```java
ParseObject gameScore = new ParseObject("GameScore");
gameScore.put("score", 1337);
gameScore.put("playerName", "Sean Plott");
gameScore.put("cheatMode", false);
gameScore.saveEventually();
```

## Updating Objects

Updating an object is simple. Just set some new data on it and call one of the save methods. Assuming you have saved the object and have the `objectId`, you can retrieve the `ParseObject` using a `ParseQuery` and update its data:

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");

// Retrieve the object by id
query.getInBackground("xWMyZ4YEGZ", new GetCallback<ParseObject>() {
  public void done(ParseObject gameScore, ParseException e) {
    if (e == null) {
      // Now let's update it with some new data. In this case, only cheatMode and score
      // will get sent to your Parse Server. playerName hasn't changed.
      gameScore.put("score", 1338);
      gameScore.put("cheatMode", true);
      gameScore.saveInBackground();
    }
  }
});
```

Parse automatically figures out which data has changed so only "dirty" fields will be transmitted during a save. You don't need to worry about squashing data in the cloud that you didn't intend to update.

## Counters

The above example contains a common use case. The "score" field is a counter that we'll need to continually update with the player's latest score. Using the above method works but it's cumbersome and can lead to problems if you have multiple clients trying to update the same counter.

To help with storing counter-type data, Parse provides methods that atomically increment (or decrement) any number field. So, the same update can be rewritten as:

```java
gameScore.increment("score");
gameScore.saveInBackground();
```

You can also increment by any amount using `increment(key, amount)`.

## Arrays

To help with storing array data, there are three operations that can be used to atomically change an array field:

*   `add` and `addAll` append the given objects to the end of an array field.
*   `addUnique` and `addAllUnique` add only the given objects which aren't already contained in an array field to that field. The position of the insert is not guaranteed.
*   `removeAll` removes all instances of the given objects from an array field.

For example, we can add items to the set-like "skills" field like so:

```java
gameScore.addAllUnique("skills", Arrays.asList("flying", "kungfu"));
gameScore.saveInBackground();
```

Note that it is not currently possible to atomically add and remove items from an array in the same save. You will have to call `save` in between every different kind of array operation.

## Deleting Objects

To delete an object from your Parse Server:

```java
myObject.deleteInBackground();
```

If you want to run a callback when the delete is confirmed, you can provide a `DeleteCallback` to the `deleteInBackground` method. If you want to block the calling thread, you can use the `delete` method.

You can delete a single field from an object with the `remove` method:

```java
// After this, the playerName field will be empty
myObject.remove("playerName");

// Saves the field deletion to your Parse Server
myObject.saveInBackground();
```

## Relational Data

Objects can have relationships with other objects. To model this behavior, any `ParseObject` can be used as a value in other `ParseObject`s. Internally, the Parse framework will store the referred-to object in just one place, to maintain consistency.

For example, each `Comment` in a blogging app might correspond to one `Post`. To create a new `Post` with a single `Comment`, you could write:

```java
// Create the post
ParseObject myPost = new ParseObject("Post");
myPost.put("title", "I'm Hungry");
myPost.put("content", "Where should we go for lunch?");

// Create the comment
ParseObject myComment = new ParseObject("Comment");
myComment.put("content", "Let's do Sushirrito.");

// Add a relation between the Post and Comment
myComment.put("post", myPost);

// This will save both myPost and myComment
myComment.saveInBackground();
```

You can also link objects using just their `objectId`s like so:

```java
// Add a relation between the Post with objectId "1zEcyElZ80" and the comment
myComment.put("post", ParseObject.createWithoutData("Post", "1zEcyElZ80"));
```

By default, when fetching an object, related `ParseObject`s are not fetched.  These objects' values cannot be retrieved until they have been fetched like so:

```java
fetchedComment.getParseObject("post")
    .fetchIfNeededInBackground(new GetCallback<ParseObject>() {
        public void done(ParseObject post, ParseException e) {
          String title = post.getString("title");
          // Do something with your new title variable
        }
    });
```

You can also model a many-to-many relation using the `ParseRelation` object.  This works similar to `List<ParseObject>`, except that you don't need to download all the `ParseObject`s in a relation at once.  This allows `ParseRelation` to scale to many more objects than the `List<ParseObject>` approach.  For example, a `User` may have many `Post`s that they might like.  In this case, you can store the set of `Post`s that a `User` likes using `getRelation`.  In order to add a post to the list, the code would look something like:

```java
ParseUser user = ParseUser.getCurrentUser();
ParseRelation<ParseObject> relation = user.getRelation("likes");
relation.add(post);
user.saveInBackground();
```

You can remove a post from the `ParseRelation` with something like:

```java
relation.remove(post);
```

By default, the list of objects in this relation are not downloaded.  You can get the list of `Post`s by calling `findInBackground` on the `ParseQuery` returned by `getQuery`.  The code would look like:

```java
relation.getQuery().findInBackground(new FindCallback<ParseObject>() {
    void done(List<ParseObject> results, ParseException e) {
      if (e != null) {
        // There was an error
      } else {
        // results have all the Posts the current user liked.
      }
    }
});
```

If you want only a subset of the `Post`s you can add extra constraints to the `ParseQuery` returned by `getQuery`.  The code would look something like:

```java
ParseQuery<ParseObject> query = relation.getQuery();
// Add other query constraints.
```

 For more details on `ParseQuery`, please look at the [query portion of this guide](#queries).  A `ParseRelation` behaves similar to a `List<ParseObject>` for querying purposes, so any queries you can do on lists of objects (other than `include`) you can do on `ParseRelation`.

## Data Types

So far we've used values with type `String`, `Integer`, `boolean`, and `ParseObject`. Parse also supports `float`, `java.util.Date`, and `JSONObject.NULL`.

You can nest `JSONObject` and `JSONArray` objects to store more structured data within a single `ParseObject`. Overall, the following types are allowed for each field in your object:

* String => `String`
* Number => primitive numeric values such as `int`s, `double`s, `long`s, or `float`s
* Bool => `boolean`
* Array => `JSONArray`
* Object => `JSONObject`
* Date => `java.util.Date`
* File => `ParseFile`
* Pointer => other `ParseObject`
* Relation => `ParseRelation`
* Null => `JSONObject.NULL`

Some examples:

```java
int myNumber = 42;
String myString = "the number is " + myNumber;
Date myDate = new Date();

JSONArray myArray = new JSONArray();
myArray.put(myString);
myArray.put(myNumber);

JSONObject myObject = new JSONObject();
myObject.put("number", myNumber);
myObject.put("string", myString);

ParseObject bigObject = new ParseObject("BigObject");
bigObject.put("myNumber", myNumber);
bigObject.put("myString", myString);
bigObject.put("myDate", myDate);
bigObject.put("myArray", myArray);
bigObject.put("myObject", myObject);
bigObject.put("myNull", JSONObject.NULL);
bigObject.saveInBackground();
```

We do not recommend storing large pieces of binary data like images or documents on `ParseObject`. We recommend you use `ParseFile`s to store images, documents, and other types of files. You can do so by instantiating a `ParseFile` object and setting it on a field. See [Files](#files) for more details.

For more information about how Parse handles data, check out our documentation on [Data](#data).

## Subclasses

Parse is designed to get you up and running as quickly as possible. You can access all of your data using the `ParseObject` class and access any field with `get()`. In mature codebases, subclasses have many advantages, including terseness, extensibility, and support for autocomplete. Subclassing is completely optional, but can transform this code:

```java
ParseObject shield = new ParseObject("Armor");
shield.put("displayName", "Wooden Shield");
shield.put("fireproof", false);
shield.put("rupees", 50);
```

Into this:

```java
Armor shield = new Armor();
shield.setDisplayName("Wooden Shield");
shield.setFireproof(false);
shield.setRupees(50);
```

### Subclassing ParseObject

To create a `ParseObject` subclass:

1.  Declare a subclass which extends `ParseObject`.
2.  Add a `@ParseClassName` annotation. Its value should be the string you would pass into the `ParseObject` constructor, and makes all future class name references unnecessary.
3.  Ensure that your subclass has a public default (i.e. zero-argument) constructor. You must not modify any `ParseObject` fields in this constructor.
4.  Call `ParseObject.registerSubclass(YourClass.class)` in your `Application` constructor before calling `Parse.initialize()`.
    The following code successfully implements and registers the `Armor` subclass of `ParseObject`:

```java
// Armor.java
import com.parse.ParseObject;
import com.parse.ParseClassName;

@ParseClassName("Armor")
public class Armor extends ParseObject {
}

// App.java
import com.parse.Parse;
import android.app.Application;

public class App extends Application {
  @Override
  public void onCreate() {
    super.onCreate();

    ParseObject.registerSubclass(Armor.class);
    Parse.initialize(this);
  }
}
```

### Accessors, Mutators, and Methods

Adding methods to your `ParseObject` subclass helps encapsulate logic about the class. You can keep all your logic about a subject in one place rather than using separate classes for business logic and storage/transmission logic.

You can add accessors and mutators for the fields of your `ParseObject` easily. Declare the getter and setter for the field as you normally would, but implement them in terms of `get()` and `put()`. The following example creates a `displayName` field in the `Armor` class:

```java
// Armor.java
@ParseClassName("Armor")
public class Armor extends ParseObject {
  public String getDisplayName() {
    return getString("displayName");
  }
  public void setDisplayName(String value) {
    put("displayName", value);
  }
}
```

You can now access the displayName field using `armor.getDisplayName()` and assign to it using `armor.setDisplayName("Wooden Sword")`. This allows your IDE to provide autocompletion as you develop your app and allows typos to be caught at compile-time.

Accessors and mutators of various types can be easily defined in this manner using the various forms of `get()` such as `getInt()`, `getParseFile()`, or `getMap()`.

If you need more complicated logic than simple field access, you can declare your own methods as well:

```java
public void takeDamage(int amount) {
  // Decrease the armor's durability and determine whether it has broken
  increment("durability", -amount);
  if (getDurability() < 0) {
    setBroken(true);
  }
}
```

### Initializing Subclasses

You should create new instances of your subclasses using the constructors you have defined. Your subclass must define a public default constructor that does not modify fields of the `ParseObject`, which will be used throughout the Parse SDK to create strongly-typed instances of your subclass.

To create a reference to an existing object, use `ParseObject.createWithoutData()`:

```java
Armor armorReference = ParseObject.createWithoutData(Armor.class, armor.getObjectId());
```

### Queries on Subclasses

You can get a query for objects of a particular subclass using the static method `ParseQuery.getQuery()`. The following example queries for armors that the user can afford:

```java
ParseQuery<Armor> query = ParseQuery.getQuery(Armor.class);
query.whereLessThanOrEqualTo("rupees", ParseUser.getCurrentUser().get("rupees"));
query.findInBackground(new FindCallback<Armor>() {
  @Override
  public void done(List<Armor> results, ParseException e) {
    for (Armor a : results) {
      // ...
    }
  }
});
```

## Parcelable

As most public facing components of the SDK, `ParseObject` implements the `Parcelable` interface. This means you can retain a `ParseObject` during configuration changes, or pass objects to other components through `Bundle`s. To achieve this, depending on the context, use either `Parcel#writeParcelable(Parcelable, int)` or `Bundle#putParcelable(String, Parcelable)`.
For instance, in an `Activity`,

```java
private ParseObject object;

@Override
protected void onSaveInstanceState(Bundle outState) {
    super.onSaveInstanceState(outState);
    outState.putParcelable("object", object);
}

@Override
protected void onCreate(@Nullable Bundle savedInstanceState) {
  if (savedInstanceState != null) {
    object = (ParseObject) savedInstanceState.getParcelable("object");
  }
}
```

That's it. `ParseObject` will parcel its internal state, along with unsaved children and dirty changes. There are, however, a few things to be aware of when parceling objects that have ongoing operations, like save or delete. The SDK behavior differs depending on whether you have enabled the Local Datastore.

### Parceling with Local Datastore enabled

When the Local Datastore is enabled, parceling a `ParseObject` is a safe operation even if there are ongoing save or delete operations. Thanks to LDS, the same instance is returned when unparceling (unless something happens in the middle, in which case the SDK behaves as if LDS was disabled, see below).

This means that the `ParseObject` is internally notified about the operation results, whether it's successful or not. There is, however, no way to register external callbacks (`SaveCallback` or `DeleteCallback`) for these tasks, other than the ones you have already registered at the moment of saving / deleting the source instance.

### Parceling with Local Datastore disabled

When the Local Datastore is disabled, and the parceled `ParseObject` has ongoing operations that haven't finished yet, the unparceled object will end up in a stale state. The unparceled object, being a different instance than the source object,

- assumes that ongoing operations at the moment of parceling never took place
- will not update its internal state when the operations triggered by the source object

The unfortunate consequence is that keys that were dirty before saving will still be marked as dirty for the unparceled object. This means, for instance, that any future call to `saveInBackground()` will send these dirty operations to the server again. This can lead to inconsistencies for operations like `increment`, since it might be performed twice.

### Parceling ParseObject subclasses

By default, `ParseObject` implementation parcels everything that is needed. If your subclasses have stateful information that you would like to keep when parceling, you can simply override `onSaveInstanceState(Bundle)` and `onRestoreInstanceState(Bundle)`:

```java
// Armor.java
@ParseClassName("Armor")
public class Armor extends ParseObject {
  private int member;

  @Override
  protected void onSaveInstanceState(Bundle outState) {
    outState.putInt("member", member);
  }

  @Override
  protected void onRestoreInstanceState(Bundle savedInstanceState) {
    member = savedInstanceState.getInt("member");
  }
}
```
