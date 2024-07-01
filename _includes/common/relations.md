# Relations

There are three kinds of relationships. One-to-one relationships enable one object to be associated with another object. One-to-many relationships enable one object to have many related objects. Finally, many-to-many relationships enable complex relationships among many objects.

There are four ways to build relationships in Parse:

## One-to-Many

When you’re thinking about one-to-many relationships and whether to implement Pointers or Arrays, there are several factors to consider. First, how many objects are involved in this relationship? If the "many" side of the relationship could contain a very large number (greater than 100 or so) of objects, then you have to use Pointers. If the number of objects is small (fewer than 100 or so), then Arrays may be more convenient, especially if you typically need to get all of the related objects (the "many" in the "one-to-many relationship") at the same time as the parent object.

### Using Pointers

Let's say we have a game app. The game keeps track of the player's score and achievements every time she chooses to play. In Parse, we can store this data in a single `Game` object. If the game becomes incredibly successful, each player will store thousands of `Game` objects in the system. For circumstances like this, where the number of relationships can be arbitrarily large, Pointers are the best option.

Suppose in this game app, we want to make sure that every `Game` object is associated with a Parse User. We can implement this like so:

{% if page.language == "java" %}
```java
ParseObject game = new ParseObject("Game");
game.put("createdBy", ParseUser.getCurrentUser());
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
PFObject *game= [PFObject objectWithClassName:@"Game"];
[game setObject:[PFUser currentUser] forKey:@"createdBy"];
```
```swift
let game = PFObject(className:"Game")
game["createdBy"] = PFUser.currentUser()
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
$game = ParseObject::create("Game");

$game->set("createdBy", ParseUser::getCurrentUser());
```
{% endif %}

{% if page.language == "cs" %}
```cs
var game = new ParseObject("Game");
game["createdBy"] = ParseUser.CurrentUser;
```
{% endif %}

{% if page.language == "js" %}
```js
var game = new Parse.Object("Game");
game.set("createdBy", Parse.User.current());
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

We can obtain all of the `Game` objects created by a Parse User with a query:

{% if page.language == "java" %}
```java
ParseQuery<ParseObject> gameQuery = ParseQuery.getQuery("Game");
gameQuery.whereEqualTo("createdBy", ParseUser.getCurrentUser());
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
PFQuery *gameQuery = [PFQuery queryWithClassName:@"Game"];
[gameQuery whereKey:@"createdBy" equalTo:[PFUser currentUser]];
```
```swift
let gameQuery = PFQuery(className:"Game")
if let user = PFUser.currentUser() {
  gameQuery.whereKey("createdBy", equalTo: user)
}
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
$gameQuery = new ParseQuery("Game");

$gameQuery->equalTo("createdBy", ParseUser::getCurrentUser());
```
{% endif %}

{% if page.language == "cs" %}
```cs
var query = ParseObject.getQuery("Game").WhereEqualTo("createdBy", ParseUser.CurrentUser);
```
{% endif %}

{% if page.language == "js" %}
```js
var query = new Parse.Query("Game");
query.equalTo("createdBy", Parse.User.current());
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

And, if we want to find the Parse User who created a specific `Game`, that is a lookup on the `createdBy` key:

{% if page.language == "java" %}
```java
// say we have a Game object
ParseObject game = ...

// getting the user who created the Game
ParseUser createdBy = game.getUser("createdBy");
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// say we have a Game object
PFObject *game = ...

// getting the user who created the Game
PFUser *createdBy = [game objectForKey@"createdBy"];
```
```swift
// say we have a Game object
let game = ...

// getting the user who created the Game
let createdBy = game["createdBy"]
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// say we have a Game object
$game = ...

// getting the user who created the Game
$user = $game->get("createdBy");
```
{% endif %}

{% if page.language == "cs" %}
```cs
// say we have a Game object
ParseObject game = ...

// getting the user who created the Game
ParseUser user = game["createdBy"];
```
{% endif %}

