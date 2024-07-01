# Local Datastore

The Parse JS SDK (Version 2.2.0+) provides a local datastore which can be used to store and retrieve `Parse.Object`s. To enable this functionality, call `Parse.enableLocalDatastore()`.

There are a couple of side effects of enabling the local datastore that you should be aware of. When enabled, there will only be one instance of any given `Parse.Object`. For example, imagine you have an instance of the `"GameScore"` class with an `objectId` of `"xWMyZ4YEGZ"`, and then you issue a `Parse.Query` for all instances of `"GameScore"` with that `objectId`. The result will be the same instance of the object you already have in memory.

Also if you don't want to show the data in the local storage you can use [secure-ls](https://github.com/softvar/secure-ls) to Encrypt it.

```javascript
import SecureLS from 'secure-ls';
const ls = new SecureLS({ isCompression: false });

Parse.enableLocalDatastore();
Parse.setLocalDatastoreController({
  fromPinWithName: name => ls.get(name),
  pinWithName: (name, objects) => ls.set(name, JSON.stringify(objects)),
  unPinWithName: name => ls.remove(name),
  getAllContents: () => {
    let data = {};
    ls.getAllKeys().forEach((key) => {
      const value = ls.get(key).data;
      data[key] = value.includes('{') ? JSON.parse(value) : value;
    })
    return data;
  },
  clear: () => ls.removeAll()
});
```

## Pinning

You can store a `Parse.Object` in the local datastore by pinning it. Pinning a `Parse.Object` is recursive, just like saving, so any objects that are pointed to by the one you are pinning will also be pinned. When an object is pinned, every time you update it by fetching or saving new data, the copy in the local datastore will be updated automatically. You don't need to worry about it at all.

```javascript
const GameScore = Parse.Object.extend("GameScore");
const gameScore = new GameScore();

await gameScore.save();
await gameScore.pin();
```

If you have multiple objects, you can pin them all at once with the `Parse.Object.pinAll()` convenience method.

```javascript
await Parse.Object.pinAll(listOfObjects);
```

## Retrieving

Storing objects is great, but it's only useful if you can then get the objects back out later. Retrieving an object from the local datastore works just like retrieving one over the network. The only difference is calling the `fromLocalDatastore` method to tell the `Parse.Query` where to look for its results.

```javascript
const GameScore = Parse.Object.extend("GameScore");
const query = new Parse.Query(GameScore);
query.fromLocalDatastore();
const result = await query.get('xWMyZ4YE');
```

## Querying the Local Datastore

Often, you'll want to find a whole list of objects that match certain criteria, instead of getting a single object by id. To do that, you can use a [Parse.Query](#queries). Any `Parse.Query` can be used with the local datastore just as with the network. The results will include any object you have pinned that matches the query. Any unsaved changes you have made to the object will be considered when evaluating the query. So you can find a local object that matches, even if it was never returned from the server for this particular query. All query methods are supported except aggregate and distinct queries.

```javascript
const GameScore = Parse.Object.extend("GameScore");
const query = new Parse.Query(GameScore);
query.equalTo('playerName', 'Joe Bob');
query.fromLocalDatastore();
const results = await query.find();
```

## Unpinning

When you are done with an object and no longer need it to be in the local datastore, you can simply unpin it. This will free up disk space and keep your queries on the local datastore running quickly. This will unpin from the default pin.

```javascript
await gameScore.unPin();
```

There's also a method to unpin several objects at once.

```javascript
await Parse.Object.unPinAll(listOfObjects);
```

There's also a method to remove all objects from default pin

```javascript
await Parse.Object.unPinAllObjects();
```

## Pinning with Labels

Labels indicate a group of objects that should be stored together.

```javascript
// Add several objects with a label.
await Parse.Object.pinAllWithName('MyScores', listOfObjects);

// Add another object with the same label.
await anotherGameScore.pinWithName('MyScores');
```

To unpin all of the objects with the same label at the same time, you can pass a label to the unpin methods. This saves you from having to manually track which objects are in each group.

```javascript
await Parse.Object.unPinAllWithName('MyScores', listOfObjects);
```

There's also a method to remove all objects from a label.

```javascript
await Parse.Object.unPinAllObjectsWithName('MyScores');
```

An Object will be kept in the datastore as long as it is pinned by at least one label. So an object pinned with two labels will stay in the datastore if one of the two labels is unpinned.

## Caching Query Results

Pinning with labels makes it easy to cache the results of queries. You can use one label to pin the results of each different query. To get new results from the network, just do a query and update the pinned objects.

```javascript
const GameScore = Parse.Object.extend("GameScore");
const query = new Parse.Query(GameScore);
query.equalTo("playerName", "foo");
const results = await query.find();
await Parse.Object.unPinAllObjectsWithName('HighScores');
await Parse.Object.pinAllWithName('HighScores', results);
```

When you want to get the cached results for the query, you can then run the same query against the local datastore.

```javascript
const GameScore = Parse.Object.extend("GameScore");
const query = new Parse.Query(GameScore);
query.equalTo("playerName", "foo");
query.fromLocalDatastore();
const results = await query.find();
```

## Dumping Contents

For testing purposes, you can use `Parse.dumpLocalDatastore()` to view the contents of your local datastore.

```javascript
const LDS = await Parse.dumpLocalDatastore();
```

The local datastore is a dictionary of key / values. Each object has a key (className_objectId) and serves as a reference to this object.

`pin()` will save this reference under the default pin `_default`
`pinWithName('YourPinName')` will save this reference under `parsePin_YourPinName`

Unpinning will have the opposite effect.

## LiveQuery

If you are subscribed to a LiveQuery Update Event, the updated object will be stored in the LocalDatastore if pinned.

```javascript
const gameScore = new GameScore();
await gameScore.save();
await gameScore.pin();
const query = new Parse.Query(GameScore);
query.equalTo('objectId', gameScore.id)
const subscription = query.subscribe();
subscription.on('update', (object) => {
  // Since object (gameScore) is pinned, LDS will update automatically
});
```
