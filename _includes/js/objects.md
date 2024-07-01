# Objects

## Parse.Object

Storing data on Parse is built around `Parse.Object`. Each `Parse.Object` contains key-value pairs of JSON-compatible data. This data is schemaless, which means that you don't need to specify ahead of time what keys exist on each `Parse.Object`. You simply set whatever key-value pairs you want, and our backend will store it.

For example, let's say you're tracking high scores for a game. A single `Parse.Object` could contain:

```javascript
score: 1337, playerName: "Sean Plott", cheatMode: false
```

Keys must be alphanumeric strings. Values can be strings, numbers, booleans, or even arrays and dictionaries - anything that can be JSON-encoded.

Each `Parse.Object` is an instance of a specific subclass with a class name that you can use to distinguish different sorts of data. For example, we could call the high score object a `GameScore`. We recommend that you NameYourClassesLikeThis and nameYourKeysLikeThis, just to keep your code looking pretty.

To create a new subclass, use the `Parse.Object.extend` method.  Any `Parse.Query` will return instances of the new class for any `Parse.Object` with the same classname.  If you're familiar with `Backbone.Model`, then you already know how to use `Parse.Object`.  It's designed to be created and modified in the same ways.

```javascript
// Simple syntax to create a new subclass of Parse.Object.
const GameScore = Parse.Object.extend("GameScore");

// Create a new instance of that class.
const gameScore = new GameScore();

// Alternatively, you can use the typical Backbone syntax.
const Achievement = Parse.Object.extend({
  className: "Achievement"
});
```

You can add additional methods and properties to your subclasses of `Parse.Object`.

```javascript

// A complex subclass of Parse.Object
const Monster = Parse.Object.extend("Monster", {
  // Instance methods
  hasSuperHumanStrength: function () {
    return this.get("strength") > 18;
  },
  // Instance properties go in an initialize method
  initialize: function (attrs, options) {
    this.sound = "Rawr"
  }
}, {
  // Class methods
  spawn: function(strength) {
    const monster = new Monster();
    monster.set("strength", strength);
    return monster;
  }
});

const monster = Monster.spawn(200);
alert(monster.get('strength'));  // Displays 200.
alert(monster.sound); // Displays Rawr.
```

To create a single instance of any Parse Object class, you can also use the `Parse.Object` constructor directly. `new Parse.Object(className)` will create a single Parse Object with that class name.

If you’re already using ES6 in your codebase, good news! From version 1.6.0 onwards, the JavaScript SDK is compatible with ES6 classes. You can subclass `Parse.Object` with the `extends` keyword:

```javascript
class Monster extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super('Monster');
    // All other initialization
    this.sound = 'Rawr';
  }

  hasSuperHumanStrength() {
    return this.get('strength') > 18;
  }

  static spawn(strength) {
    const monster = new Monster();
    monster.set('strength', strength);
    return monster;
  }
}
```

However, when using `extends`, the SDK is not automatically aware of your subclass. If you want objects returned from queries to use your subclass of `Parse.Object`, you will need to register the subclass, similar to what we do on other platforms.

```javascript
// After specifying the Monster subclass...
Parse.Object.registerSubclass('Monster', Monster);
```

Similarly, you can use `extends` with `Parse.User`.

```javascript
class CustomUser extends Parse.User {
  constructor(attributes) {
    super(attributes);
  }

  doSomething() {
    return 5;
  }
}
Parse.Object.registerSubclass('_User', CustomUser);
```

In addition to queries, `logIn` and `signUp` will return the subclass `CustomUser`.

```javascript
const customUser = new CustomUser({ foo: 'bar' });
customUser.setUsername('username');
customUser.setPassword('password');
customUser.signUp().then((user) => {
  // user is an instance of CustomUser
  user.doSomething(); // return 5
  user.get('foo');    // return 'bar'
});
```

`CustomUser.logIn` and `CustomUser.signUp` will return the subclass `CustomUser` (SDK v2.3.0).

## Saving Objects

Let's say you want to save the `GameScore` described above to the Parse Cloud. The interface is similar to a `Backbone.Model`, including the `save` method:

