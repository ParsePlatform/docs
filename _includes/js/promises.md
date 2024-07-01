# Promises

In addition to callbacks, every asynchronous method in the Parse JavaScript SDK returns a `Promise`. With promises, your code can be much cleaner than the nested code you get with callbacks.

## Introduction to Promises

Promises represent the next great paradigm in JavaScript programming. But understanding why they are so great is no simple matter. At its core, a `Promise` represents the result of a task, which may or may not have completed. The only interface requirement of a `Promise` is having a function called `then`, which can be given callbacks to be called when the promise is fulfilled or has failed. This is outlined in the [CommonJS Promises/A proposal](http://wiki.commonjs.org/wiki/Promises/A). For example, consider saving a `Parse.Object`, which is an asynchronous operation. In the old callback paradigm, your code would look like this:

```javascript
object.save({ key: value }, {
  success: function(object) {
    // the object was saved.
  },
  error: function(object, error) {
    // saving the object failed.
  }
});
```

In the new Promise paradigm, that same code would look like this:

```javascript
object.save({ key: value }).then(
  function(object) {
    // the object was saved.
  },
  function(error) {
    // saving the object failed.
  });
```

Not much different, right? So what’s the big deal? Well, the real power of promises comes from chaining multiple of them together. Calling `promise.then(func)` returns a new promise, which is not fulfilled until `func` has completed. But there’s one really special thing about the way `func` is used. If a **callback supplied to `then` returns a new promise, then the promise returned by `then` will not be fulfilled until the promise returned by the callback is fulfilled**. The details of the behavior are explained in the [Promises/A+](https://github.com/promises-aplus/promises-spec) proposal. This is a complex topic, but maybe an example would make it clearer.

Imagine you’re writing code to log in, find an object, and then update it. In the old callback paradigm, you’d end up with what we call pyramid code:

```javascript
Parse.User.logIn("user", "pass", {
  success: function(user) {
    query.find({
      success: function(results) {
        results[0].save({ key: value }, {
          success: function(result) {
            // the object was saved.
          }
        });
      }
    });
  }
});
```

That’s getting pretty ridiculous, and that’s without any error handling code even. But because of the way promise chaining works, the code can now be much flatter:

```javascript
Parse.User.logIn("user", "pass").then(function(user) {
  return query.find();
}).then(function(results) {
  return results[0].save({ key: value });
}).then(function(result) {
  // the object was saved.
});
```

Ah! Much better!

## The `then` Method

Every `Promise` has a method named `then` which takes a pair of callbacks. The first callback is called if the promise is _resolved_, while the second is called if the promise is _rejected_.

```javascript
obj.save().then(function(obj) {
  // the object was saved successfully.
}, function(error) {
  // the save failed.
});
```

## Chaining Promises Together
Promises are a little bit magical, in that they let you chain them without nesting. If a callback for a promise returns a new promise, then the first one will not be resolved until the second one is. This lets you perform multiple actions without incurring the pyramid code you would get with callbacks.

```javascript
const query = new Parse.Query("Student");
query.descending("gpa");
query.find().then(function(students) {
  students[0].set("valedictorian", true);
  return students[0].save();

}).then(function(valedictorian) {
  return query.find();

}).then(function(students) {
  students[1].set("salutatorian", true);
  return students[1].save();

}).then(function(salutatorian) {
  // Everything is done!

});
```

## Error Handling With Promises

The code samples above left out error handling for simplicity, but adding it back reiterates what a mess the old callback code could be:

```javascript
Parse.User.logIn("user", "pass", {
  success: function(user) {
    query.find({
      success: function(results) {
        results[0].save({ key: value }, {
          success: function(result) {
            // the object was saved.
          },
          error: function(result, error) {
            // An error occurred.
          }
        });
      },
      error: function(error) {
        // An error occurred.
      }
    });
  },
  error: function(user, error) {
    // An error occurred.
  }
});
```

Because promises know whether they’ve been fulfilled or failed, they can propagate errors, not calling any callback until an error handler is encountered. For example, the code above could be written simply as:

```javascript
Parse.User.logIn("user", "pass").then(function(user) {
  return query.find();
}).then(function(results) {
  return results[0].save({ key: value });
}).then(function(result) {
  // the object was saved.
}, function(error) {
  // there was some error.
});
```

Generally, developers consider a failing promise to be the asynchronous equivalent to throwing an exception. In fact, if a callback passed to `then` throws an error, the promise returned will fail with that error. If any Promise in a chain returns an error, all of the success callbacks after it will be skipped until an error callback is encountered. The error callback can transform the error, or it can handle it by returning a new Promise that isn't rejected. You can think of rejected promises kind of like throwing an exception. An error callback is like a catch block that can handle the error or rethrow it.

```javascript
const query = new Parse.Query("Student");
query.descending("gpa");
query.find().then(function(students) {
  students[0].set("valedictorian", true);
  // Force this callback to fail.
  return Parse.Promise.error("There was an error.");

}).then(function(valedictorian) {
  // Now this will be skipped.
  return query.find();

}).then(function(students) {
  // This will also be skipped.
  students[1].set("salutatorian", true);
  return students[1].save();
}, function(error) {
  // This error handler WILL be called. error will be "There was an error.".
  // Let's handle the error by returning a new promise.
  return Parse.Promise.as("Hello!");

}).then(function(hello) {
  // Everything is done!
}, function(error) {
  // This isn't called because the error was already handled.
});
```

It's often convenient to have a long chain of success callbacks with only one error handler at the end.

## Promises in Series

Promises are convenient when you want to do a series of tasks in a row, each one waiting for the previous to finish. For example, imagine you want to delete all of the comments on your blog.

```javascript
const query = new Parse.Query("Comments");
query.equalTo("post", post);

query.find().then(function(results) {
  // Create a trivial resolved promise as a base case.
  let promise = Promise.resolve();
  results.forEach((result) =>  {
    // For each item, extend the promise with a function to delete it.
    promise = promise.then(() => {
      // Return a promise that will be resolved when the delete is finished.
      return result.destroy();
    });
  });
  return promise;

}).then(function() {
  // Every comment was deleted.
});
```

## Promises in Parallel
You can also use promises to perform several tasks in parallel, using the `when` method. You can start multiple operations at once, and use `Parse.Promise.when` to create a new promise that will be resolved when all of its input promises is resolved. The new promise will be successful if none of the passed-in promises fail; otherwise, it will fail with the last error. Performing operations in parallel will be faster than doing them serially, but may consume more system resources and bandwidth.

```javascript
const query = new Parse.Query("Comments");
query.equalTo("post", post);

query.find().then(function(results) {
  // Collect one promise for each delete into an array.
  const promises = [];
  const promises = results.map((result) => {
    // Start this delete immediately and add its promise to the list.
    return result.destroy();
  });
  // Return a new promise that is resolved when all of the deletes are finished.
  return Promise.all(promises);

}).then(function() {
  // Every comment was deleted.
});
```

## Creating Async Methods
With these tools, it's easy to make your own asynchronous functions that return promises. For example, you can make a promisified version of `setTimeout`.

```javascript
const delay = function(millis) {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
};

delay(100).then(function() {
  // This ran after 100ms!
});
```
