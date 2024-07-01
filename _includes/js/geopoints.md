# GeoPoints

Parse allows you to associate real-world latitude and longitude coordinates with an object.  Adding a `Parse.GeoPoint` to a `Parse.Object` allows queries to take into account the proximity of an object to a reference point.  This allows you to easily do things like find out what user is closest to another user or which places are closest to a user.

## Parse.GeoPoint

To associate a point with an object you first need to create a `Parse.GeoPoint`.  For example, to create a point with latitude of 40.0 degrees and -30.0 degrees longitude:

```javascript
const point = new Parse.GeoPoint({latitude: 40.0, longitude: -30.0});
```

This point is then stored in the object as a regular field.

```javascript
placeObject.set("location", point);
```

Note: Currently only one key in a class may be a `Parse.GeoPoint`.

## Geo Queries

Now that you have a bunch of objects with spatial coordinates, it would be nice to find out which objects are closest to a point.  This can be done by adding another restriction to `Parse.Query` using `near`.  Getting a list of ten places that are closest to a user may look something like:

```javascript
// User's location
const userGeoPoint = userObject.get("location");
// Create a query for places
const query = new Parse.Query(PlaceObject);
// Interested in locations near user.
query.near("location", userGeoPoint);
// Limit what could be a lot of points.
query.limit(10);
// Final list of objects
const placesObjects = await query.find();
```

 At this point `placesObjects` will be an array of objects ordered by distance (nearest to farthest) from `userGeoPoint`. Note that if an additional `ascending()`/`descending()` order-by constraint is applied, it will take precedence over the distance ordering.

To limit the results using distance, check out `withinMiles`, `withinKilometers`, and `withinRadians`. Use the `sorted` parameter to sort the results by distance ascending.

```javascript
const location = new Parse.GeoPoint(37.708813, -122.526398);
const distance = 5;
const sorted = true;

const query = new Parse.Query(PizzaPlaceObject);
query.withinKilometers("location", location, distance, sorted);
// Pizza places within 5km sorted by distance
const pizzaPlacesInSF = await query.find();
```

If you add an additional sorting constraint set the `sorting` parameter to `false` for better query performance.

```javascript
const location = new Parse.GeoPoint(37.708813, -122.526398);
const distance = 5;
const sorted = false;

const query = new Parse.Query(PizzaPlaceObject);
query.withinKilometers("location", location, distance, sorted);
query.descending("rating");
// Pizza places within 5km sorted by rating
const pizzaPlacesInSF = query.find();
```

It's also possible to query for the set of objects that are contained within a particular area.  To find the objects in a rectangular bounding box, add the `withinGeoBox` restriction to your `Parse.Query`.

```javascript
const southwestOfSF = new Parse.GeoPoint(37.708813, -122.526398);
const northeastOfSF = new Parse.GeoPoint(37.822802, -122.373962);

const query = new Parse.Query(PizzaPlaceObject);
query.withinGeoBox("location", southwestOfSF, northeastOfSF);
const pizzaPlacesInSF = await query.find();
```

You can query for whether an object lies within or on a polygon of `Parse.GeoPoint` (minimum 3 points):

```javascript
query.withinPolygon("location", [geoPoint1, geoPoint2, geoPoint3]);
const robjectsWithGeoPointInPolygon = await query.find();
```

You can also query for whether an object `Parse.Polygon` contains a `Parse.GeoPoint`:

```javascript
const p1 = [[0,0], [0,1], [1,1], [1,0]];
const p2 = [[0,0], [0,2], [2,2], [2,0]];
const p3 = [[10,10], [10,15], [15,15], [15,10], [10,10]];

const polygon1 = new Parse.Polygon(p1);
const polygon2 = new Parse.Polygon(p2);
const polygon3 = new Parse.Polygon(p3);

const point = new Parse.GeoPoint(0.5, 0.5);
const query = new Parse.Query(TestObject);
query.polygonContains('polygon', point);
// objects contains polygon1 and polygon2
const results = await query.find();
```

To efficiently find if a `Parse.Polygon` contains a `Parse.GeoPoint` without querying use `containsPoint`.

```javascript
const points = [[0,0], [0,1], [1,1], [1,0]];
const inside = new Parse.GeoPoint(0.5, 0.5);
const outside = new Parse.GeoPoint(10, 10);
const polygon = new Parse.Polygon(points);
// Returns True
polygon.containsPoint(inside);
// Returns False
polygon.containsPoint(outside);
```

## Caveats

At the moment there are a couple of things to watch out for:

1.  Each Parse.Object class may only have one key with a Parse.GeoPoint object.
2.  Using the `near` constraint will also limit results to within 100 miles.
3.  Using the `near` constraint combined with an `ascending` or `descending` constraint is not recommended due to performance. This is because `$near` sorts objects by distance and an additional sort constraint re-orders the matching objects, effectively overriding the sort operation already performed.
4.  Points should not equal or exceed the extreme ends of the ranges.  Latitude should not be -90.0 or 90.0.  Longitude should not be -180.0 or 180.0.  Attempting to set latitude or longitude out of bounds will cause an error.
