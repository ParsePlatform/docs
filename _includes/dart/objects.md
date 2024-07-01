# Objects

You can create a custom object like this:

```dart
var dietPlan = ParseObject('DietPlan')
	..set('Name', 'Ketogenic')
	..set('Fat', 65);

await dietPlan.save();
```

You can update an existing object via its `objectId`:

```dart
var dietPlan = ParseObject('DietPlan')
	..objectId = 'R5EonpUDWy'
	..set('Fat', 70);

await dietPlan.save();
```

Check the response to verify that the object has been successfully saved:

```dart
var response = await dietPlan.save();

if (response.success) {
   dietPlan = response.results.first;
}
```

## Supported Types

* String
* Double
* Int
* Boolean
* DateTime
* File
* Geopoint
* ParseObject/ParseUser (Pointer)
* Map
* List (all types supported)

## Object Methods

* Get
* GetAll
* Create
* Save
* Query - By object Id
* Delete
* Complex queries as shown above
* Pin
* Plenty more
* Counters
* Array Operators

## Custom Objects

You can create your own `ParseObjects` or convert your existing objects into `ParseObjects`:

```dart
class DietPlan extends ParseObject implements ParseCloneable {

  DietPlan() : super(_keyTableName);
  DietPlan.clone(): this();

  /// Mimic a clone due to Flutter not using reflection
  @override clone(Map map) => DietPlan.clone()..fromJson(map);

  static const String _keyTableName = 'Diet_Plans';
  static const String keyName = 'Name';
  
  String get name => get<String>(keyName);
  set name(String name) => set<String>(keyName, name);
}
  
```

When receiving a `ParseObject` you can often provide an instance of your custom object as an object copy. To always use your custom object class, register your subclass at the initialization of the SDK:

```dart
Parse().initialize(
   ...,
   registeredSubClassMap: <String, ParseObjectConstructor>{
     'Diet_Plans': () => DietPlan(),
   },
   parseUserConstructor: (username, password, emailAddress, {client, debug, sessionToken}) => CustomParseUser(username, password, emailAddress),
);
```

Additionally you can register `SubClasses` after the initialization of the SDK:

```dart
ParseCoreData().registerSubClass('Diet_Plans', () => DietPlan());
ParseCoreData().registerUserSubClass((username, password, emailAddress, {client, debug, sessionToken}) => CustomParseUser(username, password, emailAddress));
```

Providing a `ParseObject` as described above should still work, even if you have registered a different `SubClass`.

## Add Object Property

To add a new object property:

```dart
dietPlan.set<int>('RandomInt', 8);
var randomInt = dietPlan.get<int>('RandomInt');
```

## Pin Object

You can save an object by calling `.pin()`:

```dart
dietPlan.pin();
```

and to retrieve it

```dart
var dietPlan = DietPlan().fromPin('OBJECT ID OF OBJECT');
```

## Increment Counter Values

Retrieve it, call

```dart
var response = await dietPlan.increment("count", 1);
```

or using with save function

```dart
dietPlan.setIncrement('count', 1);
dietPlan.setDecrement('count', 1);
var response = dietPlan.save()
```

## Array Operator in Objects

Retrieve it, call

```dart
var response = await dietPlan.add("listKeywords", ["a", "a","d"]);

var response = await dietPlan.addUnique("listKeywords", ["a", "a","d"]);

var response = await dietPlan.remove("listKeywords", ["a"]);
```

or using with save function

```dart
dietPlan.setAdd('listKeywords', ['a','a','d']);
dietPlan.setAddUnique('listKeywords', ['a','a','d']);
dietPlan.setRemove('listKeywords', ['a']);
var response = dietPlan.save()
```

## Security for Objects - ParseACL

For any object, you can specify which users are allowed to read the object, and which users are allowed to modify an object.
To support this type of security, each object has an access control list, implemented by the `ParseACL` class.

If `ParseACL` is not specified (with the exception of the `ParseUser` class) all objects are set to Public for read and write.
The simplest way to use a `ParseACL` is to specify that an object may only be read or written by a single user.
To create such an object, there must first be a logged in `ParseUser`. Then, `new ParseACL(user)` generates a `ParseACL` that limits access to that user. An object’s ACL is updated when the object is saved, like any other property.

```dart
ParseUser user = await ParseUser.currentUser() as ParseUser;
ParseACL parseACL = ParseACL(owner: user);
  
ParseObject parseObject = ParseObject("TestAPI");
...
parseObject.setACL(parseACL);
var apiResponse = await parseObject.save();
```

Permissions can also be granted on a per-user basis. You can add permissions individually to a `ParseACL` using `setReadAccess` and `setWriteAccess`

```dart
ParseUser user = await ParseUser.currentUser() as ParseUser;
ParseACL parseACL = ParseACL();
// Grant total access to current user
parseACL.setReadAccess(userId: user.objectId, allowed: true);
parseACL.setWriteAccess(userId: user.objectId, allowed: true);
// Grant read access to userId: 'TjRuDjuSAO' 
parseACL.setReadAccess(userId: 'TjRuDjuSAO', allowed: true);
parseACL.setWriteAccess(userId: 'TjRuDjuSAO', allowed: false);

ParseObject parseObject = ParseObject("TestAPI");
...
parseObject.setACL(parseACL);
var apiResponse = await parseObject.save();
```

You can also grant permissions to all users at once using `setPublicReadAccess` and `setPublicWriteAccess`.

```dart
ParseACL parseACL = ParseACL();
parseACL.setPublicReadAccess(allowed: true);
parseACL.setPublicWriteAccess(allowed: true);

ParseObject parseObject = ParseObject("TestAPI");
...  
parseObject.setACL(parseACL);
var apiResponse = await parseObject.save();
```

Operations that are forbidden, such as deleting an object that you do not have write access to, result in a `ParseError` with code `101`: `ObjectNotFound`.

For security purposes, this prevents clients from distinguishing which object ids exist but are secured, versus which object ids do not exist at all.

You can retrieve the ACL list of an object using:

```dart
ParseACL parseACL = parseObject.getACL();
```

To set the ACL to `ParseRole` use:

```dart
parseACL.setReadAccess(userId: "role:ROLE_NAME", allowed: true);
parseACL.setWriteAccess(userId: "role:ROLE_NAME", allowed: true);
```