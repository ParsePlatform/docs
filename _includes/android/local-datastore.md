# Local Datastore

The Parse Android SDK provides a local datastore which can be used to store and retrieve `ParseObject`s, even when the network is unavailable. To enable this functionality, simply call `Parse.enableLocalDatastore()` before your call to `initialize`.

```java
import com.parse.Parse;
import android.app.Application;

public class App extends Application {
  @Override
  public void onCreate() {
    super.onCreate();

    Parse.enableLocalDatastore(this);
    Parse.initialize(this);
  }
}
```

If you use a `Parse.Configuration.Builder`, enable it there instead:

```java
Parse.initialize(new Parse.Configuration.Builder(context)
  .server(...)
  .applicationId(...)
  .enableLocalDataStore()
  .build());
```

There are a couple of side effects of enabling the local datastore that you should be aware of. When enabled, there will only be one instance of any given `ParseObject`. For example, imagine you have an instance of the `"GameScore"` class with an `objectId` of `"xWMyZ4YEGZ"`, and then you issue a `ParseQuery` for all instances of `"GameScore"` with that `objectId`. The result will be the same instance of the object you already have in memory.

Another side effect is that the current user and current installation will be stored in the local datastore, so you can persist unsaved changes to these objects between runs of your app using the methods below.

Calling the `saveEventually` method on a `ParseObject` will cause the object to be pinned in the local datastore until the save completes. So now, if you change the current `ParseUser` and call `ParseUser.getCurrentUser().saveEventually()`, your app will always see the changes that you have made.

## Pinning

You can store a `ParseObject` in the local datastore by pinning it. Pinning a `ParseObject` is recursive, just like saving, so any objects that are pointed to by the one you are pinning will also be pinned. When an object is pinned, every time you update it by fetching or saving new data, the copy in the local datastore will be updated
      automatically. You don't need to worry about it at all.

```java
ParseObject gameScore = new ParseObject("GameScore");
gameScore.put("score", 1337);
gameScore.put("playerName", "Sean Plott");
gameScore.put("cheatMode", false);

gameScore.pinInBackground();
```

If you have multiple objects, you can pin them all at once with the `pinAllInBackground` convenience method.

```java
ParseObject.pinAllInBackground(listOfObjects);
```

## Retrieving

Storing objects is great, but it's only useful if you can then get the objects back out later. To retrieve an object from the local datastore, call the `fromLocalDatastore` method to tell the `ParseQuery` where to look for its results.

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");
query.fromLocalDatastore();
```

The only difference is that you won’t be able to access any data protected by Role based ACLs due to the fact that the Roles are stored on the server. To access this data protected by Role based ACLs, you may need to ignore ACLs when executing a Local Datastore query by calling the `ignoreAcls` method on the query. Note that after calling this, you cannot subsequently use the same query to load from the network.

```java
// If data is protected by Role based ACLs:
query.ignoreAcls();
```

You can then retrieve objects as normal.

```java
query.getInBackground("xWMyZ4YE", new GetCallback<ParseObject>() {
    public void done(ParseObject object, ParseException e) {
        if (e == null) {
            // object will be your game score
        } else {
            // something went wrong
        }
    }
});
```

## Querying the Local Datastore

Often, you'll want to find a whole list of objects that match certain criteria, instead of getting a single object by id. To do that, you can use a [ParseQuery](#queries). Any `ParseQuery` can be used with the local datastore just as with the network. The results will include any object you have pinned that matches the query. Any unsaved changes you have made to the object will be considered when evaluating the query. So you can find a local object that matches, even if it was never returned from the server for this particular query.

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery("GameScore");
query.whereEqualTo("playerName", "Joe Bob");
query.fromLocalDatastore();
// If data is protected by Role based ACLs:
query.ignoreAcls();
query.findInBackground(new FindCallback<ParseObject>() {
    public void done(List<ParseObject> scoreList,
                     ParseException e) {
        if (e == null) {
            Log.d("score", "Retrieved " + scoreList.size());
        } else {
            Log.d("score", "Error: " + e.getMessage());
        }
    }
});
```

## Unpinning

When you are done with an object and no longer need it to be in the local datastore, you can simply unpin it. This will free up disk space on the device and keep your queries on the local datastore running quickly.

```java
gameScore.unpinInBackground();
```

There's also a method to unpin several objects at once.

```java
ParseObject.unpinAllInBackground(listOfObjects);
```

## Pinning with Labels

Manually pinning and unpinning each object individual is a bit like using `malloc` and `free`. It is a very powerful tool, but it can be difficult to manage what objects get stored in complex scenarios. For example, imagine you are making a game with separate high score lists for global high scores and your friends' high scores. If one of your friends happens to have a globally high score, you need to make sure you don't unpin them completely when you remove them from one of the cached queries. To make these scenarios easier, you can also pin with a label. Labels indicate a group of objects that should be stored together.

```java
// Add several objects with a label.
ParseObject.pinAllInBackground("MyScores", someGameScores);

// Add another object with the same label.
anotherGameScore.pinInBackground("MyScores");
```

To unpin all of the objects with the same label at the same time, you can pass a label to the unpin methods. This saves you from having to manually track which objects are in each group you care about.

```java
ParseObject.unpinAllInBackground("MyScores");
```

Any object will stay in the datastore as long as it is pinned with any label. In other words, if you pin an object with two different labels, and then unpin it with one label, the object will stay in the datastore until you also unpin it with the other label.

## Caching Query Results

Pinning with labels makes it easy to cache the results of queries. You can use one label to pin the results of each different query. To get new results from the network, just do a query and update the pinned objects.

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery(“GameScore");
query.orderByDescending(“score”);

// Query for new results from the network.
query.findInBackground(new FindCallback<ParseObject>() {
  public void done(final List<ParseObject> scores, ParseException e) {
    // Remove the previously cached results.
    ParseObject.unpinAllInBackground(“highScores”, new DeleteCallback() {
    public void done(ParseException e) {
      // Cache the new results.
      ParseObject.pinAllInBackground(“highScores”, scores);
    }
  });
  }
});
```

When you want to get the cached results for the query, you can then run the same query against the local datastore.

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery(“GameScore");
query.orderByDescending(“score”);
query.fromLocalDatastore();

query.findInBackground(new FindCallback<ParseObject>() {
  public void done(List<ParseObject> scores, ParseException e) {
    // Yay! Cached scores!
  }
});
```

## Syncing Local Changes

Once you've saved some changes locally, there are a few different ways you can save those changes back to Parse over the network. The easiest way to do this is with `saveEventually`. When you call `saveEventually` on a `ParseObject`, it will be pinned until it can be saved. The SDK will make sure to save the object the next time the network is available.

```java
gameScore.saveEventually();
```

If you'd like to have more control over the way objects are synced, you can keep them in the local datastore until you are ready to save them yourself using `saveInBackground`. To manage the set of objects that need to be saved, you can again use a label. The `fromPin` method on `ParseQuery` makes it easy to fetch just the objects you care about.

```java
ParseQuery<ParseObject> query = ParseQuery.getQuery(“GameScore");
query.fromPin(“MyChanges”);
query.findInBackground(new FindCallback<ParseObject>() {
  public void done(List<ParseObject> scores, ParseException e) {
    for (ParseObject score in scores) {
      score.saveInBackground();
      score.unpinInBackground(“MyChanges”);
    }
  }
});
```
