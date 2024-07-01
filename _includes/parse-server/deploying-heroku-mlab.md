## Deploying to Heroku and MongoDB Atlas

Heroku and MongoDB Atlas provide an easy way to deploy Parse Server, especially if you're new to managing your own backend infrastructure.

Here are the steps:

1. Create a repo for your Express app with the Parse Server middleware mounted (you can use our [sample project](https://github.com/parse-community/parse-server-example), or start your own).
2. Create a Heroku account (if you don’t have one already) and use the Heroku Toolbelt to log in and prepare a new app in the same directory as your Express app. Take a look at Heroku's [Getting Started with Node.js guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction) for more details.
3. Set up your MongoDB database:
    1. Sign up for a [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas).
    2. Create a `New Project`.
    3. Open the page `Database Access` and create a new database user with username and password. Remember these user credentials, you will need them later to connect Parse Server to the database. As user privileges choose `Read and write to any database`, you can change these privileges later on and make them more restrictive according to your needs.
    4. Open the page `Clusters` and create a new cluster.
    5. On the cluster details page, click on the tab `Collections` and create a new database.
    6. On the cluster details page, click on the tab `Command Line Tools`, click on `Connect Instructions` and choose `Connect your application`.
    7. Copy the database connection string. Replace the placeholders in the connection string with the username and password of the user you created earlier and the database name.
4. Use heroku config and note the URI provided by Atlas under the var MONGOLAB_URI
5. Copy this URI and set it as a new config variable: `heroku config:set DATABASE_URI=mongodb://...`
6. Deploy it: `git push heroku master`

You may also refer to the Heroku Dev Center article on [Deploying a Parse Server to Heroku](https://devcenter.heroku.com/articles/deploying-a-parse-server-to-heroku).