```javascript
const GameScore = Parse.Object.extend("GameScore");
const gameScore = new GameScore();

gameScore.set("score", 1337);
gameScore.set("playerName", "Sean Plott");
gameScore.set("cheatMode", false);

gameScore.save()
.then((gameScore) => {
  // Execute any logic that should take place after the object is saved.
  alert('New object created with objectId: ' + gameScore.id);
}, (error) => {
  // Execute any logic that should take place if the save fails.
  // error is a Parse.Error with an error code and message.
  alert('Failed to create new object, with error code: ' + error.message);
});
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

There are also a few fields you don't need to specify that are provided as a convenience. `objectId` is a unique identifier for each saved object. `createdAt` and `updatedAt` represent the time that each object was created and last modified in the cloud. Each of these fields is filled in by Parse, so they don't exist on a `Parse.Object` until a save operation has completed.

If you prefer, you can set attributes directly in your call to `save` instead.

```javascript
const GameScore = Parse.Object.extend("GameScore");
const gameScore = new GameScore();

gameScore.save({
  score: 1337,
  playerName: "Sean Plott",
  cheatMode: false
})
.then((gameScore) => {
  // The object was saved successfully.
}, (error) => {
  // The save failed.
  // error is a Parse.Error with an error code and message.
});
```

### Saving Nested Objects
You may add a `Parse.Object` as the value of a property in another `Parse.Object`. By default, when you call `save()` on the parent object, all nested objects will be created and/or saved as well in a batch operation. This feature makes it really easy to manage relational data as you don't have to take care of creating the objects in any specific order.

```javascript
const Child = Parse.Object.extend("Child");
const child = new Child();

const Parent = Parse.Object.extend("Parent");
const parent = new Parent();

parent.save({ child: child });
// Automatically the object Child is created on the server
// just before saving the Parent
```

In some scenarios, you may want to prevent this default chain save. For example, when saving a team member's profile that points to an account owned by another user to which you don't have write access. In this case, setting the option `cascadeSave` to `false` may be useful:

```javascript
const TeamMember = Parse.Object.extend("TeamMember");
const teamMember = new TeamMember();
teamMember.set('ownerAccount', ownerAccount);   // Suppose `ownerAccount` has been created earlier.

teamMember.save(null, { cascadeSave: false });
// Will save `teamMember` wihout attempting to save or modify `ownerAccount`

```

### Saving Objects Offline

Most save functions execute immediately, and inform your app when the save is complete. If you don’t need to know when the save has finished, you can use `saveEventually` instead. The advantage is that if the user currently doesn’t have a network connection, `saveEventually` will store the update on the device until a network connection is re-established. If your app is closed before the connection is back, Parse will try again the next time the app is opened. All calls to `saveEventually` (and `destroyEventually`) are executed in the order they are called, so it is safe to call `saveEventually` on an object multiple times. If you have the local datastore enabled, then any object you saveEventually will be pinned as long as that save is in progress. That makes it easy to retrieve your local changes while waiting for the network to be available. If an error occurs while saving or deleting an object the data will be lost. `Parse.enableLocalDatastore()` must be called to use this feature.

```javascript
const TeamMember = Parse.Object.extend("TeamMember");
const teamMember = new TeamMember();

teamMember.set('ownerAccount', ownerAccount); 

await teamMember.saveEventually();
```

### Saving Objects Offline Advanced API

The SDK provides utility functions to queue objects that will be saved to the server at a later date with `Parse.EventuallyQueue`. See <a href="https://parseplatform.org/Parse-SDK-JS/api/release/Parse.EventuallyQueue.html">EventuallyQueue API</a> for full documentation.

#### Add Object to Queue
Adding unique hashes to your objects is highly recommended

```javascript
const object = new Parse.Object('TestObject');
object.save({ hash: 'unique' });

await Parse.EventuallyQueue.save(object, options);
await Parse.EventuallyQueue.destroy(object, options);
```

#### Send Queue to Parse Server
```javascript
await Parse.EventuallyQueue.sendQueue();
```
You can send the queue either right after adding an object or on connect (or other events).

#### Clear Queue
```javascript
await Parse.EventuallyQueue.clear();
```

#### Polling
This will call sendQueue when a connection to the server is established. Uses the `serverURL` used to initialize sdk
```javascript
Parse.EventuallyQueue.poll();
```

### Cloud Code context

*Requires Parse Server 4.3.0+*

You may pass a `context` dictionary that is accessible in Cloud Code `beforeSave` and `afterSave` triggers for that `Parse.Object`. This is useful if you want to condition certain operations in Cloud Code triggers on ephemeral information that should not be saved with the `Parse.Object` in the database. The context is ephemeral in the sense that it vanishes after the Cloud Code triggers for that particular `Parse.Object` have executed. For example:

```javascript
const TeamMember = Parse.Object.extend("TeamMember");
const teamMember = new TeamMember();
teamMember.set("team", "A");

