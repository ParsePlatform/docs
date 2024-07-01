# Config

`Parse Config` is a way to configure your applications remotely by storing a single configuration object on Parse. It enables you to add things like feature gating or a simple "Message of the day". To start using `Parse Config` you need to add a few key/value pairs (parameters) to your app on the Parse Config Dashboard.

<img alt="" data-echo="{{ '/assets/images/config_editor.png' | prepend: site.baseurl }}"/>

After that you will be able to fetch the config on the client by sending a `GET` request to config URL. Here is a simple example that will fetch the `Parse.Config`:

<div class="language-toggle">
<pre><code class="bash">
curl -X GET \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>config
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('GET', '<span class="custom-parse-server-mount">/parse/</span>config', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

The response body is a JSON object containing all the configuration parameters in the `params` field.

```jsonc
{
  "params": {
    "welcomeMessage": "Welcome to The Internet!",
    "winningNumber": 42
  }
}
```

You can also update the config by sending a `PUT` request to config URL. Here is a simple example that will update the `Parse.Config` (requires `masterKey`):

<pre><code class="bash">
curl -X PUT \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  -d "{\"params\":{\"winningNumber\":43}}"
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>config
</code></pre>

<pre><code class="javascript">
var request = require('request');
return request({
  method: 'PUT',
  url: Parse.serverURL + '/config',
  headers: {
    'X-Parse-Application-Id': Parse.applicationId,
    'X-Parse-Master-Key': Parse.masterKey
  },
  json: true,
  body: {
    params: { winningNumber: 43 }
  }
})
</code></pre>

The response body is a JSON object containing a simple boolean value in the `result` field.

```jsonc
{
  "result": true
}
```

If you want to make any changes to configs without sending the `masterkey`, you will need to create a Cloud Function that makes those changes.
