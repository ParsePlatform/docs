# Fields

These field types are available on a Parse Schema.

`required`: `boolean`, forces the field to be set on create and update, is `false` by default.

`defaultValue`: `any`, a value used by Parse Server when you create a Parse Object if the field is not provided.

`targetClass`: `string`, a Parse Class name used by Parse Server to validate the `Pointer`/`Relation`

✅: Supported
❌: Not Supported

| Type     | -- required -- | -- defaultValue -- | -- targetClass -- |
| -------- | -------------- | ------------------ | ----------------- |
| String   | ✅             | ✅                 | ❌                |
| Boolean  | ✅             | ✅                 | ❌                |
| Date     | ✅             | ✅                 | ❌                |
| Object   | ✅             | ✅                 | ❌                |
| Array    | ✅             | ✅                 | ❌                |
| GeoPoint | ✅             | ✅                 | ❌                |
| File     | ✅             | ✅                 | ❌                |
| Bytes    | ✅             | ✅                 | ❌                |
| Polygon  | ✅             | ✅                 | ❌                |
| Relation | ❌             | ❌                 | ✅ (required)     |
| Pointer  | ✅             | ❌                 | ✅ (required)     |

Example:

```js
const UserSchema = {
  className: "_User",
  fields: {
    birthDate: { type: "Date" },
    firstname: { type: "String", required: true },
    lastname: { type: "String", required: true },
    tags: { type: "Array" },
    location: { type: "GeoPoint" },
    city: { type: "Pointer", targetClass: "City" },
    friends: { type: "Relation", targetClass: "_User" },
    zone: { type: "Polygon" },
  },
};
```