const context = { notifyTeam: false };
await teamMember.save(null, { context: context });
```

The context is then accessible in Cloud Code:

```javascript
Parse.Cloud.afterSave("TeamMember", async (req) => {
  const notifyTeam = req.context.notifyTeam;
  if (notifyTeam) {
    // Notify team about new member.
  }
});
```

## Retrieving Objects

Saving data to the cloud is fun, but it's even more fun to get that data out again. If the `Parse.Object` has been uploaded to the server, you can use the `objectId` to get it using a `Parse.Query`:

```javascript
const GameScore = Parse.Object.extend("GameScore");
const query = new Parse.Query(GameScore);
query.get("xWMyZ4YEGZ")
.then((gameScore) => {
  // The object was retrieved successfully.
}, (error) => {
  // The object was not retrieved successfully.
  // error is a Parse.Error with an error code and message.
});
```

To get the values out of the `Parse.Object`, use the `get` method.

```javascript
const score = gameScore.get("score");
const playerName = gameScore.get("playerName");
const cheatMode = gameScore.get("cheatMode");
```

Alternatively, the `attributes` property of the `Parse.Object` can be treated as a Javascript object, and even destructured. 

```javascript
const { score, playerName, cheatMode } = result.attributes;
```

The four special reserved values are provided as properties and cannot be retrieved using the 'get' method nor modified with the 'set' method:

```javascript
const objectId = gameScore.id;
const updatedAt = gameScore.updatedAt;
const createdAt = gameScore.createdAt;
const acl = gameScore.getACL();
```

If you need to refresh an object you already have with the latest data that
    is in the Parse Cloud, you can call the `fetch` method like so:

```javascript
myObject.fetch().then((myObject) => {
  // The object was refreshed successfully.
}, (error) => {
  // The object was not refreshed successfully.
  // error is a Parse.Error with an error code and message.
});
```

If you need to check if an object has been fetched, you can call the  `isDataAvailable()` method:

```javascript
if (!myObject.isDataAvailable()) {
  await myObject.fetch();
}
```

## Updating Objects

Updating an object is simple. Just set some new data on it and call the save method. For example:

```javascript
// Create the object.
const GameScore = Parse.Object.extend("GameScore");
const gameScore = new GameScore();

gameScore.set("score", 1337);
gameScore.set("playerName", "Sean Plott");
gameScore.set("cheatMode", false);
gameScore.set("skills", ["pwnage", "flying"]);

gameScore.save().then((gameScore) => {
  // Now let's update it with some new data. In this case, only cheatMode and score
  // will get sent to the cloud. playerName hasn't changed.
  gameScore.set("cheatMode", true);
  gameScore.set("score", 1338);
  return gameScore.save();
});
```

Parse automatically figures out which data has changed so only "dirty" fields will be sent to the Parse Cloud. You don't need to worry about squashing data that you didn't intend to update.

### Counters

The above example contains a common use case. The "score" field is a counter that we'll need to continually update with the player's latest score. Using the above method works but it's cumbersome and can lead to problems if you have multiple clients trying to update the same counter.

To help with storing counter-type data, Parse provides methods that atomically increment (or decrement) any number field. So, the same update can be rewritten as:

```javascript
gameScore.increment("score");
gameScore.save();
```

You can also increment by any amount by passing in a second argument to `increment`. When no amount is specified, 1 is used by default.

### Arrays

To help with storing array data, there are three operations that can be used to atomically change an array associated with a given key:

*   `add` append the given object to the end of an array field.
*   `addUnique` add the given object only if it isn't already contained in an array field. The position of the insert is not guaranteed.
*   `remove` remove all instances of the given object from an array field.

For example, we can add items to the set-like "skills" field like so:

```javascript
gameScore.addUnique("skills", "flying");
gameScore.addUnique("skills", "kungfu");
gameScore.save();
```

Note that it is not currently possible to atomically add and remove items from an array in the same save. You will have to call `save` in between every different kind of array operation.

## Destroying Objects

To delete an object from the cloud:

```javascript
myObject.destroy().then((myObject) => {
  // The object was deleted from the Parse Cloud.
}, (error) => {
  // The delete failed.
  // error is a Parse.Error with an error code and message.
});
```

You can delete a single field from an object with the `unset` method:

```javascript
// After this, the playerName field will be empty
myObject.unset("playerName");

// Saves the field deletion to the Parse Cloud.
// If the object's field is an array, call save() after every unset() operation.
myObject.save();
```

Please note that use of object.set(null) to remove a field from an object is not recommended and will result in unexpected functionality.

## Relational Data

Objects may have relationships with other objects. For example, in a blogging application, a `Post` object may have many `Comment` objects. Parse supports all kind of relationships, including one-to-one, one-to-many, and many-to-many.

### One-to-One and One-to-Many Relationships

One-to-one and one-to-many relationships are modeled by saving a `Parse.Object` as a value in the other object. For example, each `Comment` in a blogging app might correspond to one `Post`.

To create a new `Post` with a single `Comment`, you could write:

```javascript
// Declare the types.
const Post = Parse.Object.extend("Post");
const Comment = Parse.Object.extend("Comment");

