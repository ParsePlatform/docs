# Objects

## The PFObject

Storing data on Parse is built around the `PFObject`. Each `PFObject` contains key-value pairs of JSON-compatible data. This data is schemaless, which means that you don't need to specify ahead of time what keys exist on each `PFObject`. You simply set whatever key-value pairs you want, and our backend will store it.

For example, let's say you're tracking high scores for a game. A single `PFObject` could contain:

```js
score: 1337, playerName: "Sean Plott", cheatMode: false
```

Keys must be alphanumeric strings. Values can be strings, numbers, booleans, or even arrays and dictionaries - anything that can be JSON-encoded.

Each `PFObject` has a class name that you can use to distinguish different sorts of data. For example, we could call the high score object a `GameScore`. We recommend that you NameYourClassesLikeThis and nameYourKeysLikeThis, just to keep your code looking pretty.

## Saving Objects

Let's say you want to save the `GameScore` described above to a Parse Server. The interface is similar to a `NSMutableDictionary`. The `saveInBackgroundWithBlock` function:

<div class="language-toggle" markdown="1">
```objective_c
PFObject *gameScore = [PFObject objectWithClassName:@"GameScore"];
gameScore[@"score"] = @1337;
gameScore[@"playerName"] = @"Sean Plott";
gameScore[@"cheatMode"] = @NO;
[gameScore saveInBackgroundWithBlock:^(BOOL succeeded, NSError * _Nullable error) {
  if (succeeded) {
    // The object has been saved.
  } else {
    // There was a problem, check error.description
  }
}];
```
```swift
let gameScore = PFObject(className:"GameScore")
gameScore["score"] = 1337
gameScore["playerName"] = "Sean Plott"
gameScore["cheatMode"] = false
gameScore.saveInBackground { (succeeded, error)  in
    if (succeeded) {
        // The object has been saved.
    } else {
        // There was a problem, check error.description
    }
}
```
</div>

