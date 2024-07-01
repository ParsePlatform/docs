# Config

`Parse.Config` is a great way to configure your applications remotely by storing a single configuration object on Parse. It enables you to add things like feature gating or a simple "Message of the Day". To start using `Parse.Config` you need to add a few key/value pairs (parameters) to your app on the Parse Config Dashboard.

After that you will be able to fetch the `Parse.Config` on the client, like in this example:

```javascript
Parse.Config.get().then(function(config) {
  const winningNumber = config.get("winningNumber");
  const message = "Yay! The number is " + winningNumber + "!";
  console.log(message);
}, function(error) {
  // Something went wrong (e.g. request timed out)
});
```
## Save & Update Config

`ParseConfig` can be managed through the SDK when a `Master Key` is provided and **only in a NodeJS environment**. You can save new parameters and if you save already existing parameters they will be automatically updated.
After a successfully `.save()` it return the new updated `ParseConfig` and `Parse.Config.current()` is up to date too.

```javascript
Parse.Config.save({
	welcomeMesssage : "Welcome to Parse",
	ageOfParse : 3,
	tags : ["parse","sdk","js"]
}).then(function(config) {
  console.log("Cool! Config was saved and fetched from the server.");
  
  const welcomeMessage = config.get("welcomeMessage");
  console.log("Welcome Message = " + welcomeMessage);
}, function(error) {
  console.log("Failed to save.");
  //Try again later
});
```
## Retrieving Config

`ParseConfig` is built to be as robust and reliable as possible, even in the face of poor internet connections. Caching is used by default to ensure that the latest successfully fetched config is always available. In the below example we use `get` to retrieve the latest version of config from the server, and if the fetch fails we can simply fall back to the version that we successfully fetched before via `current`.

```javascript
Parse.Config.get().then(function(config) {
  console.log("Yay! Config was fetched from the server.");

  const welcomeMessage = config.get("welcomeMessage");
  console.log("Welcome Message = " + welcomeMessage);
}, function(error) {
  console.log("Failed to fetch. Using Cached Config.");

  const config = Parse.Config.current();
  let welcomeMessage = config.get("welcomeMessage");
  if (welcomeMessage === undefined) {
    welcomeMessage = "Welcome!";
  }
  console.log("Welcome Message = " + welcomeMessage);
});
```

## Internal Config

By default, Parse Config parameters can be publicly read which may be undesired if the parameter contains sensitive information that should not be exposed to clients. A parameter can be saved as readable only with the master key by adding a flag as the second argument.

```javascript
await Parse.Config.save(
  { welcomeMessage : "Welcome to Parse", secretMessage: "Psst 👀" },
  { secretMessage: true }
);

const publicConfig = await Parse.Config.get(); // Returns only `welcomeMessage`.
const internalConfig = await Parse.Config.get({ useMasterKey: true }); // Returns `welcomeMessage` and `secretMessage`.
```

If a parameter is not provided or set to `false` in the second argument, it can be retrieved without using the master key.

## Current Config

Every `Parse.Config` instance that you get is always immutable. When you retrieve a new `Parse.Config` in the future from the network, it will not modify any existing `Parse.Config` instance, but will instead create a new one and make it available via `Parse.Config.current()`. Therefore, you can safely pass around any `current()` object and safely assume that it will not automatically change.

It might be troublesome to retrieve the config from the server every time you want to use it. You can avoid this by simply using the cached `current()` object and fetching the config only once in a while.

```javascript
// Fetches the config at most once every 12 hours per app runtime
const refreshConfig = function() {
  let lastFetchedDate;
  const configRefreshInterval = 12 * 60 * 60 * 1000;
  return function() {
    const currentDate = new Date();
    if (lastFetchedDate === undefined ||
        currentDate.getTime() - lastFetchedDate.getTime() > configRefreshInterval) {
      Parse.Config.get();
      lastFetchedDate = currentDate;
    }
  };
}();
```

## Parameters

`ParseConfig`  supports most of the data types supported by `Parse.Object`:

*   string
*   number
*   Date
*   Parse.File
*   Parse.GeoPoint
*   JS Array
*   JS Object

We currently allow up to **100** parameters in your config and a total size of **128KB** across all parameters.
