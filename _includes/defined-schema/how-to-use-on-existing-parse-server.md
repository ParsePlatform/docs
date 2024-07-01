# Defined Schemas with existing installation

Defined Schemas is a feature in Parse Server that allows you to define the structure of your data in the database and ensure that it stays consistent. When the server starts up, it compares the current existing schemas to the Defined Schemas that you have provided, and applies any necessary changes to bring them in line with each other.

To use Defined Schemas on your existing Parse Server installation, follow the steps below carefully:

## 1. Connect to your Parse Dashboard

If you already have an hosted or deployed Parse Dashboard, you can skip to step 2. If not, you can follow the "Getting Started" guide for the Parse Dashboard: [Parse Dashboard Getting Started](https://github.com/parse-community/parse-dashboard#getting-started)

## 2. Extract Schemas using JS Console

To access the API Console and JS Console in the Parse Dashboard:

- On the Parse Dashboard, go to the left sidebar and click on "API Console".
- In the API Console, click on "JS Console".
- In the JS Console, copy and paste the following code:

```js
const schemas = await Parse.Schema.all();
console.log(JSON.stringify(schemas));
```

- Click "Run".

After running this code, you should see a JSON string of your current schemas displayed in the console, including their CLPs (Class Level Permissions), indexes, and fields. This will give you an overview of the current structure of your data in the database.

## 3. Paste schemas in your existing code

Follow the ["Getting Started" section](/defined-schema/guide) of Defined Schema and paste your extracted JSON string. With luck your IDE, will reformat the JSON for you. Otherwise you can easily find online tools to convert JSON string to JS Array/Object.

## 4. Backup your database

As a best practice, before any deployment that involves Schema changes, perform a full database backup to prevent any data loss and to be able to roll back if something goes wrong.

## 5. Deploy your new Parse Server with Defined Schemas

Once the backup is done, you can deploy your new Parse Server. After the deployment, you can check the Parse Dashboard to ensure that all of your classes, fields, indexes, and CLPs are correct.

If something goes wrong during the deployment, you can roll back your database, deploy the previous version of your Parse Server, adjust and review your Defined Schemas, and then repeat steps 4 and 5.

## 6. Future deployments

If you are using Defined Schemas, it is recommended to set up a CI/CD (Continuous Integration/Continuous Deployment) process to automate your deployments. In this case, you should use the lockSchemas: true option to prevent any conflicts with create/update API calls sent to the Schema API from the Parse Dashboard or other SDKs.

To create or update schemas (fields, indexes, CLPs) in the future, you will need to make the necessary changes in your Parse Server code and deploy a new version of your app.
