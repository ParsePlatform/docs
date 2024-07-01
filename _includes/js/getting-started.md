# Getting Started

The easiest way to integrate the Parse SDK into your JavaScript project is through the [npm module](https://npmjs.org/parse).
However, if you want to use a pre-compiled file, you can fetch it from [npmcdn](https://npmcdn.com). The development version is available at [https://npmcdn.com/parse/dist/parse.js](https://npmcdn.com/parse/dist/parse.js), and the minified production version is at [https://npmcdn.com/parse/dist/parse.min.js](https://npmcdn.com/parse/dist/parse.min.js).

The JavaScript ecosystem is wide and incorporates a large number of platforms and execution environments. To handle this, the Parse npm module contains special versions of the SDK tailored to use in Node.js and [React Native](https://facebook.github.io/react-native/) environments. Not all features make sense in all environments, so using the appropriate package will ensure that items like local storage, user sessions, and HTTP requests use appropriate dependencies.

To use the npm modules for a browser based application, include it as you normally would:

```js
const Parse = require('parse');
```

For server-side applications or Node.js command line tools, include `'parse/node'`:

```js
// In a node.js environment
const Parse = require('parse/node');
// ES6 Minimized
import Parse from 'parse/dist/parse.min.js';
```

For React Native applications, include `'parse/react-native.js'`:
```js
// In a React Native application
const Parse = require('parse/react-native.js');
```

Additionally on React-Native / Expo environments, make sure to add the piece of code below :

```js
//Get your favorite AsyncStorage handler with import (ES6) or require
import { AsyncStorage } from 'react-native'; 

//Before using the SDK...
Parse.setAsyncStorage(AsyncStorage);
```

To initialize your own Parse-Server with Javascript, you should replace your current initialization code with this


```js
Parse.initialize("YOUR_APP_ID", "YOUR_JAVASCRIPT_KEY");
//javascriptKey is required only if you have it on server.

Parse.serverURL = 'http://YOUR_PARSE_SERVER:1337/parse'
```

⚠️ If the Masterkey needs to be provided, use the following. Please note that the master key should only be used in safe environments and never on client side ‼️ 


```js
Parse.initialize("YOUR_APP_ID", "YOUR_JAVASCRIPT_KEY", "YOUR_MASTERKEY");
//javascriptKey is required only if you have it on server.

Parse.serverURL = 'http://YOUR_PARSE_SERVER:1337/parse'
```

Our JavaScript SDK is originally based on the popular [Backbone.js](http://backbonejs.org/) framework, but it provides flexible APIs that allow it to be paired with your favorite JS libraries. Our goal is to minimize configuration and let you quickly start building your JavaScript and HTML5 app on Parse.

Our SDK supports Firefox 23+, Chrome 17+, Safari 5+, and IE 10. IE 9 is supported only for apps that are hosted with HTTPS.
