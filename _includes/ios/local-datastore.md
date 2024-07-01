# Local Datastore

The Parse iOS/OS X SDK provides a local datastore which can be used to store and retrieve `PFObject`s, even when the network is unavailable. To enable this functionality add `isLocalDatastoreEnabled = true` to the `ParseClientConfiguration` block used in `Parse.initialize()` or call `Parse.enableLocalDatastore()` prior to initializing Parse.

<div class="language-toggle" markdown="1">
```objective_c
@implementation AppDelegate

- (void)application:(UIApplication *)application didFinishLaunchWithOptions:(NSDictionary *)options {
    ParseClientConfiguration *configuration = [ParseClientConfiguration configurationWithBlock:^(id<ParseMutableClientConfiguration> configuration) {
        configuration.applicationId =  @"parseAppId";
        configuration.clientKey = @"parseClientKey";
        configuration.server = @"parseServerUrlString";
        configuration.localDatastoreEnabled = YES;
    }];
    [Parse initializeWithConfiguration:configuration];
}

@end
```
```swift
@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
        let parseConfig = ParseClientConfiguration {
            $0.isLocalDatastoreEnabled = true
            $0.applicationId = parseApplicationId
            $0.clientKey = parseClientKey
            $0.server = parseServerUrlString
        }
        Parse.initialize(with: parseConfig)
  }
}
```
</div>
There are a couple of side effects of enabling the local datastore that you should be aware of. When enabled, there will only be one instance of any given `PFObject`. For example, imagine you have an instance of the `"GameScore"` class with an `objectId` of `"xWMyZ4YEGZ"`, and then you issue a `PFQuery` for all instances of `"GameScore"` with that `objectId`. The result will be the same instance of the object you already have in memory.

Another side effect is that the current user and current installation will be stored in the local datastore, so you can persist unsaved changes to these objects between runs of your app using the methods below.

Calling the `saveEventually` method on a `PFObject` will cause the object to be pinned in the local datastore until the save completes. So now, if you change the current `PFUser` and call `[[PFUser currentUser] saveEventually]`, your app will always see the changes that you have made.

## Pinning

You can store a `PFObject` in the local datastore by pinning it. Pinning a `PFObject` is recursive, just like saving, so any objects that are pointed to by the one you are pinning will also be pinned. When an object is pinned, every time you update it by fetching or saving new data, the copy in the local datastore will be updated automatically. You don't need to worry about it at all.

<div class="language-toggle" markdown="1">
```objective_c
PFObject *gameScore = [PFObject objectWithClassName:@"GameScore"];
gameScore[@"score"] = @1337;
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
If you have multiple objects, you can pin them all at once with the `pinAllInBackground` convenience method.

<div class="language-toggle" markdown="1">
```objective_c
[PFObject pinAllInBackground:listOfObjects];
```
```swift
PFObject.pinAllInBackground(listOfObjects)
```
</div>

## Retrieving

Storing objects is great, but it's only useful if you can then get the objects back out later. Retrieving an object from the local datastore works just like retrieving one over the network. The only difference is calling the `fromLocalDatastore` method to tell the `PFQuery` where to look for its results.

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query fromLocalDatastore];
[query getObjectInBackgroundWithId:"" block:^(PFObject * _Nullable object, NSError * _Nullable error) {
    if (!error) {
        // Success
    } else {
        // Fail!
    }
}

  // task.result will be your game score
  return task;
}];
```

```swift
let query = PFQuery(className: "GameScore")
query.fromLocalDatastore()
query.getObjectInBackground(withId: "string") { (object, error) in
    if error == nil {
        // Success!
    } else {
    // Failure!
    }
}
```
</div>

## Querying the Local Datastore

Often, you'll want to find a whole list of objects that match certain criteria, instead of getting a single object by id. To do that, you can use a [PFQuery](#queries). Any `PFQuery` can be used with the local datastore just as with the network. The results will include any object you have pinned that matches the query. Any unsaved changes you have made to the object will be considered when evaluating the query. So you can find a local object that matches, even if it was never returned from the server for this particular query.

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query fromLocalDatastore];
[query whereKey:@"playerName" equalTo:@"Joe Bob"];
[[query findObjectsInBackground] continueWithBlock:^id(BFTask *task) {
  if (task.error) {
    NSLog(@"Error: %@", task.error);
    return task;
  }

  NSLog(@"Retrieved %d", task.result.count);
  return task;
}];
```
```swift
let query = PFQuery(className: "GameScore")
query.fromLocalDatastore()
query.whereKey("playerName", equalTo: "Joe Bob")
query.findObjectsInBackground().continueWithBlock {
    (task: BFTask!) -> AnyObject in
    if let error = task.error {
        print("Error: \(error)")
        return task
    }

    print("Retrieved \(task.result.count)")
    return task
}
```
</div>

## Security in Local Datastore

The same security model that applies to objects in Parse applies to objects in the Local Datastore. Read-write permissions are defined by `PFACL`s and a user cannot access or modify anything they don't have permission to.

The only difference is that you won't be able to access any data protected by Role based ACLs due to the fact that the Roles are stored on the server. To access this data protected by Role based ACLs, you will need to ignore ACLs when executing a Local Datastore query:

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [[[PFQuery queryWithClassName:@"Note"]
                   fromLocalDatastore]
                  ignoreACLs];
```
```swift
let query = PFQuery(className: "Note")
    .fromLocalDatastore
    .ignoreACLs
```
</div>


## Unpinning

When you are done with an object and no longer need it to be in the local datastore, you can simply unpin it. This will free up disk space on the device and keep your queries on the local datastore running quickly.