After this code runs, you will probably be wondering if anything really happened. If [Parse Dashboard](https://github.com/parse-community/parse-dashboard) is implemented for your server, you can verify the data was saved in the data browser. You should see something like this:

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

There are also a few fields you don't need to specify that are provided and set by the system as a convenience. `objectId` is a unique identifier for each saved object. `createdAt` and `updatedAt` represent the time that each object was created or last modified and saved to the Parse Server. Each of these fields is filled in by Parse Server, so they don't exist on a `PFObject` until the first save operation has been completed.

## Retrieving Objects

Saving data to the cloud is fun, but it's even more fun to get that data out again. If the `PFObject` has been uploaded to the server, you can retrieve it with its `objectId` by using a `PFQuery`. This is an asynchronous method, with variations for using either blocks or callback methods:

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query getObjectInBackgroundWithId:@"xWMyZ4YEGZ" block:^(PFObject *gameScore, NSError *error) {
    if (!error) {
        // Success!
    } else {
        // Failure!
    }
}];
```
```swift
let query = PFQuery(className:"GameScore")
query.getObjectInBackground(withId: "xWMyZEGZ") { (gameScore, error) in
    if error == nil {
        // Success!
    } else {
        // Fail!
    }
}
```
</div>

To get the values out of the `PFObject`, you can use either the `objectForKey:` method or the `[]` subscripting operator:

<div class="language-toggle" markdown="1">
```objective_c
int score = [[gameScore objectForKey:@"score"] intValue];
NSString *playerName = gameScore[@"playerName"];
BOOL cheatMode = [gameScore[@"cheatMode"] boolValue];
```
```swift
let score = gameScore["score"] as? Int
let playerName = gameScore["playerName"] as? String
let cheatMode = gameScore["cheatMode"] as? Bool
```
</div>

The four special values are provided as properties:

<div class="language-toggle" markdown="1">
```objective_c
NSString *objectId = gameScore.objectId;
NSDate *updatedAt = gameScore.updatedAt;
NSDate *createdAt = gameScore.createdAt;
PFACL *ACL = gameScore.ACL;
```
```swift
let objectId = gameScore.objectId
let updatedAt = gameScore.updatedAt
let createdAt = gameScore.createdAt
let acl = gameScore.acl
```
</div>

If you need to refresh an object you already have with the latest data that
is in the database, you can use the `fetchInBackgroundWithBlock:` or `fetchInBackgroundWithTarget:selector:` methods.


<div class="language-toggle" markdown="1">
```objective_c
[myObject fetchInBackgroundWithBlock:^(PFObject * _Nullable object, NSError * _Nullable error) {
    if (!error) {
        // Success!
    } else {
        // Failure!
    }
}];
```
```swift
myObject.fetchInBackground { (object, error) in
    if error == nil {
        // Success!
    } else {
        // Failure!
    }
}
```
</div>

Note: In a similar way to the `save` methods, you can use the throwable `fetch` or `fetchIfNeeded` methods, or asyncronous task without completion. `fetchInBackground`

## The Local Datastore

Parse also lets you store objects in a [local datastore](#local-datastore) on the device itself. You can use this for data that doesn't need to be saved to the cloud, but this is especially useful for temporarily storing data so that it can be synced later. To enable the datastore, add `isLocalDatastoreEnabled = true` to the `ParseClientConfiguration` block in your `AppDelegate` `application:didFinishLaunchWithOptions:`, or call `Parse.enableLocalDatastore()` before calling `Parse.initialize()`. Once the local datastore is enabled, you can store an object by pinning it.

<div class="language-toggle" markdown="1">
```objective_c
PFObject *gameScore = [PFObject objectWithClassName:@"GameScore"];
gameScore[@"score"] = 1337;
gameScore[@"playerName"] = @"Sean Plott";
gameScore[@"cheatMode"] = @NO;
[gameScore pinInBackground];
```
```swift
let gameScore = PFObject(className:"GameScore")
gameScore["score"] = 1337
gameScore["playerName"] = "Sean Plott"
gameScore["cheatMode"] = false
gameScore.pinInBackground()
```
</div>

As with saving, this recursively stores every object and file that `gameScore` points to, if it has been fetched from the cloud. Whenever you save changes to the object, or fetch new changes from Parse, the copy in the datastore will be automatically updated, so you don't have to worry about it.

### Retrieving Objects from the Local Datastore

Storing an object is only useful if you can get it back out. To get the data for a specific object, you can use a `PFQuery` just like you would while on the network, but using the `fromLocalDatastore:` method to tell it where to get the data.

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query fromLocalDatastore];
[[query getObjectInBackgroundWithId:@"xWMyZ4YEGZ"] continueWithBlock:^id(BFTask *task) {
  if (task.error) {
    // something went wrong;
    return task;
  }

  // task.result will be your game score
  return task;
}];
```
```swift
let query = PFQuery(className:"GameScore")
query.fromLocalDatastore()
query.getObjectInBackground(withId: "xWMyZEGZ").continueWith { (task: BFTask<PFObject>!) -> Any? in
    if task.error != nil {
        // There was an error.
        return task
    }

    // task.result will be your game score
    return task
}
```
</div>

If you already have an instance of the object, you can instead use the `fetchFromLocalDatastoreInBackground:` method.

<div class="language-toggle" markdown="1">
```objective_c
PFObject *object = [PFObject objectWithoutDataWithClassName:@"GameScore" objectId:@"xWMyZ4YEGZ"];
[[object fetchFromLocalDatastoreInBackground] continueWithBlock:^id(BFTask *task) {
  if (task.error) {
    // something went wrong
    return task;
  }

  // task.result will be your game score
  return task;
}];
```
```swift
let object = PFObject(withoutDataWithClassName:"GameScore", objectId:"xWMyZ4YEGZ")
object.fetchFromLocalDatastoreInBackground().continueWith { (task: BFTask<PFObject>!) -> Any? in
    if task.error != nil {
        // There was an error.
        return task
    }

    // task.result will be your game score
    return task
}
```
</div>

### Unpinning Objects

When you are done with the object and no longer need to keep it on the device, you can release it with `unpinInBackground:`.

<div class="language-toggle" markdown="1">
```objective_c
[gameScore unpinInBackground];
```
```swift
gameScore.unpinInBackground()
```
</div>

## Saving Objects Offline

Most save functions execute immediately, and inform your app when the save is complete. For a network consious soltion on non-priority save requests use `saveEventually`. Not only does it retry saving upon regaining network connection, but If your app is closed prior to save completion Parse will try the next time the app is opened. Additionally, all calls to `saveEventually` (and `deleteEventually`) are executed in the order they are called, making it safe to call `saveEventually` on an object multiple times.

