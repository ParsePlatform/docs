## Deploying to Glitch and mLab

Before you start, you'll need:

 - mLab account (for free MongoDB)

### Step 1: Creating your database on mLab

[mLab](https://mlab.com) provides a Database-as-a-Service for MongoDB. They include a free tier for small sandbox databases. Create an account on mLab and then use the Single-node, Sandbox plan to get a (free) database up and running. Within the mLab wizard, you'll need to be sure to create a user that has access to connect to the new database. Upon completion, you should be able to construct a Mongo DB connection string like the following:

```
mongodb://yourusername:yourpassword@yourmlabdatabaseaddress.mlab.com:yourdatabaseport/yourdatabasename
```

### Step 2: Running parse-server-example on Glitch

[Glitch](https://glitch.com) provides an easy way to instantly create and deploy Node.js applications for free. We will use it to run the [parse-server-example](https://github.com/parse-community/parse-server-example) application.

To get the example server up and running for quick testing, you can simply click the button below:

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/import/github/parse-community/parse-server-example?APP_ID=myAppId&MASTER_KEY=your_master_key_here&DATABASE_URI=your_mlab_database_uri_here&SERVER_URL=https://project-name.glitch.me/parse&PARSE_SERVER_LOGS=/tmp)

Now that the import is complete, we'll need to make two small changes to the ```🗝️.env``` file, which stores private environment variables.

It should look like the following:

```
# Environment Config

# store your secrets and config variables in here
# only invited collaborators will be able to see your .env values

# reference these in your code with process.env.SECRET

SECRET=
MADE_WITH=

# note: .env is a shell file so there can't be spaces around =
APP_ID=myAppId
MASTER_KEY=your_master_key_here
DATABASE_URI=your_mlab_database_uri_here
SERVER_URL=https://project-name.glitch.me/parse
PARSE_SERVER_LOGS=/tmp

```
First, change the ```DATABASE_URI``` value to your mLab connection string from step 1.

Next, change the ```project-name``` portion of the ```SERVER_URL``` value to the name of the project that was created. So, if clicking the button creates ```electric-dinner.glitch.me```, your ```SERVER_URL``` value would be ```https://electric-dinner.glitch.me/parse```.

You can delete the ```SECRET``` and ```MADE_WITH``` lines, but there's no harm in leaving them there.

It is important, for this tutorial, to leave the ```APP_ID``` as ```myAppId``` as the "test" page hard-codes that and expects that value.

If you'd like to keep this project, [create an account on Glitch](https://glitch.com/help/how-do-i-create-an-account-on-glitch/). Projects created as an anonymous user expire after five days. You can read more about the technical restrictions on free Glitch projects [here](https://glitch.com/help/restrictions/).


### Step 3: Testing

Once you're finished making your changes to your ```🗝️.env``` file, Glitch will automatically build and deploy your application. If you use the Logs feature within Glitch (click on <kbd><kbd><samp>Tools</samp></kbd> &rarr; <kbd><samp>Logs</samp></kbd></kbd>), you should see this when your app is deployed:

```
parse-server-example running on port 3000.
```

You should then be able to use the "Show" button to launch the application in the browser and get to a page that urges you to star the parse-server GitHub repository. To access the test harness page, add a trailing ```/test``` to your URL. This should take you to a page that will allow you to exercise a few parts of the Parse Server Javascript SDK and create a dummy collection and record in your MongoDB. If you're able to complete steps one through three on this test page, Parse Server is up and running. Optionally, you can go back to mLab.com and take a look at the data that was stored by the test harness to get a feel for how Parse Server stores data in MongoDB.
