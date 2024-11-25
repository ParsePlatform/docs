# Class Level Permissions

Class level permissions are a security feature from that allows one to restrict access on a broader way than the [ACL based permissions]({{ site.baseUrl }}/rest/guide/#security).

## `requiresAuthentication`

If you want to restrict access to a full class to only authenticated users, you can use the `requiresAuthentication` class level permission. For example, you want to allow your **authenticated users** to `find` and `get` objects from your application and your admin users to have all privileges, you would set the CLP:

```js
// PUT http://localhost:1337/schemas/:className
// Set the X-Parse-Application-Id and X-Parse-Master-Key header
// body:
{
  classLevelPermissions:
  {
    "find": {
      "requiresAuthentication": true,
      "role:admin": true
    },
    "get": {
      "requiresAuthentication": true,
      "role:admin": true
    },
    "create": { "role:admin": true },
    "update": { "role:admin": true },
    "delete": { "role:admin": true },
  }
}
```

Note that this is in no way securing your content. If you allow anyone to log in to your server, any client will be able to query this object.


## Protected Fields

Using `protectedFields` allows you to specify fields that will be removed server-side before response is returned to client.
This feature uses approach similar to permissions in the way you define users/roles that are subject to fields protection. You can target multiple users/roles each with different sets of fields to protect. 

It helps to achieve the behavior of `keys`/`excludedKeys` query options, by just modifying the scheme, thus giving you same flexibility without the need to modify request options on client or in cloud code. Moreover it provides extra security e.g. in case a malicious user tamperes with your client code (removes `keys` query option) or issues requests directly to server  - he still won't be able to read the fields he is not supposed to, because the fields will already be deleted from response before it is sent to client.

To do so, add a field `protectedFields` under `classLevelPermissions`. This should be an object, where the key defines a target audience and the value is an array of column names:

```js
// PUT http://localhost:1337/schemas/:className
// Set the X-Parse-Application-Id and X-Parse-Master-Key header
// body:
{
  classLevelPermissions:
  {
    "protectedFields": {
      "*": ["secret", "privateKey"],
      'authenticated': ["secret"],
      "r00tId": [],
      "role:admin": [],
      "userField:ownerPointer": []
    }
  }
}
```

Possible keys:

* `*` - Public access, applies to all requests.
* `authenticated` - applies to requests issued by logged in users.
* `role:role_name` - applies to users with a role.
* `s0meUs3rId` - targets user by id.
* `userField:column_name` - applies to user pointed to by field `column_name`.

Notes: 

* You can not protect default fields: `objectId`, `ACL`, `createdAt`, `updatedAt`.
* Protected fields are not enforced for requests signed with `masterKey`.

Next we will walk through the examples for each key, assuming we have an object: 

```js
{
 "preview": "Lorem ipsum",
 "article": "Lorem ipsum dolor sit amet",
 "secret": "consectetur adipiscing elit",
 "views": "42",
 "ownerEmail": "email@example.com",
 "owner": {"__type": "Pointer", "objectId": "0wn3r1d"},
 ... // we'll omit default fields for brevity.
}

```

### `Public '*'`

`*` represents public scope. It covers all requests received by server.

For example:

```js
// PUT http://localhost:1337/schemas/:className
// Set the X-Parse-Application-Id and X-Parse-Master-Key header
// body:
{
  classLevelPermissions:
  {
    "get": {
      "*": true
    },
    "protectedFields": {
      "*": ["owner", "ownerEmail", "secret"],
    }
  }
}
```

Here we define that fields `owner`,`ownerEmail` and `secret` are protected for all (`*`) requests. These fields will be excluded from the object in reponse. It will only contain fields that are not listed as protected:

```js
// response:
{
 "preview": "Lorem ipsum",
 "article": "Lorem ipsum dolor sit amet",
 "views": "42"
}
```

### `authenticated`

It is possible to distinguish logged in users using `authenticated` key. In the following example we will let non-authenticated users to see only a `preview` field, while users with valid session token could additionally see `article` and `views`:

```js
{
  classLevelPermissions:
  {
    "protectedFields": {
      "*": ["views", "secret", "ownerEmail", "owner", "article",],
      "authenticated": ["secret", "ownerEmail", "owner"]
    }
  }
}
```

```js
// example response for user without session token:
{
 "preview": "Lorem ipsum",
}

// example response for logged in user:
{
 "preview": "Lorem ipsum",
 "article": "Lorem ipsum dolor sit amet",
 "views": "42"
}
```

It is essential to understand the basic principle how server determines which fields to protect when user belongs to multiple groups with different rules defined. First, server finds all scopes with `protectedFields` the user belongs to. Then resulting set is determined as an intersection of all applicable sets.

In the above example, for logged in user:

1. Both `*` and `authenticated` are applicable scopes.
2. The result of intersection is `["secret", "ownerEmail", "owner"]` (the fields appear in both sets).
3. Object will have all keys except `secret`, `ownerEmail` and `owner`.


### `role:`

To target users belonging to some role, use `role:role_name` as a key.

Let's say we want to allow users with `admin` role to see all fields, while protecting some fields for all other users:

```js
{
  classLevelPermissions:
  {
    "protectedFields": {
      "*": ["ownerEmail", "secret"],
      "role:admin": []
    }
  }
}
```

In the above example we explicitly set empty array `[]` to state that no fields should be protected for users with `admin` role. So for `admin`, according to the principle discussed earlier:

* Both `*` and `role:admin` scopes are applicable. 
* The intersection result is `[]` (since there is no field that is present in both sets) thus all fields will appear in response.

### Role hierarchy

Sometimes your roles are related and form a hierarchy, e.g. when `tester` is related to `moderator` - `tester` inherits all privileges of `moderator`. Role hierarchy is also considered when protected fields are evaluated.

```js
let moderator = ... // Parse.Role
let tester = ...    // Parse.Role

moderator.getRelation('roles).add(tester);
``` 

Here is an example of a tricky setup that may lead to unexpected result, we'll explain why right after:

```js
{
  classLevelPermissions:
  {
    "protectedFields": {
      "role:moderator": ["secret"],
      "role:tester": ["ownerEmail"]
    }
  }
}
```

* When user with `role:moderator` fetches an object, `secret` is protected.
* When user with `role:tester` fetches same object - all fields appear to be visible, even though `role:tester` has `ownerEmail` set as protected. This happens because of role hierarchy - when user has a role, he also implicitly gets all the inherited roles. Then server intersects sets for all roles (both `role:tester` and inherited `role:moderator` in this case) and intersection of `["secret"]` vs `["ownerEmail"]` results in `[]` (sets have no fields in common).

### User ID

You can target users by their id. Just use `<_User>`'s `objectId` as a key:

```js
{
  classLevelPermissions:
  {
    "protectedFields": {
      "*": ["article", "ownerEmail", "secret"],
      "authenticated": ["ownerEmail","secret"]
      "s0m3userId": ["ownerEmail", "views"],
      "r00tus3rId": []
    }
  }
}
```

The same rule apples here - user that is targeted by id is still subject to rules set for all broader scopes. So for `s0m3userId`:

* 3 sets of fields will be intersected: `*`, `authenticated` and `s0m3userId`.
* As a result only `["ownerEmail"]` ia protected. 
* `views` field (although being listed as protected) actually has no effect, because it is not protected (in other words allowed) for everyone `*`.

### `userField:` (pointers)

There is one more way to target user - by pointer field. The syntax is: `userField:column_name`. This uses similar concept as [#pointer-permissions](Pointer Permisssions). You use column name (of either `Pointer<_User>` or `Array` type) as a key. And fields will be protected for any users pointed to by this field.  For example:

```js
let user1, user2 = ... // Parse.User
let object = ...;      // Parse.Object

object.owner = user2;
```

```js
{
  classLevelPermissions:
  {
    "protectedFields": {
      "*": ["article", "owner", "ownerEmail", "secret"],
      "userField:owner": [] // 'owner' field is Pointer<_User>
    }
  }
}
```

```js
// response for user1:
{
 "preview": "Lorem ipsum",
 "views": "42",
}

// response for user2
{
 "preview": "Lorem ipsum",
 "article": "Lorem ipsum dolor sit amet",
 "secret": "consectetur adipiscing elit",
 "views": "42",
 "ownerEmail": "email@example.com",
 "owner": {"__type": "Pointer", "objectId": "0wn3r1d"},
}

```

In this example, server checks if the user who hass issued a request is pointed to in requested object's `owner` field. No fields will be protected for user who is set as `owner` of each particular object.

Note: You can not use `Relation` columns with `userField:`, if you need to target multiple users by pointer - use `Array` type with `Pointer<_User>` items.

The most important concept to avoid misconfiguration when designing protected fields is to always keep in mind that the decision will be made not by the single most precise scope, but rather based on rules for all scopes the user belongs to.