{% if page.language == "js" %}
```js
// say we have a Game object
var game = ...

// getting the user who created the Game
var user = game.get("createdBy");
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

For most scenarios, Pointers will be your best bet for implementing one-to-many relationships.

### Using Arrays

Arrays are ideal when we know that the number of objects involved in our one-to-many relationship are going to be small. Arrays will also provide some productivity benefit via the `includeKey` parameter. Supplying the parameter will enable you to obtain all of the "many" objects in the "one-to-many" relationship at the same time that you obtain the "one" object. However, the response time will be slower if the number of objects involved in the relationship turns out to be large.

Suppose in our game, we enabled players to keep track of all the weapons their character has accumulated as they play, and there can only be a dozen or so weapons. In this example, we know that the number of weapons is not going to be very large. We also want to enable the player to specify the order in which the weapons will appear on screen. Arrays are ideal here because the size of the array is going to be small and because we also want to preserve the order the user has set each time they play the game:

Let's start by creating a column on our Parse User object called `weaponsList`.

Now let's store some `Weapon` objects in the `weaponsList`:

{% if page.language == "java" %}
```java
// let's say we have four weapons
ParseObject scimitar = ...
ParseObject plasmaRifle = ...
ParseObject grenade = ...
ParseObject bunnyRabbit = ...

// stick the objects in an array
ArrayList<ParseObject> weapons = new ArrayList<ParseObject>();
weapons.add(scimitar);
weapons.add(plasmaRifle);
weapons.add(grenade);
weapons.add(bunnyRabbit);

// store the weapons for the user
ParseUser.getCurrentUser().put("weaponsList", weapons);
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// let's say we have four weapons
PFObject *scimitar = ...
PFObject *plasmaRifle = ...
PFObject *grenade = ...
PFObject *bunnyRabbit = ...

// stick the objects in an array
NSArray *weapons = @[scimitar, plasmaRifle, grenade, bunnyRabbit];