<div class="language-toggle" markdown="1">
```objective_c
// Create the object.
PFObject *gameScore = [PFObject objectWithClassName:@"GameScore"];
gameScore[@"score"] = @1337;
gameScore[@"playerName"] = @"Sean Plott";
gameScore[@"cheatMode"] = @NO;
[gameScore saveEventually];
```
```swift
let gameScore = PFObject(className:"GameScore")
gameScore["score"] = 1337
gameScore["playerName"] = "Sean Plott"
gameScore["cheatMode"] = false
gameScore.saveEventually()
```
</div>

## Updating Objects

Updating an object is simple. Just set some new data on it and call one of the save methods. Assuming you have saved the object and have the `objectId`, you can retrieve the `PFObject` using a `PFQuery` and update its data:

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];

// Retrieve the object by id
[query getObjectInBackgroundWithId:@"xWMyZ4YEGZ"
                             block:^(PFObject *gameScore, NSError *error) {
    // Now let's update it with some new data. In this case, only cheatMode and score
    // will get sent to the cloud. playerName hasn't changed.
    gameScore[@"cheatMode"] = @YES;
    gameScore[@"score"] = @1338;
    [gameScore saveInBackground];
}];
```
```swift
let query = PFQuery(className:"GameScore")
query.getObjectInBackground(withId: "xWMyZEGZ") { (gameScore: PFObject?, error: Error?) in
    if let error = error {
        print(error.localizedDescription)
    } else if let gameScore = gameScore {
        gameScore["cheatMode"] = true
        gameScore["score"] = 1338
        gameScore.saveInBackground()
    }
}
```
</div>

The client automatically figures out which data has changed so only "dirty" fields will be sent to Parse. You don't need to worry about squashing data that you didn't intend to update.

### Counters

The above example contains a common use case. The "score" field is a counter that we'll need to continually update with the player's latest score. Using the above method works but it's cumbersome and can lead to problems if you have multiple clients trying to update the same counter.

To help with storing counter-type data, Parse provides methods that atomically increment (or decrement) any number field. So, the same update can be rewritten as:

<div class="language-toggle" markdown="1">
```objective_c
[gameScore incrementKey:@"score"];
[gameScore saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
  if (succeeded) {
    // The score key has been incremented
  } else {
    // There was a problem, check error.description
  }
}];
```
```swift
let gameScore = PFObject(className:"GameScore")
gameScore.incrementKey("score")
gameScore.saveInBackground {
  (success: Bool, error: Error?) in
  if (success) {
    // The score key has been incremented
  } else {
    // There was a problem, check error.description
  }
}
```
</div>

You can also increment by any amount using `incrementKey:byAmount:`.

### Arrays

To help with storing array data, there are three operations that can be used to atomically change an array field:

*   `addObject:forKey:` and `addObjectsFromArray:forKey:` append the given objects to the end of an array field.
*   `addUniqueObject:forKey:` and `addUniqueObjectsFromArray:forKey:` add only the given objects which aren't already contained in an array field to that field. The position of the insert is not guaranteed.
*   `removeObject:forKey:` and `removeObjectsInArray:forKey:` remove all instances of each given object from an array field.

For example, we can add items to the set-like "skills" field like so:

<div class="language-toggle" markdown="1">
```objective_c
[gameScore addUniqueObjectsFromArray:@[@"flying", @"kungfu"] forKey:@"skills"];
[gameScore saveInBackground];
```
```swift
gameScore.addUniqueObjects(from: ["flying", "kungfu"], forKey:"skills")
gameScore.saveInBackground()
```
</div>

Note that it is not currently possible to atomically add and remove items from an array in the same save using. You will have to call `save` in between every different kind of array operation.

## Deleting Objects


There are a few ways to delete a `PFObject`. For basic asynchronous deletion of a single object call the objects `deleteInBackground` function. If you prefer to recieve a callback you can use the `deleteInBackgroundWithBlock:` or `deleteInBackgroundWithTarget:selector:` methods. If you want to block the calling thread, you can use the `delete` method. Lastly, `deleteEventually` is a network conscious option that deletes when possible but does not guarantee a timeframe for the tasks completion.

For deleting multiple objects use the `PFObject` static function `deleteAllInBackground` to delete an array of objects asynchronously. The same can be done while blocking the calling thread using `deleteAll`. Lastly, to recieve a callback after deleting objects asyncronously use `deleteAllInBackground:block:` as demonstrated below.


<div class="language-toggle" markdown="1">
```objective_c
[PFObject deleteAllInBackground:objectArray block:^(BOOL succeeded, NSError * _Nullable error) {
    if (succeeded) {
        // The array of objects was successfully deleted.
    } else {
        // There was an error. Check the errors localizedDescription.
    }
}];
```
```swift
PFObject.deleteAll(inBackground: objectArray) { (succeeded, error) in
    if (succeeded) {
        // The array of objects was successfully deleted.
    } else {
        // There was an error. Check the errors localizedDescription.
    }
}
```
</div>

Note: Deleting an object from the server that contains a `PFFileObject` does **NOT** delete the file from storage. Instead, an objects deletion only deletes the data referencing the stored file. To delete the data from storage you must use the [REST API]({{site.baseUrl}}/rest/guide/#deleting-files). For more info about `PFFileObject`, please see the [Files](#files) section.

## Relational Data

Objects can have relationships with other objects. To model this behavior, any `PFObject` can be used as a value in other `PFObject`s. Internally, the Parse framework will store the referred-to object in just one place, to maintain consistency.

For example, each `Comment` in a blogging app might correspond to one `Post`. To create a new `Post` with a single `Comment`, you could write:

<div class="language-toggle" markdown="1">
```objective_c
// Create the post
PFObject *myPost = [PFObject objectWithClassName:@"Post"];
myPost[@"title"] = @"I'm Hungry";
myPost[@"content"] = @"Where should we go for lunch?";

