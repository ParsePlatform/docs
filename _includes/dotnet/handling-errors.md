# Handling Errors

Parse has a few simple patterns for surfacing errors and handling them in your code.

There are two types of errors you may encounter. The first is those dealing with logic errors in the way you're using the SDK. These types of errors result in general `Exception` being raised. For an example take a look at the following code:

```cs
var user = new ParseUser();
await user.SignUpAsync();
```

This will throw an `InvalidOperationException` because `SignUpAsync` was called without first setting the required properties (`Username` and `Password`).

The second type of error is one that occurs when interacting with Parse Server over the network. These errors are either related to problems connecting to the cloud or problems performing the requested operation. Let's take a look at another example:

```cs
await ParseObject.GetQuery("Note").GetAsync("thisObjectIdDoesntExist");
```

In the above code, we try to fetch an object with a non-existent `ObjectId`. Parse Server will return an error -- so here's how to handle it properly:

```cs
try
{
    await ParseObject.GetQuery("Note").GetAsync(someObjectId);
    // Everything went fine!
}
catch (ParseException e)
{
    if (e.Code == ParseException.ErrorCode.ObjectNotFound)
    {
        // Uh oh, we couldn't find the object!
    }
    else
    {
        // Some other error occurred
    }
}
```

By default, all connections have a timeout of 10 seconds, so tasks will not hang indefinitely.

For a list of all possible `ErrorCode` types, scroll down to [Error Codes](#error-codes), or see the `ParseException.ErrorCode` section of the [.NET API]({{ site.apis.dotnet }}/html/T_Parse_ParseException_ErrorCode.htm).