// store the weapons for the user
[[PFUser currentUser] setObject:weapons forKey:@weaponsList"];
```
```swift
// let's say we have four weapons
let scimitar = ...
let plasmaRifle = ...
let grenade = ...
let bunnyRabbit = ...

// stick the objects in an array
let weapons = [scimitar, plasmaRifle, grenade, bunnyRabbit]

// store the weapons for the user
let user = PFUser.currentUser()
user["weaponsList"] = weapons
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// let's say we have four weapons
$scimitar = ...
$plasmaRifle = ...
$grenade = ...
$bunnyRabbit = ...

// stick the objects in an array
$weapons = [$scimitar, $plasmaRifle, $grenade, $bunnyRabbit];

// store the weapons for the user
$user = ParseUser::getCurrentUser();
$user->set("weaponsList", weapons);
```
{% endif %}

{% if page.language == "cs" %}
```cs
// let's say we have four weapons
var scimitar = ...
var plasmaRifle = ...
var grenade = ...
var bunnyRabbit = ...

// stick the objects in an array
var weapons = new List<ParseObject>();
weapons.Add(scimitar);
weapons.Add(plasmaRifle);
weapons.Add(grenade);
weapons.Add(bunnyRabbit);

// store the weapons for the user
var user = ParseUser.CurrentUser;
user.AddRangeToList("weaponsList", weapons);
```
{% endif %}

{% if page.language == "js" %}
```js
// let's say we have four weapons
var scimitar = ...
var plasmaRifle = ...
var grenade = ...
var bunnyRabbit = ...

// stick the objects in an array
var weapons = [scimitar, plasmaRifle, grenade, bunnyRabbit];

// store the weapons for the user
var user = Parse.User.current();
user.set("weaponsList", weapons);
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

Later, if we want to retrieve the `Weapon` objects, it's just one line of code:

{% if page.language == "java" %}
```java
ArrayList<ParseObject> weapons = ParseUser.getCurrentUser().get("weaponsList");
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
NSArray *weapons = [[PFUser currentUser] objectForKey:@"weaponsList"];
```
```swift
let weapons = PFUser.currentUser()?.objectForKey("weaponsList")
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
$weapons = ParseUser::getCurrentUser()->get("weaponsList");
```
{% endif %}

{% if page.language == "cs" %}
```cs
var weapons = ParseUser.CurrentUser.Get<IList<Object>>("weaponsList");
```
{% endif %}

{% if page.language == "js" %}
```js
var weapons = Parse.User.current().get("weaponsList")
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

Sometimes, we will want to fetch the "many" objects in our one-to-many relationship at the same time as we fetch the "one" object. One trick we could employ is to use the `includeKey` (or `include` in Android) parameter whenever we use a Parse Query to also fetch the array of `Weapon` objects (stored in the `weaponsList` column) along with the Parse User object:

{% if page.language == "java" %}
```java
// set up our query for a User object
ParseQuery<ParseUser> userQuery = ParseUser.getQuery();

// configure any constraints on your query...
// for example, you may want users who are also playing with or against you
// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
userQuery.include("weaponsList");

// execute the query
userQuery.findInBackground(new FindCallback<ParseUser>() {
  public void done(List<ParseUser> userList, ParseException e) {
    // userList contains all of the User objects, and their associated Weapon objects, too
  }
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// set up our query for a User object
PFQuery *userQuery = [PFUser query];

// configure any constraints on your query...
// for example, you may want users who are also playing with or against you

// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
[userQuery includeKey:@"weaponsList"];

// execute the query
[userQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects contains all of the User objects, and their associated Weapon objects, too
}];
```
```swift
// set up our query for a User object
let userQuery = PFUser.query();

// configure any constraints on your query...
// for example, you may want users who are also playing with or against you

// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
userQuery?.includeKey("weaponsList");

// execute the query
userQuery?.findObjectsInBackgroundWithBlock {
    (objects: [AnyObject]?, error: NSError?) -> Void in
    // objects contains all of the User objects, and their associated Weapon objects, too
}
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// set up our query for a User object
$userQuery = ParseUser::query();

// configure any constraints on your query...
// for example, you may want users who are also playing with or against you

// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
$userQuery->includeKey("weaponsList");

// execute the query
$results = $userQuery->find();
// results contains all of the User objects, and their associated Weapon objects, too
```
{% endif %}

{% if page.language == "cs" %}
```cs
// set up our query for a User object
var userQuery = ParseUser.Query;

// configure any constraints on your query...
// for example, you may want users who are also playing with or against you

// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
userQuery = userQuery.Include("weaponsList");

// execute the query
IEnumerable<ParseUser> results = await userQuery.FindAsync();
// results contains all of the User objects, and their associated Weapon objects, too
```
{% endif %}

{% if page.language == "js" %}
```js
// set up our query for a User object
var userQuery = new Parse.Query(Parse.User);

// configure any constraints on your query...
// for example, you may want users who are also playing with or against you

// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
userQuery.include("weaponsList");

// execute the query
// results contains all of the User objects, and their associated Weapon objects, too
const results = await userQuery.find();
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

You can also get the "one" side of the one-to-many relationship from the "many" side. For example, if we want to find all Parse User objects who also have a given `Weapon`, we can write a constraint for our query like this:

{% if page.language == "java" %}
```java
// add a constraint to query for whenever a specific Weapon is in an array
userQuery.whereEqualTo("weaponsList", scimitar);

// or query using an array of Weapon objects...
userQuery.whereEqualTo("weaponsList", arrayOfWeapons);
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// add a constraint to query for whenever a specific Weapon is in an array
[userQuery whereKey:@"weaponsList" equalTo:scimitar];

// or query using an array of Weapon objects...
[userQuery whereKey:@"weaponsList" containedIn:arrayOfWeapons];
```
```swift
// add a constraint to query for whenever a specific Weapon is in an array
userQuery?.whereKey("weaponsList", equalTo: scimitar);

// or query using an array of Weapon objects...
userQuery?.whereKey("weaponsList", containedIn: arrayOfWeapons)
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// add a constraint to query for whenever a specific Weapon is in an array
$userQuery->equalTo("weaponsList", $scimitar);

// or query using an array of Weapon objects...
$userQuery->containedIn("weaponsList", $arrayOfWeapons);
```
{% endif %}

{% if page.language == "cs" %}
```cs
// add a constraint to query for whenever a specific Weapon is in an array
userQuery = userQuery.WhereEqualTo("weaponsList", scimitar);

// or query using an array of Weapon objects...
userQuery = userQuery.WhereContainedIn("weaponsList", arrayOfWeapons);
```
{% endif %}

{% if page.language == "js" %}
```js
// add a constraint to query for whenever a specific Weapon is in an array
userQuery.equalTo("weaponsList", scimitar);

// or query using an array of Weapon objects...
userQuery.containedIn("weaponsList", arrayOfWeapons);
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

## Many-to-Many

Now let’s tackle many-to-many relationships. Suppose we had a book reading app and we wanted to model `Book` objects and `Author` objects. As we know, a given author can write many books, and a given book can have multiple authors. This is a many-to-many relationship scenario where you have to choose between Arrays, Parse Relations, or creating your own Join Table.

The decision point here is whether you want to attach any metadata to the relationship between two entities. If you don’t, Parse Relation or using Arrays are going to be the easiest alternatives. In general, using arrays will lead to higher performance and require fewer queries. If either side of the many-to-many relationship could lead to an array with more than 100 or so objects, then, for the same reason Pointers were better for one-to-many relationships, Parse Relation or Join Tables will be better alternatives.

On the other hand, if you want to attach metadata to the relationship, then create a separate table (the "Join Table") to house both ends of the relationship. Remember, this is information **about the relationship**, not about the objects on either side of the relationship. Some examples of metadata you may be interested in, which would necessitate a Join Table approach, include:

### Using Parse Relations

Using Parse Relations, we can create a relationship between a `Book` and a few `Author` objects. In the Data Browser, you can create a column on the `Book` object of type relation and name it `authors`.

After that, we can associate a few authors with this book:

{% if page.language == "java" %}
```java
// let’s say we have a few objects representing Author objects
ParseObject authorOne =
ParseObject authorTwo =
ParseObject authorThree =

// now we create a book object
ParseObject book = new ParseObject("Book");

// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
ParseRelation<ParseObject> relation = book.getRelation("authors");
relation.add(authorOne);
relation.add(authorTwo);
relation.add(authorThree);

// now save the book object
book.saveInBackground();
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// let’s say we have a few objects representing Author objects
PFObject *authorOne = …
PFObject *authorTwo = …
PFObject *authorThree = …

// now we create a book object
PFObject *book= [PFObject objectWithClassName:@"Book"];

// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
PFRelation *relation = [book relationForKey:@"authors"];
[relation addObject:authorOne];
[relation addObject:authorTwo];
[relation addObject:authorThree];

// now save the book object
[book saveInBackground];
```
```swift
// let’s say we have a few objects representing Author objects
let authorOne = ...
let authorTwo = ...
let authorThree = ...

// now we create a book object
let book = PFObject(className: "Book")

// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
let relation = book.relationForKey("authors")
relation.addObject(authorOne)
relation.addObject(authorTwo)
relation.addObject(authorThree)

// now save the book object
book.saveInBackground()
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// let’s say we have a few objects representing Author objects
$authorOne = ...
$authorTwo = ...
$authorThree = ...

// now we create a book object
$book = new ParseObject("Book");

// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
$relation = $book->getRelation("authors");
$relation->add($authorOne);
$relation->add($authorTwo);
$relation->add($authorThree);

// now save the book object
$book->save();
```
{% endif %}

{% if page.language == "cs" %}
```cs
// let’s say we have a few objects representing Author objects
var authorOne = ...
var authorTwo = ...
var authorThree = ...

// now we create a book object
var book = new ParseObject("Book");

// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
var relation = book.GetRelation<ParseObject>("authors");
relation.Add(authorOne);
relation.Add(authorTwo);
relation.Add(authorThree);

// now save the book object
await book.SaveAsync();
```
{% endif %}

{% if page.language == "js" %}
```js
// let’s say we have a few objects representing Author objects
var authorOne = ...
var authorTwo = ...
var authorThree = ...

// now we create a book object
var book = new Parse.Object("Book");

// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
var relation = book.relation("authors");
relation.add(authorOne);
relation.add(authorTwo);
relation.add(authorThree);

// now save the book object
book.save();
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

To get the list of authors who wrote a book, create a query:

{% if page.language == "java" %}
```java
// suppose we have a book object
ParseObject book = ...

// create a relation based on the authors key
ParseRelation relation = book.getRelation("authors");

// generate a query based on that relation
ParseQuery query = relation.getQuery();

// now execute the query
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// suppose we have a book object
PFObject *book = ...

// create a relation based on the authors key
PFRelation *relation = [book relationForKey:@"authors"];

// generate a query based on that relation
PFQuery *query = [relation query];

// now execute the query
```
```swift
// suppose we have a book object
let book = ...

// create a relation based on the authors key
let relation = book.relationForKey("authors")

// generate a query based on that relation
let query = relation.query()

// now execute the query
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// suppose we have a book object
$book = ...

// create a relation based on the authors key
$relation = $book->getRelation("authors");

// generate a query based on that relation
$query = $relation->getQuery();

// now execute the query
```
{% endif %}

{% if page.language == "cs" %}
```cs
// suppose we have a book object
var book = ...

// create a relation based on the authors key
var relation = book.GetRelation<ParseObject>("authors");

// generate a query based on that relation
var query = relation.Query;

// now execute the query
```
{% endif %}

{% if page.language == "js" %}
```js
// suppose we have a book object
var book = ...

// create a relation based on the authors key
var relation = book.relation("authors");

// generate a query based on that relation
var query = relation.query();

// now execute the query
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

Perhaps you even want to get a list of all the books to which an author contributed. You can create a slightly different kind of query to get the inverse of the relationship:

{% if page.language == "java" %}
```java
// suppose we have a author object, for which we want to get all books
ParseObject author = ...

// first we will create a query on the Book object
ParseQuery<ParseObject> query = ParseQuery.getQuery("Book");

// now we will query the authors relation to see if the author object we have
// is contained therein
query.whereEqualTo("authors", author);
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// suppose we have a author object, for which we want to get all books
PFObject *author = ...

// first we will create a query on the Book object
PFQuery *query = [PFQuery queryWithClassName:@"Book"];

// now we will query the authors relation to see if the author object
// we have is contained therein
[query whereKey:@"authors" equalTo:author];
```
```swift
// suppose we have a author object, for which we want to get all books
let author = ...

// first we will create a query on the Book object
let query = PFQuery(className: "Book")

// now we will query the authors relation to see if the author object
// we have is contained therein
query?.whereKey("authors", equalTo: author)
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// suppose we have a author object, for which we want to get all books
$author = ...

// first we will create a query on the Book object
$query = new ParseQuery("Book");

// now we will query the authors relation to see if the author object we have
// is contained therein
$query->equalTo("authors", $author);
```
{% endif %}

{% if page.language == "cs" %}
```cs
// suppose we have a author object, for which we want to get all books
var author = ...

// first we will create a query on the Book object
var query = ParseObject.GetQuery("Book");

// now we will query the authors relation to see if the author object we have
// is contained therein
query = query.WhereEqualTo("authors", author);
```
{% endif %}

{% if page.language == "js" %}
```js
// suppose we have a author object, for which we want to get all books
var author = ...

// first we will create a query on the Book object
var query = new Parse.Query("Book");

// now we will query the authors relation to see if the author object we have
// is contained therein
query.equalTo("authors", author);
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

### Using Join Tables

There may be certain cases where we want to know more about a relationship. For example, suppose we were modeling a following/follower relationship between users: a given user can follow another user, much as they would in popular social networks. In our app, we not only want to know if User A is following User B, but we also want to know **when** User A started following User B. This information could not be contained in a Parse Relation. In order to keep track of this data, you must create a separate table in which the relationship is tracked. This table, which we will call `Follow`, would have a `from` column and a `to` column, each with a pointer to a Parse User. Alongside the relationship, you can also add a column with a `Date` object named `date`.

Now, when you want to save the following relationship between two users, create a row in the `Follow` table, filling in the `from`, `to`, and `date` keys appropriately:

{% if page.language == "java" %}
```java
// suppose we have a user we want to follow
ParseUser otherUser = ...

// create an entry in the Follow table
ParseObject follow = new ParseObject("Follow");
follow.put("from", ParseUser.getCurrentUser());
follow.put("to", otherUser);
follow.put("date", Date());
follow.saveInBackground();
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// suppose we have a user we want to follow
PFUser *otherUser = ...

// create an entry in the Follow table
PFObject *follow = [PFObject objectWithClassName:@"Follow"];
[follow setObject:[PFUser currentUser]  forKey:@"from"];
[follow setObject:otherUser forKey:@"to"];
[follow setObject:[NSDate date] forKey@"date"];
[follow saveInBackground];
```
```swift
// suppose we have a user we want to follow
let otherUser = ...

// create an entry in the Follow table
let follow = PFObject(className: "Follow")
follow.setObject(PFUser.currentUser()!, forKey: "from")
follow.setObject(otherUser, forKey: "to")
follow.setObject(NSDate(), forKey: "date")
follow.saveInBackground()
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// suppose we have a user we want to follow
$otherUser = ...

// create an entry in the Follow table
$follow = new ParseObject("Follow");
$follow->set("from", ParseUser::getCurrentUser());
$follow->set("to", $otherUser);
$follow->set("date", new DateTime());
$follow->save();
```
{% endif %}

{% if page.language == "cs" %}
```cs
// suppose we have a user we want to follow
ParseUser otherUser = ...

// create an entry in the Follow table
var follow = new ParseObject("Follow");
follow["from"] = ParseUser.CurrentUser;
follow["to"] = otherUser;
follow["date"] = DateTime.UtcNow;
await follow.SaveAsync();
```
{% endif %}

{% if page.language == "js" %}
```js
var otherUser = ...

// create an entry in the Follow table
var follow = new Parse.Object("Follow");
follow.set("from", Parse.User.current());
follow.set("to", otherUser);
follow.set("date", Date());
follow.save();
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

If we want to find all of the people we are following, we can execute a query on the `Follow` table:

{% if page.language == "java" %}
```java
// set up the query on the Follow table
ParseQuery<ParseObject> query = ParseQuery.getQuery("Follow");
query.whereEqualTo("from", ParseUser.getCurrentUser());

// execute the query
query.findInBackground(newFindCallback<ParseObject>() {
    public void done(List<ParseObject> followList, ParseException e) {

    }
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// set up the query on the Follow table
PFQuery *query = [PFQuery queryWithClassName:@"Follow"];
[query whereKey:@"from" equalTo:[PFUser currentUser]];

// execute the query
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  for(PFObject *o in objects) {
    // o is an entry in the Follow table
    // to get the user, we get the object with the to key
    PFUser *otherUser = [o objectForKey@"to"];

    // to get the time when we followed this user, get the date key
    PFObject *when = [o objectForKey@"date"];
  }
}];
```
```swift
// set up the query on the Follow table
let query = PFQuery(className: "Follow")
query.whereKey("from", equalTo: PFUser.currentUser()!)

// execute the query
query.findObjectsInBackgroundWithBlock{
	(objects: [AnyObject]?, error: NSError?) -> Void in
    if let objects = objects {
        for o in objects {
            // o is an entry in the Follow table
            // to get the user, we get the object with the to key
            let otherUse = o.objectForKey("to") as? PFUser

            // to get the time when we followed this user, get the date key
            let when = o.objectForKey("date") as? PFObject
        }
    }
}
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// set up the query on the Follow table
$query = new ParseQuery("Follow");
$query->equalTo("from", ParseUser::getCurrentUser());

// execute the query
$results = $query->find();
```
{% endif %}

{% if page.language == "cs" %}
```cs
// set up the query on the Follow table
ParseQuery<ParseObject> query = ParseQuery.getQuery("Follow");
query = query.WhereEqualTo("from", ParseUser.CurrentUser);

// execute the query
IEnumerable<ParseObject> results = await query.FindAsync();
```
{% endif %}

{% if page.language == "js" %}
```js
const query = new Parse.Query("Follow");
query.equalTo("from", Parse.User.current());
const users = await query.find();
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

It’s also pretty easy to find all the users that are following the current user by querying on the `to` key:

{% if page.language == "java" %}
```java
// set up the query on the Follow table
ParseQuery<ParseObject> query = ParseQuery.getQuery("Follow");
query.whereEqualTo("to", ParseUser.getCurrentUser());

// execute the query
query.findInBackground(newFindCallback<ParseObject>() {
    public void done(List<ParseObject> followList, ParseException e) {

    }
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// set up the query on the Follow table
PFQuery *query = [PFQuery queryWithClassName:@"Follow"];
[query whereKey:@"to" equalTo:[PFUser currentUser]];

[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  for(PFObject *o in objects) {
     // o is an entry in the Follow table
     // to get the user, we get the object with the from key
    PFUser *otherUser = [o objectForKey@"from"];

    // to get the time the user was followed, get the date key
    PFObject *when = [o objectForKey@"date"];
  }
}];
```
```swift
// set up the query on the Follow table
let query = PFQuery(className: "Follow")
query.whereKey("to", equalTo: PFUser.currentUser()!)

query.findObjectsInBackgroundWithBlock{
	(objects: [AnyObject]?, error: NSError?) -> Void in
    if let objects = objects {
        for o in objects {
            // o is an entry in the Follow table
            // to get the user, we get the object with the to key
            let otherUse = o.objectForKey("to") as? PFUser

            // to get the time when we followed this user, get the date key
            let when = o.objectForKey("date") as? PFObject
        }

    }
}
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// create an entry in the Follow table
$query = new ParseQuery("Follow");
$query->equalTo("to", ParseUser::getCurrentUser());
$results = $query->find();
```
{% endif %}

{% if page.language == "cs" %}
```cs
// create an entry in the Follow table
var query = ParseObject.GetQuery("Follow")
    .WhereEqualTo("to", ParseUser.CurrentUser);
IEnumerable<ParseObject> results = await query.FindAsync();
```
{% endif %}

{% if page.language == "js" %}
```js
// create an entry in the Follow table
const query = new Parse.Query("Follow");
query.equalTo("to", Parse.User.current());
const users = query.find();
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

### Using an Array

Arrays are used in Many-to-Many relationships in much the same way that they are for One-to-Many relationships. All objects on one side of the relationship will have an Array column containing several objects on the other side of the relationship.

Suppose we have a book reading app with `Book` and `Author` objects. The `Book` object will contain an Array of `Author` objects (with a key named `authors`). Arrays are a great fit for this scenario because it's highly unlikely that a book will have more than 100 or so authors. We will put the Array in the `Book` object for this reason. After all, an author could write more than 100 books.

Here is how we save a relationship between a `Book` and an `Author`.

{% if page.language == "java" %}
```java
// let's say we have an author
ParseObject author = ...

// and let's also say we have an book
ParseObject book = ...

// add the author to the authors list for the book
book.put("authors", author);
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// let's say we have an author
PFObject *author = ...

// and let's also say we have an book
PFObject *book = ...

// add the author to the authors list for the book
[book addObject:author forKey:@"authors"];
```
```swift
// let's say we have an author
let author = ...

// and let's also say we have an book
let book = ...

// add the author to the authors list for the book
book.addObject(author, forKey: "authors")
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// let's say we have an author
$author = ...

// and let's also say we have an book
$book = ...

// add the author to the authors list for the book
$book->addUnique("authors", array($author));
```
{% endif %}

{% if page.language == "cs" %}
```cs
// let's say we have an author
var author = ...

// and let's also say we have an book
var book = ...

// add the author to the authors list for the book
book.AddToList("authors", author);
```
{% endif %}

{% if page.language == "js" %}
```js
// let's say we have an author
var author = ...

// and let's also say we have an book
var book = ...

// add the author to the authors list for the book
book.add("authors", author);
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

Because the author list is an Array, you should use the `includeKey` (or `include` on Android) parameter when fetching a `Book` so that Parse returns all the authors when it also returns the book:

{% if page.language == "java" %}
```java
// set up our query for the Book object
ParseQuery bookQuery = ParseQuery.getQuery("Book");

// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
bookQuery.include("authors");

// execute the query
bookQuery.findInBackground(newFindCallback<ParseObject>() {
    public void done(List<ParseObject> bookList, ParseException e) {
    }
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// set up our query for the Book object
PFQuery *bookQuery = [PFQuery queryWithClassName:@"Book"];

// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
[bookQuery includeKey:@"authors"];

// execute the query
[bookQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects is all of the Book objects, and their associated
    // Author objects, too
}];
```
```swift
// set up our query for the Book object
let bookQuery = PFQuery(className: "Book")

// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
bookQuery.includeKey("authors")

// execute the query
bookQuery.findObjectsInBackgroundWithBlock{
    (objects: [AnyObject]?, error: NSError?) -> Void in
    // objects is all of the Book objects, and their associated
    // Author objects, too
}
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// set up our query for the Book object
$bookQuery = new ParseQuery("Book");

// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
$bookQuery->includeKey("authors");

// execute the query
$books= $bookQuery->find();
```
{% endif %}

{% if page.language == "cs" %}
```cs
// set up our query for the Book object
var bookQuery = ParseObject.GetQuery("Book");

// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
bookQuery = bookQuery.Include("authors");

// execute the query
IEnumerable<ParseObject> books= await bookQuery.FindAsync();
```
{% endif %}

{% if page.language == "js" %}
```js
// set up our query for the Book object
const bookQuery = new Parse.Query("Book");

// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
bookQuery.include("authors");

// execute the query
const books = await bookQuery.find();
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

At that point, getting all the `Author` objects in a given `Book` is a pretty straightforward call:

{% if page.language == "java" %}
```java
ArrayList<ParseObject> authorList = book.getList("authors");
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
NSArray *authorList = [book objectForKey@"authors"];
```
```swift
let authorList = book.objectForKey("authors") as? NSArray
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
$authorList = $book->get("authors");
```
{% endif %}

{% if page.language == "cs" %}
```cs
var authorList = book.Get<List<ParseObject>>("authors");
```
{% endif %}

{% if page.language == "js" %}
```js
var authorList = book.get("authors")
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

Finally, suppose you have an `Author` and you want to find all the `Book` objects in which she appears. This is also a pretty straightforward query with an associated constraint:

{% if page.language == "java" %}
```java
// set up our query for the Book object
ParseQuery bookQuery = ParseQuery.getQuery("Book");

// configure any constraints on your query...
booKQuery.whereEqualTo("authors", author);

// tell the query to fetch all of the Author objects along with the Book
bookQuery.include("authors");

// execute the query
bookQuery.findInBackground(newFindCallback<ParseObject>() {
    public void done(List<ParseObject> bookList, ParseException e) {

    }
});
```
{% endif %}

{% if page.language == "objective_c-swift" %}
<div class="language-toggle" markdown="1">
```objective_c
// suppose we have an Author object
PFObject *author = ...

// set up our query for the Book object
PFQuery *bookQuery = [PFQuery queryWithClassName:@"Book"];

// configure any constraints on your query...
[bookQuery whereKey:@"authors" equalTo:author];

// tell the query to fetch all of the Author objects along with the Book
[bookQuery includeKey:@"authors"];

// execute the query
[bookQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects is all of the Book objects, and their associated Author objects, too
}];
```
```swift
// suppose we have an Author object
let author = ...

// set up our query for the Book object
let bookQuery = PFQuery(className: "Book")

// configure any constraints on your query...
bookQuery.whereKey("authors", equalTo: author)

// tell the query to fetch all of the Author objects along with the Book
bookQuery.includeKey("authors")

// execute the query
bookQuery.findObjectsInBackgroundWithBlock{
	(objects: [AnyObject]?, error: NSError?) -> Void in
    // objects is all of the Book objects, and their associated Author objects, too
}
```
</div>
{% endif %}

{% if page.language == "php" %}
```php
// set up our query for the Book object
$bookQuery = new ParseQuery("Book");

// configure any constraints on your query...
$bookQuery->equalTo("authors", $author);

// tell the query to fetch all of the Author objects along with the Book
$bookQuery->includeKey("authors");

// execute the query
$books = $bookQuery->find();
```
{% endif %}

{% if page.language == "cs" %}
```cs
// set up our query for the Book object
var bookQuery = ParseObject.GetQuery("Book");

// configure any constraints on your query...
bookQuery = bookQuery.WhereEqualTo("authors", author);

// tell the query to fetch all of the Author objects along with the Book
bookQuery = bookQuery.Include("authors");

// execute the query
IEnumerable<ParseObject> books = await bookQuery.FindAsync();
```
{% endif %}

{% if page.language == "js" %}
```js
// set up our query for the Book object
var bookQuery = new Parse.Query("Book");

// configure any constraints on your query...
bookQuery.equalTo("authors", author);

// tell the query to fetch all of the Author objects along with the Book
bookQuery.include("authors");

// execute the query
const books = await bookQuery.find();
```
{% endif %}

{% if page.language == "bash" %}
```bash
# No REST API example
```
{% endif %}

{% if page.language == "cpp" %}
```cpp
// No C++ example
```
{% endif %}

## One-to-One

In Parse, a one-to-one relationship is great for situations where you need to split one object into two objects. These situations should be rare, but two examples include:

* **Limiting visibility of some user data.** In this scenario, you would split the object in two, where one portion of the object contains data that is visible to other users, while the related object contains data that is private to the original user (and protected via ACLs).
* **Splitting up an object for size.** In this scenario, your original object size is too large, so you decide to create a secondary object to house extra data. It is usually better to design your data model to avoid objects this large, rather than splitting them up. If you can't avoid doing so, you can also consider storing large data in a Parse File.

Thank you for reading this far. We apologize for the complexity. Modeling relationships in data is a hard subject, in general. But look on the bright side: it's still easier than relationships with people.