// Create the comment
PFObject *myComment = [PFObject objectWithClassName:@"Comment"];
myComment[@"content"] = @"Let's do Sushirrito.";

// Add a relation between the Post and Comment
myComment[@"post"] = myPost;

// This will save both myPost and myComment
[myComment saveInBackground];
```
```swift
// Create the post
let myPost = PFObject(className:"Post")
myPost["title"] = "I'm Hungry"
myPost["content"] = "Where should we go for lunch?"

// Create the comment
let myComment = PFObject(className:"Comment")
myComment["content"] = "Let's do Sushirrito."

// Add a relation between the Post and Comment
myComment["post"] = myPost

// This will save both myPost and myComment
myComment.saveInBackground()
```
</div>

Note: Saving an object with a relational pointer to another object will save both objects. However, two new objects with pointers to each other will cause a error for having a circular dependency.

### Object Relationships With Minimal Data

You can link objects without even fetching data by initializing `PFObjects` with only the class name and the objects `objectId` like so:

<div class="language-toggle" markdown="1">
```objective_c
myComment[@"post"] = [PFObject objectWithoutDataWithClassName:@"Post" objectId:@"1zEcyElZ80"];
```
```swift
// Add a relation between the Post with objectId "1zEcyElZ80" and the comment
myComment["post"] = PFObject(withoutDataWithClassName: "Post", objectId: "1zEcyElZ80")
```
</div>

By default, when fetching an object, related `PFObject`s are not fetched.  These objects' values cannot be retrieved until they have been fetched like so:

<div class="language-toggle" markdown="1">
```objective_c
PFObject *post = myComment[@"post"];
[post fetchInBackgroundWithBlock:^(PFObject * _Nullable object, NSError * _Nullable error) {
    NSString *title = post[@"title"];
    if (title) {  // do something with title }
}];
```
```swift
let post = myComment["post"] as! PFObject
post.fetchIfNeededInBackground { (object, error) in
    if let title = post["title"] as? String {
        // do something with your title variable
    } else if let errorString = error?.localizedDescription {
        print(errorString)
    }
}
```
</div>

You can also model a many-to-many relation using the `PFRelation` object.  This works similar to an `NSArray` of `PFObjects`, except that you don't need to download all the Objects in a relation at once.  This allows `PFRelation` to scale to many more objects than the `NSArray` of `PFObject` approach.  For example, a `User` may have many `Post`s that they might like.  In this case, you can store the set of `Post`s that a `User` likes using `relationForKey:`.  In order to add a post to the list, the code would look something like:

<div class="language-toggle" markdown="1">
```objective_c
PFUser *user = [PFUser currentUser];
PFRelation *relation = [user relationForKey:@"likes"];
[relation addObject:post];
[user saveInBackgroundWithBlock:^(BOOL succeeded, NSError * _Nullable error) {
    if (succeeded) {
        // The post has been added to the user's likes relation.
    } else {
        // There was a problem, check error.description
    }
}];
```
```swift
guard let user = PFUser.current() else { return }
let relation = user.relation(forKey: "likes")
relation.add(post)
user.saveInBackground { (succeeded, error) in
    if (succeeded) {
        // The post has been added to the user's likes relation.
    } else {
        // There was a problem, check error.description
    }
}
```
</div>

You can remove a post from the `PFRelation` similarly using the `removeObject:` function followed by saving the parent object.

By default, the list of objects in this relation are not downloaded.  You can get the list of `Post`s by using calling `findObjectsInBackgroundWithBlock:` on the `PFQuery` returned by `query`.  The code would look like:

<div class="language-toggle" markdown="1">
```objective_c
[[relation query] findObjectsInBackgroundWithBlock:^(NSArray * _Nullable objects, NSError * _Nullable error) {
    if (error) {
        // There was an error
    } else {
        // objects has all the Posts the current user liked.
    }
}];
```
```swift
relation.query().findObjectsInBackground { (object, error) in
    if error == nil {
        // Success
    } else {
        // Failure!
    }
})
```
</div>

You can add constraints to a `PFRelation`'s query by adding constraints to the `PFQuery` returned by its `query` parameter as demonstrated below:

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [relation query];
[query whereKey:"category" equalTo:@"development"];
PFObject *object = [query getFirstObject]; // Query first object found
if (object) {
    // Do something with object
}
```
```swift
var query = relation.query()
query.whereKey("category", equalTo: "development") 

// Query first object found
if let object = try? query.getFirstObject() {
    // Do something with object
} ```
</div>

