# Roles

As your app grows in scope and user-base, you may find yourself needing more coarse-grained control over access to pieces of your data than user-linked ACLs can provide. To address this requirement, Parse supports a form of [Role-based Access Control](http://en.wikipedia.org/wiki/Role-based_access_control). Roles provide a logical way of grouping users with common access privileges to your Parse data. Roles are named objects that contain users and other roles.  Any permission granted to a role is implicitly granted to its users as well as to the users of any roles that it contains.

For example, in your application with curated content, you may have a number of users that are considered "Moderators" and can modify and delete content created by other users.  You may also have a set of users that are "Administrators" and are allowed all of the same privileges as Moderators, but can also modify the global settings for the application. By adding users to these roles, you can ensure that new users can be made moderators or administrators, without having to manually grant permission to every resource for each user.

We provide a specialized role class to represent these groupings of users for the purposes of assigning permissions.  Roles have a few special fields that set them apart from other objects.

*   name: The name for the role.  This value is required, and can only be set once as a role is being created. The name must consist of alphanumeric characters, spaces, -, or _.  This name will be used to identify the Role without needing its objectId.
*   users: A [relation](#updating-objects) to the set of users that will inherit permissions granted to the containing role.
*   roles: A [relation](#updating-objects) to the set of child roles whose users and roles will inherit permissions granted to the containing role.

Often, in order to keep these roles secure, your mobile apps won't be directly responsible for managing creation and membership of your roles. Instead, roles may be managed by a separate interface on the web or manually managed by an administrator. Our REST API allows you to manage your roles without requiring a mobile client.

## Creating Roles

Creating a new role differs from creating a generic object in that the `name` field is required. Roles must also specify an [`ACL`](#access-control-lists), which should be as restrictive as possible to avoid allowing the wrong users to modify a role.

To create a new role, send a POST request to the roles root:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Moderators",
        "ACL": {
          "*": {
            "read": true
          }
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>roles
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>roles', json.dumps({
    "name": "Moderators",
    "ACL": {
        "*": {
            "read": True
        }
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

You can create a role with child roles or users by adding existing objects to the `roles` and `users` [relations](#updating-objects):

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Moderators",
        "ACL": {
          "*": {
            "read": true
          }
        },
        "roles": {
          "__op": "AddRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_Role",
              "objectId": "Ed1nuqPvc"
            }
          ]
        },
        "users": {
          "__op": "AddRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_User",
              "objectId": "8TOXdXf3tz"
            }
          ]
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>roles
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>roles', json.dumps({
    "name": "Moderators",
    "ACL": {
        "*": {
            "read": True
        }
    },
    "roles": {
        "__op": "AddRelation",
        "objects": [
            {
                "__type": "Pointer",
                "className": "_Role",
                "objectId": "Ed1nuqPvc"
            }
        ]
    },
    "users": {
        "__op": "AddRelation",
        "objects": [
            {
                "__type": "Pointer",
                "className": "_User",
                "objectId": "8TOXdXf3tz"
            }
        ]
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

When the creation is successful, the HTTP response is a `201 Created` and the Location header contains the object URL for the new object:

<pre><code class="javascript">
Status: 201 Created
Location: <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>roles/mrmBZvsErB
</code></pre>

The response body is a JSON object containing the `objectId` and `createdAt` timestamp of the newly-created object:

```jsonc
{
  "createdAt": "2022-01-01T12:23:45.678Z",
  "objectId": "mrmBZvsErB"
}
```

## Retrieving Roles

You can also retrieve the contents of a role object by sending a GET request to the URL returned in the location header when it was created.  For example, to retrieve the role created above:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>roles/mrmBZvsErB
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>roles/mrmBZvsErB', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The response body is a JSON object containing all of the fields on the role:

```jsonc
{
  "createdAt": "2022-01-01T12:23:45.678Z",
  "objectId": "mrmBZvsErB",
  "updatedAt": "2022-01-01T12:23:45.678Z",
  "ACL": {
    "*": {
      "read": true
    },
    "role:Administrators": {
      "write": true
    }
  },
  "name": "Moderators"
}
```

Note that the `users` and `roles` relations will not be visible in this JSON.  Instead, you must [query](#relational-queries) for the roles and users that belong to a given role using the `$relatedTo` operator.


## Updating Roles

Updating a role generally works like [updating any other object](#updating-objects), but the `name` field on the role cannot be changed. Adding and removing users and roles to the `users` and `roles` relations can be accomplished by using the `AddRelation` and `RemoveRelation` operators.

For example, we can add two users to the "Moderators" role created above like so:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "users": {
          "__op": "AddRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_User",
              "objectId": "8TOXdXf3tz"
            },
            {
              "__type": "Pointer",
              "className": "_User",
              "objectId": "g7y9tkhB7O"
            }
          ]
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>roles/mrmBZvsErB
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>roles/mrmBZvsErB', json.dumps({
    "users": {
        "__op": "AddRelation",
        "objects": [
            {
                "__type": "Pointer",
                "className": "_User",
                "objectId": "8TOXdXf3tz"
            },
            {
                "__type": "Pointer",
                "className": "_User",
                "objectId": "g7y9tkhB7O"
            }
        ]
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Similarly, we can remove a child role from the "Moderators" role created above like so:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "roles": {
          "__op": "RemoveRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_Role",
              "objectId": "Ed1nuqPvc"
            }
          ]
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>roles/mrmBZvsErB
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>roles/mrmBZvsErB', json.dumps({
    "roles": {
        "__op": "RemoveRelation",
        "objects": [
            {
                "__type": "Pointer",
                "className": "_Role",
                "objectId": "Ed1nuqPvc"
            }
        ]
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Note that we've included the master key in the query above because the "Moderators" role has an ACL that restricts modification by the public.


## Deleting Roles

To delete a role from the Parse Cloud, send a DELETE request to its URL.  For example:

<div class="language-toggle">
<pre><code class="bash">
curl -X DELETE \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>roles/mrmBZvsErB
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('DELETE', '<span class="custom-parse-server-mount">/parse/</span>roles/mrmBZvsErB', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Again, we pass the master key in order to bypass the ACL on the role itself.  Alternatively, we could pass an X-Parse-Session-Token for a user that has write access to the Role object (e.g. an Administrator).  For example:

<div class="language-toggle">
<pre><code class="bash">
curl -X DELETE \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "X-Parse-Session-Token: pnktnjyb996sj4p156gjtp4im" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>roles/mrmBZvsErB
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('DELETE', '<span class="custom-parse-server-mount">/parse/</span>roles/mrmBZvsErB', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "X-Parse-Session-Token": "pnktnjyb996sj4p156gjtp4im"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Security with Role

When you access Parse via the REST API key, access can be restricted by ACL just like in the iOS and Android SDKs.  You can still read and modify ACLs via the REST API, just by accessing the `"ACL"` key of an object.
In addition to per-user permissions [as described above](#access-control-lists), you can also specify role-level permissions to your Parse objects. Instead of specifying an `objectId` as the key for a permission object as you do for users, you can instead specify a role's name with a `"role:"` prefix as the key for a permission object.  You can use role-level permissions alongside user-level permissions to provide fine-grained control over user access.

For example, to restrict an object to be readable by anyone in the "Members" role and writable by its creator and anyone in the "Moderators" role, you would specify an ACL like this:

```jsonc
{
  "8TOXdXf3tz": {
    "write": true
  },
  "role:Members": {
    "read": true
  },
  "role:Moderators": {
    "write": true
  }
}
```

You are not required to specify read permissions for the user or the "Moderators" role if the user and role are already children of the "Members" role, since they will inherit read permissions granted to "Members".


## Role Hierarchy

As described above, one role can contain another, establishing a parent-child relationship between the two roles. The consequence of this relationship is that any permission granted to the parent role is implicitly granted to all of its child roles.

These types of relationships are commonly found in applications with user-managed content, such as forums. Some small subset of users are "Administrators", with the highest level of access to tweaking the application's settings, creating new forums, setting global messages, and so on. Another set of users are "Moderators", who are responsible for ensuring that the content created by users remains appropriate. Any user with Administrator privileges should also be granted the permissions of any Moderator. To establish this relationship, you would make your "Administrators" role a child role of "Moderators" by adding the "Administrators" role to the `roles` relation on your "Moderators" object like this:

<div class="language-toggle">
<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "roles": {
          "__op": "AddRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_Role",
              "objectId": "&lt;AdministratorsRoleObjectId&gt;"
            }
          ]
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>roles/&lt;ModeratorsRoleObjectId&gt;
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('PUT', '<span class="custom-parse-server-mount">/parse/</span>roles/&lt;ModeratorsRoleObjectId&gt;', json.dumps({
    "roles": {
        "__op": "AddRelation",
        "objects": [
            {
                "__type": "Pointer",
                "className": "_Role",
                "objectId": "&lt;AdministratorsRoleObjectId&gt;"
            }
        ]
    }
}), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>",
    "Content-Type": "application/json"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
