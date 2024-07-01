# Options

## definitions

An array of your Defined Parse Classes.

## strict

You can set the `strict` option to `true` if you want Parse Server to delete all Parse Objects when you remove a Defined Parse Class from your `definitions`. Data stored in removed classes will be lost.

By default `strict` is `false`. If you often change your schemas be aware that you will have stale data classes in your database. You will need to delete these classes (collection for MongoDB, table for Postgres) manually, through your database CLI/UI.

## deleteExtraFields

You can set the `deleteExtraFields` option to `true` if you want Parse Server to delete a removed Defined Parse Class field from your database. Data stored in the removed field will be lost.

By default `deleteExtraFields` is `false`. Be aware that you will have stale data fields in your database since Parse Server will not delete field data automatically. You will need to delete these fields manually.

## recreateModifiedFields

You can set the `recreateModifiedFields` option to `true` if you want Parse Server to clean field data before updating the field type when the field type is modified. For example when changing from `String` to `Number`. Data stored under the modified field will be lost.

`recreateModifiedFields` defaults to `false`. **Be aware that if you set `recreateModifiedFields` to `true` and do not perform some data migration, you can result with data type inconsistency on the modified field.**

Good practice would be to create the new field of the new type, and then create a Parse Cloud Job to migrate old field data to the newly created field.

## lockSchemas

You can set the `lockSchemas` option to `true` if you want to prevent any schema manipulation and to lock the schema as defined in the Parse Server configuration. If this options is `true` any create, update and delete request will be denied by the Parse Server API, even with the master key. You will not be able to manipulate `indexes`, `classLevelPermissions`, `fields`.

## beforeMigration

A function called before Parse Server performs schema updates based on the `definitions` option

## afterMigration

A function called after Parse Server performed schema updates based on the `definitions` option