You can learn more about queries by visiting the [PFQuery](#queries) section. A `PFRelation` behaves similarly to an array of  `PFObject` yet has a built in query that's capable of everything a standard `PFQuery` is other than `includeKey:`.

## Data Types

So far we've used values with type `NSString`, `NSNumber`, and `PFObject`. Parse also supports `NSDate`, `NSObject`, `NSArray`, and `NSNull`. You can nest `NSObject` and `NSArray` objects to store more structured data within a single `PFObject`. Overall, the following types are allowed for each field in your object:

* String => `NSString`
* Number => `NSNumber`
* Bool => `NSNumber`
* Array => `NSArray`
* Object => `NSObject`
* Date => `NSDate`
* File => `PFFileObject`
* Pointer => other `PFObject`
* Relation => `PFRelation`
* Null => `NSNull`

Some examples:

<div class="language-toggle" markdown="1">
```objective_c
NSNumber *number = @42;
NSNumber *bool = @NO;
NSString *string = [NSString stringWithFormat:@"the number is %@", number];
NSDate *date = [NSDate date];
NSArray *array = @[string, number];
NSDictionary *dictionary = @{@"number": number, @"string": string};
NSNull *null = [NSNull null];
PFObject *pointer = [PFObject objectWithoutDataWithClassName:@"MyClassName" objectId:@"xyz"];

PFObject *bigObject = [PFObject objectWithClassName:@"BigObject"];
bigObject[@"myNumberKey"] = number;
bigObject[@"myBoolKey"] = bool;
bigObject[@"myStringKey"] = string;
bigObject[@"myDateKey"] = date;
bigObject[@"myArrayKey"] = array;
bigObject[@"myObjectKey"] = dictionary; // shows up as 'object' in the Data Browser
bigObject[@"anyKey"] = null; // this value can only be saved to an existing key
bigObject[@"myPointerKey"] = pointer; // shows up as Pointer MyClassName in the Data Browser
[bigObject saveInBackground];
```
```swift
let number = 42
let bool = false
let string = "the number is \(number)"
let date = NSDate()
let array = [string, number]
let dictionary = ["number": number, "string": string]
let null = NSNull()
let pointer = PFObject(objectWithoutDataWithClassName:"MyClassName", objectId: "xyz")

var bigObject = PFObject(className:"BigObject")
bigObject["myNumberKey"] = number
bigObject["myBooleanKey"] = bool
bigObject["myStringKey"] = string
bigObject["myDateKey"] = date
bigObject["myArrayKey"] = array
bigObject["myObjectKey"] = dictionary // shows up as 'object' in the Data Browser
bigObject["anyKey"] = null // this value can only be saved to an existing key
bigObject["myPointerKey"] = pointer // shows up as Pointer MyClassName in the Data Browser
bigObject.saveInBackground()
```
</div>

We do not recommend storing large pieces of binary data like images or documents on `PFObject`. We recommend you use `PFFileObject`s to store images, documents, and other types of files. You can do so by instantiating a `PFFileObject` object and setting it on a field. See [Files](#files) for more details.

For more information about how Parse handles data, check out our documentation on [Data](#data).

## Subclasses

Parse is designed to get you up and running as quickly as possible. You can access all of your data using the `PFObject` class and access any field with `objectForKey:` or the `[]` subscripting operator. In mature codebases, subclasses have many advantages, including terseness, extensibility, and support for autocomplete. Subclassing is completely optional, but can transform this code:

<div class="language-toggle" markdown="1">
```objective_c
PFObject *shield = [PFObject objectWithClassName:@"Armor"];
shield[@"displayName"] = @"Wooden Shield";
shield[@"fireProof"] = @NO;
shield[@"rupees"] = @50;
```
```swift
var shield = PFObject(className: "Armor")
shield["displayName"] = "Wooden Shield"
shield["fireProof"] = false
shield["rupees"] = 50
```
</div>

Into this:

<div class="language-toggle" markdown="1">
```objective_c
Armor *shield = [Armor object];
shield.displayName = @"Wooden Shield";
shield.fireProof = NO;
shield.rupees = 50;
```
```swift
var shield = Armor()
shield.displayName = "Wooden Shield"
shield.fireProof = false
shield.rupees = 50
```
</div>

### Subclassing PFObject

To create a subclass:

1.  Declare a subclass of `PFObject` which conforms to the `PFSubclassing` protocol.
2.  Implement the static method `parseClassName` and return the string you would pass to `initWithClassName:`. This makes all future class name references unnecessary.

Note: Objective-C developers should Import `PFObject+Subclass` in your .m file. This implements all methods in `PFSubclassing` beyond `parseClassName`.

### Properties & Methods

Adding custom properties and methods to your `PFObject` subclass helps encapsulate logic about the class. With `PFSubclassing`, you can keep all your logic about a subject in one place rather than using separate classes for business logic and storage/transmission logic.

`PFObject` supports dynamic synthesizers just like `NSManagedObject`. Declare a property as you normally would, but use `@dynamic` rather than `@synthesize` in your .m file. The following example creates a `displayName` property in the `Armor` class:

You can access the displayName property using `armor.displayName` or `[armor displayName]` and assign to it using `armor.displayName = @"Wooden Shield"` or `[armor setDisplayName:@"Wooden Sword"]`. Dynamic properties allow Xcode to provide autocomplete and catch typos.

`NSNumber` properties can be implemented either as `NSNumber`s or as their primitive counterparts. Consider the following example:

<div class="language-toggle" markdown="1">
```objective_c
@property BOOL fireProof;
@property int rupees;
```
```swift
@NSManaged var fireProof: Boolean
@NSManaged var rupees: Int
```
</div>

In this case, `game[@"fireProof"]` will return an `NSNumber` which is accessed using `boolValue` and `game[@"rupees"]` will return an `NSNumber` which is accessed using `intValue`, but the `fireProof` property is an actual `BOOL` and the `rupees` property is an actual `int`. The dynamic getter will automatically extract the `BOOL` or `int` value and the dynamic setter will automatically wrap the value in an `NSNumber`. You are free to use either format. Primitive property types are easier to use but `NSNumber` property types support nil values more clearly.

If you need more complicated logic than simple property access, you can declare your own methods as well:

<div class="language-toggle" markdown="1">
```objective_c
@dynamic iconFile;

- (UIImageView *)iconView {
  PFImageView *view = [[PFImageView alloc] initWithImage:kPlaceholderImage];
  view.file = self.iconFile;
  [view loadInBackground];
  
  return view;
}
```

```swift
@NSManaged var iconFile: PFFileObject!

func iconView() -> UIImageView {
  let view = PFImageView(imageView: PlaceholderImage)
  view.file = iconFile
  view.loadInBackground()
  
  return view
}
```
</div>

### Initializing Subclasses

You should initialize new instances of subclassses with standard initialization methods. To create a new instance of an existing Parse object, use the inherited `PFObject` class function `objectWithoutDataWithObjectId:`, or create a new object and set the objectId property manually.
