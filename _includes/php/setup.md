# Setup

Once you have access to the sdk you'll need to set it up in order to begin working with parse-server.

## Initializing

After including the required files from the SDK, you need to initialize the ParseClient using your Parse API keys:

```php
ParseClient::initialize( $app_id, $rest_key, $master_key );
```

If your server does not use or require a REST key you may initialize the ParseClient as follows, safely omitting the REST key:

```php
ParseClient::initialize( $app_id, null, $master_key );
```

## Server URL

Directly after initializing the sdk you should set the server url.

```php
// Users of Parse Server will need to point ParseClient at their remote URL and Mount Point:
ParseClient::setServerURL('https://my-parse-server.com:port','parse');
```

Notice Parse server's default port is `1337` and the second parameter `parse` is the route prefix of your parse server.

For example if your parse server's url is `http://example.com:1337/parse` then you can set the server url using the following snippet

```php
ParseClient::setServerURL('https://example.com:1337','parse');
```

## Server Health Check

To verify that the server url and mount path you've provided are correct you can run a health check on your server.

```php
$health = ParseClient::getServerHealth();
if($health['status'] === 200) {
    // everything looks good!
}
```

If you wanted to analyze it further the health response may look something like this.

```jsonc
{
    "status"    : 200,
    "response"  : {
        "status" : "ok"
    }
}
```

The 'status' being the http response code, and the 'response' containing what the server replies with.
Any additional details in the reply can be found under 'response', and you can use them to check and determine the availability of parse-server before you make requests.

Note that it is _not_ guaranteed that 'response' will be a parsable json array. If the response cannot be decoded it will be returned as a string instead.

A couple examples of bad health responses could include an incorrect mount path, port or domain.

```jsonc
// ParseClient::setServerURL('http://localhost:1337', 'not-good');
{
    "status": 404,
    "response": "<!DOCTYPE html>...Cannot GET \/not-good\/health..."
}

// ParseClient::setServerURL('http://__uh__oh__.com', 'parse');
{
    "status": 0,
    "error": 6,
    "error_message": "Couldn't resolve host '__uh__oh__.com'"
}
```

Keep in mind `error` & `error_message` may change depending on whether you are using the **curl** (may change across versions of curl) or **stream** client.

## Http Clients

This SDK has the ability to change the underlying http client at your convenience.
The default is to use the curl http client if none is set, there is also a stream http client that can be used as well.

Setting the http client can be done as follows:

```php
// set curl http client (default if none set)
ParseClient::setHttpClient(new ParseCurlHttpClient());

// set stream http client
// ** requires 'allow_url_fopen' to be enabled in php.ini **
ParseClient::setHttpClient(new ParseStreamHttpClient());
```

If you have a need for an additional http client you can request one by opening an issue or by submitting a PR.

If you wish to build one yourself make sure your http client implements ```ParseHttpable``` for it be compatible with the SDK. Once you have a working http client that enhances the SDK feel free to submit it in a PR so we can look into adding it in.

## Alternate CA File

It is possible that your local setup may not be able to verify with peers over [SSL/TLS](https://hosting.review/web-hosting-glossary/#12). This may especially be the case if you do not have control over your local installation, such as for shared hosting.

If this is the case you may need to specify a Certificate Authority bundle. You can download such a bundle from <a href="http://curl.haxx.se/ca/cacert.pem">http://curl.haxx.se/ca/cacert.pem</a> to use for this purpose. This one happens to be a Mozilla CA certificate store, you don't necessarily have to use this one but it's recommended.

Once you have your bundle you can set it as follows:

```php
// ** Use an Absolute path for your file! **
// holds one or more certificates to verify the peer with
ParseClient::setCAFile(__DIR__ . '/certs/cacert.pem');
```