// Create the post
const myPost = new Post();
myPost.set("title", "I'm Hungry");
myPost.set("content", "Where should we go for lunch?");

// Create the comment
const myComment = new Comment();
myComment.set("content", "Let's do Sushirrito.");

// Add the post as a value in the comment
myComment.set("parent", myPost);

// This will save both myPost and myComment
myComment.save();
```

Internally, the Parse framework will store the referred-to object in just one place, to maintain consistency. You can also link objects using just their `objectId`s like so:

```javascript
const post = new Post();
post.id = "1zEcyElZ80";

myComment.set("parent", post);
```

By default, when fetching an object, related `Parse.Object`s are not fetched.  These objects' values cannot be retrieved until they have been fetched like so:

```javascript
const post = fetchedComment.get("parent");
await post.fetch();
const title = post.get("title");
```

### Many-to-Many Relationships

Many-to-many relationships are modeled using `Parse.Relation`. This works similar to storing an array of `Parse.Object`s in a key, except that you don't need to fetch all of the objects in a relation at once.  In addition, this allows `Parse.Relation` to scale to many more objects than the array of `Parse.Object` approach.  For example, a `User` may have many `Posts` that she might like. In this case, you can store the set of `Posts` that a `User` likes using `relation`.  In order to add a `Post` to the "likes" list of the `User`, you can do:

```javascript
const user = Parse.User.current();
const relation = user.relation("likes");
relation.add(post);
user.save();
```

You can remove a post from a `Parse.Relation`:

```javascript
relation.remove(post);
user.save();
```

You can call `add` and `remove` multiple times before calling save:

```javascript
relation.remove(post1);
relation.remove(post2);
user.save();
```

You can also pass in an array of `Parse.Object` to `add` and `remove`:

```javascript
relation.add([post1, post2, post3]);
user.save();
```

By default, the list of objects in this relation are not downloaded.  You can get a list of the posts that a user likes by using the `Parse.Query` returned by `query`.  The code looks like:

```javascript
relation.query().find({
  success: function(list) {
    // list contains the posts that the current user likes.
  }
});
```

If you want only a subset of the Posts, you can add extra constraints to the `Parse.Query` returned by query like this:

```javascript
const query = relation.query();
query.equalTo("title", "I'm Hungry");
query.find({
  success:function(list) {
    // list contains post liked by the current user which have the title "I'm Hungry".
  }
});
```

For more details on `Parse.Query`, please look at the query portion of this guide. A `Parse.Relation` behaves similar to an array of `Parse.Object` for querying purposes, so any query you can do on an array of objects, you can do on a `Parse.Relation`.

## Data Types

So far we've used values with type `String`, `Number`, and `Parse.Object`. Parse also supports `Date`s and `null`. You can nest `JSON Object`s and `JSON Array`s to store more structured data within a single `Parse.Object`. Overall, the following types are allowed for each field in your object:

* String => `String`
* Number => `Number`
* Bool => `bool`
* Array => `JSON Array`
* Object => `JSON Object`
* Date => `Date`
* File => `Parse.File`
* Pointer => other `Parse.Object`
* Relation => `Parse.Relation`
* Null => `null`

Some examples:

```javascript
const number = 42;
const bool = false;
const string = "the number is " + number;
const date = new Date();
const array = [string, number];
const object = { number: number, string: string };
const pointer = MyClassName.createWithoutData(objectId);

const BigObject = Parse.Object.extend("BigObject");
const bigObject = new BigObject();
bigObject.set("myNumber", number);
bigObject.set("myBool", bool);
bigObject.set("myString", string);
bigObject.set("myDate", date);
bigObject.set("myArray", array);
bigObject.set("myObject", object);
bigObject.set("anyKey", null); // this value can only be saved to an existing key
bigObject.set("myPointerKey", pointer); // shows up as Pointer &lt;MyClassName&gt; in the Data Browser
bigObject.save();
```

We do not recommend storing large pieces of binary data like images or documents on `Parse.Object`. We recommend you use `Parse.File`s to store images, documents, and other types of files. You can do so by instantiating a `Parse.File` object and setting it on a field. See [Files](#files) for more details.

For more information about how Parse handles data, check out our documentation on [Data](#data).
