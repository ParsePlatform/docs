# Best Practice

*This page is a work in progress and incomplete. If you have any suggestions, please open a pull request.*

## Security

### Firewall

Protect all Parse Server endpoints using a Firewall to mitigate the risk of malicious attempts to scape user data, flood the database and DDoS attacks.
- Use rate-limiting rules for public endpoints, for example limit the number of requests per IP address or per user.
- Use very restrictive rules for private endpoints; for example limit access to Parse Dashboard to your personal network.

### Security-First Mindset

When developing for Parse Server, consider any Cloud Function or Cloud Trigger as a potential target for a malicious attack. In general, it's best to always assume that the sender of a request cannot be trusted. Even if you have control over the client's code when shipping it, it's simple for an attacker to replicate a request to Parse Server and modify arguments, or reverse-engineer a client app and extract hard coded keys to send requests with unexpected arguments.

The following cloud code is **not recommended** and is an example of poor security practise:

```js
Parse.Cloud.define('updateEmail', async (req) => {
  const user = await new Parse.Query(Parse.User).get(req.params.id, { useMasterKey: true });
  if (!user) {
    throw 'This user does not exist';
  }
  user.set('email', req.params.email);
  return user.save(null, { useMasterKey: true });
});
```

With this code, an attacker can simply guess a user to sniff out a user object and replace their email, potentially exposing private user data. This could allow the attacker to then request a password reset to the new email, and take-over the account completely.

```js
while (true) {
  let id = '';
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz'.split('');
  for (let i = 0; i < 10; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  try {
    const user = await Parse.Cloud.run('updateEmail', {id});
    console.log(`Here is a full user object: `, user.toJSON());
    return;
  } catch (e) {
    console.log(`Not a valid id: ${id}`);
  }
}
```

Regardless of how secure your Parse Server is with ACLs and CLPs, a few lines of insecure Cloud Functions can undo it.

A secure solution would be to ensure that users can only update their email, such as:

```js
Parse.Cloud.define('updateEmail', async (req) => {
  req.user.set('email', req.params.email);
  await req.user.save(null, { useMasterKey: true });
  return `Email updated`;
}, {
  requireUser: true,
  fields: ['email']
});
```

## Optimization

The following is a list of design considerations to optimize data traffic and performance.

### Database

- Use short field names; field names need to be stored in the database just like the field values; short field names not only require less database storage but also reduce the data traffic between database, server and client.

### Queries

- Use `select` and `exclude` to transfer only the fields that you need instead of the whole object.
- Parallel queries where possible. For example, consider the following objects:

```js
const user = Parse.User.current();
const activity = new Activity();
activity.set('user', user);
const history = new History();
history.set('user', user);
```

If we want to get a users' relevant objects:

```js
const activities = await new Parse.Query(Activity).equalTo('user', user).find();
const histories = await new Parse.Query(History).equalTo('user', user).find();
```

However, this is inefficient as the queries will be ran on by one. We can optimize this with:

```js
const [activities, histories] = await Promise.all([
  new Parse.Query(Activity).equalTo('user', user).find(),
  new Parse.Query(History).equalTo('user', user).find()
])
```

### Clustering

By default, NodeJS runs JavaScript code on a single thread, meaning that if you are running Parse Server on a multi-core instance, you won't be using its full potential.

Clustering Parse Server is a simple as:

```js
import cluster from "cluster";
import os from "os";
if (cluster.isMaster) {
  const count = os.cpus().length;
  for (let i = 0; i < count; i++) {
    cluster.fork();
  }
  cluster.on("death", worker => {
    console.log(`worker ${worker.id} died. spawning a new process...`);
    cluster.fork();
  });
  cluster.on("exit", worker => {
    console.log(`worker ${worker.id} died. spawning a new process...`);
    cluster.fork();
  });
  console.log(`Parse Server started on ${count} clusters`);
} else {
  console.log(`Worker #${cluster.worker.id} created.`);
  const httpServer = createServer(app);
  const api = new ParseServer(config);
  await api.start();
  app.use("/parse", api.app);
  await new Promise(resolve => httpServer.listen(1337, resolve));
  await ParseServer.createLiveQueryServer(httpServer, {
    redisURL: REDIS_URL,
  });
}
```

Parse Server uses an internal cache to store user objects and roles for a short time between requests. If you are clustering, specify a global `cacheAdapter` to your Parse Server configuration to ensure the cache is kept in sync across clusters.
