# Handling Errors

Many of the methods on `ParseObject`, including `save()`, `delete()`, and `get()` will throw a `ParseException` on an invalid request, such as deleting or editing an object that no longer exists in the database, or when there is a network failure preventing communication with your Parse Server. You will need to catch and deal with these exceptions.

For more details, look at the [Android API]({{ site.apis.android }}).