<div class="language-toggle" markdown="1">
```objective_c
[gameScore unpinInBackground];
```
```swift
gameScore.unpinInBackground()
```
</div>

There's also a method to unpin several objects at once.

<div class="language-toggle" markdown="1">
```objective_c
[PFObject unpinAllInBackground:listOfObjects];
```
```swift
PFObject.unpinAllInBackground(listOfObjects)
```
</div>

## Pinning with Labels

Manually pinning and unpinning each object individual is a bit like using `malloc` and `free`. It is a very powerful tool, but it can be difficult to manage what objects get stored in complex scenarios. For example, imagine you are making a game with separate high score lists for global high scores and your friends' high scores. If one of your friends happens to have a globally high score, you need to make sure you don't unpin them completely when you remove them from one of the cached queries. To make these scenarios easier, you can also pin with a label. Labels indicate a group of objects that should be stored together.

<div class="language-toggle" markdown="1">
```objective_c
// Add several objects with a label.
[PFObject pinAllInBackground:someGameScores withName:@"MyScores"];

// Add another object with the same label.
[anotherGameScore pinInBackgroundWithName:@"MyScores"];
```
```swift
// Add several objects with a label.
PFObject.pinAllInBackground(objects:someGameScores withName:"MyScores")

// Add another object with the same label.
anotherGameScore.pinInBackgroundWithName("MyScores")
```
</div>

To unpin all of the objects with the same label at the same time, you can pass a label to the unpin methods. This saves you from having to manually track which objects are in each group you care about.

<div class="language-toggle" markdown="1">
```objective_c
[PFObject unpinAllObjectsInBackgroundWithName:@"MyScores"];
```
```swift
PFObject.unpinAllObjectsInBackgroundWithName("MyScores")
```
</div>

Any object will stay in the datastore as long as it is pinned with any label. In other words, if you pin an object with two different labels, and then unpin it with one label, the object will stay in the datastore until you also unpin it with the other label.

## Caching Query Results

Pinning with labels makes it easy to cache the results of queries. You can use one label to pin the results of each different query. To get new results from the network, just do a query and update the pinned objects.

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query orderByDescending:@"score"];

// Query for new results from the network
[[query findObjectsInBackground] continueWithSuccessBlock:^id(BFTask *task) {
  return [[PFObject unpinAllObjectsInBackgroundWithName:@"HighScores"] continueWithSuccessBlock:^id(BFTask *ignored) {
    // Cache the new results.
    NSArray *scores = task.result;
    return [PFObject pinAllInBackground:scores withName:@"HighScores"];
  }];
}];
```
```swift
let query = PFQuery(className:"GameScore")
query.orderByDescending("score")

// Query for new results from the network
query.findObjectsInBackground().continueWithSuccessBlock({
    (task: BFTask!) -> AnyObject! in

    return PFObject.unpinAllObjectsInBackgroundWithName("HighScores").continueWithSuccessBlock({
        (ignored: BFTask!) -> AnyObject! in

        // Cache new results
        let scores = task.result as? NSArray
        return PFObject.pinAllInBackground(scores as [AnyObject], withName: "HighScores")
    })
})
```
</div>

When you want to get the cached results for the query, you can then
      run the same query against the local datastore.

<div class="language-toggle" markdown="1">
```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query fromLocalDatastore];
[query orderByDescending:@"score"];

[[query findObjectsInBackground] continueWithBlock:^id(BFTask *task) {
  if (task.error) {
    // Something went wrong.
    return task;
  }

  // Yay! Cached scores!
  return task;
}];
```
```swift
let query = PFQuery(className:"GameScore")
query.fromLocalDatastore()
query.orderByDescending("score")

query.findObjectsInBackground().continueWithBlock({
  (task: BFTask!) -> AnyObject! in
    if task.error != nil {
        // There was an error.
        return task
    }

    // Yay! Cached scores!
    return task
})
```
</div>

## Syncing Local Changes

Once you've saved some changes locally, there are a few different ways you can save those changes back to Parse over the network. The easiest way to do this is with `saveEventually`. When you call `saveEventually` on a `PFObject`, it will be pinned until it can be saved. The SDK will make sure to save the object the next time the network is available.

<div class="language-toggle" markdown="1">
```objective_c
[gameScore saveEventually];
```
```swift
gameScore.saveEventually()
```
</div>

If you'd like to have more control over the way objects are synced, you can keep them in the local datastore until you are ready to save them yourself using `saveInBackground`. To manage the set of objects that need to be saved, you can again use a label. The `fromPinWithName:` method on `PFQuery` makes it easy to fetch just the objects you care about.

```objective_c
PFQuery *query = [PFQuery queryWithClassName:@"GameScore"];
[query fromPinWithName:@"MyChanges"];
[[query findObjectsInBackground] continueWithBlock:^id(BFTask *task) {
  NSArray *scores = task.result;
  for (PFObject *score in scores) {
    [[score saveInBackground] continueWithSuccessBlock:^id(BFTask *task) {
      return [score unpinInBackground];
    }];
  }
  return task;
}];
```
```swift
let query = PFQuery(className:"GameScore")
query.fromPinWithName("MyChanges")
query.findObjectsInBackground().continueWithBlock({
  (task: BFTask!) -> AnyObject! in
  let scores = task.result as NSArray
  for score in scores {
    score.saveInBackground().continueWithSuccessBlock({
      (task: BFTask!) -> AnyObject! in
      return score.unpinInBackground()
    })
  }
  return task
})
```
</div>
