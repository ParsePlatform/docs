# API Doc

GraphQL is a self documented API, to learn all available operations, it's recommended to start the Parse GraphQL Server and visit the Docs tab on the GraphQL Playground.

```bash
$ npm install -g parse-server mongodb-runner
$ mongodb-runner start
$ parse-server --appId APPLICATION_ID --masterKey MASTER_KEY --databaseURI mongodb://localhost/test --mountGraphQL --mountPlayground
```

Visit your [Local GraphQL Playground](http://localhost:1337/playground)

<img alt="GraphQL Playground" data-echo="{{ '/assets/images/graphql/graphql-playground.png' | prepend: site.baseurl }}"/>
