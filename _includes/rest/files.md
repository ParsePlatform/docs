# Files

## Uploading Files

To upload a file to Parse, send a POST request to the files URL, postfixed with the name of the file. The request must contain the `Content-Type` header associated with the file. Keep in mind that files are limited to 10 megabytes. Here's a simple example that'll create a file named `hello.txt` containing a string:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: text/plain" \
  -d 'Hello, World!' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>files/hello.txt
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>files/hello.txt', 'Hello, World!', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "text/plain"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

When the file upload is successful, the HTTP response is a `201 Created` and the `Location` header which contains the URL for the file:

<pre><code class="javascript">
Status: 201 Created
Location: http://files.parsetfss.com/bc9f32df-2957-4bb1-93c9-ec47d9870a05/tfss-db295fb2-8a8b-49f3-aad3-dd911142f64f-hello.txt
</code></pre>

The response body is a JSON object containing the `name` of the file, which is the original file name prefixed with a unique identifier in order to prevent name collisions. This means you can save files with the same name, and the files will not overwrite one another.

```jsonc
{
  "url": "http://files.parsetfss.com/bc9f32df-2957-4bb1-93c9-ec47d9870a05/tfss-db295fb2-8a8b-49f3-aad3-dd911142f64f-hello.txt",
  "name": "db295fb2-8a8b-49f3-aad3-dd911142f64f-hello.txt"
}
```

To upload an image, the syntax is a little bit different. Here's an example that will upload the image `myPicture.jpg` from the current directory.

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: image/jpeg" \
  --data-binary '@myPicture.jpg' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>files/pic.jpg
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>files/pic.jpg', open('myPicture.jpg', 'rb').read(), {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-REST-API-Key": "<span class="custom-parse-server-restapikey">${REST_API_KEY}</span>",
    "Content-Type": "image/jpeg"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

## Associating with Objects

After files are uploaded, you can associate them with Parse objects:

<div class="language-toggle">
<pre><code class="bash">
curl -X POST \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-REST-API-Key: <span class="custom-parse-server-restapikey">${REST_API_KEY}</span>" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Andrew",
        "picture": {
          "name": "...profile.png",
          "url": "...profile.png",
          "__type": "File"
        }
      }' \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>classes/PlayerProfile
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('POST', '<span class="custom-parse-server-mount">/parse/</span>classes/PlayerProfile', json.dumps({
    "name": "Andrew",
    "picture": {
        "name": "...profile.png",
        "url:": "...profile.png",
        "__type": "File"
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

Note that the name of the file in the request is not the local file name, but the name in the response of the previous upload operation. It is also important to add the `url` from the previous upload operation to the request.


## Deleting Files

Users holding the master key are allowed to delete files using the REST API. To delete a file, send a DELETE request to the files URL, postfixed with the name of the file. Note that the name of the file must be the name in the response of the upload operation, rather than the original filename. Note that the `X-Parse-Master-Key` must be provided in headers.

<div class="language-toggle">
<pre><code class="bash">
curl -X DELETE \
  -H "X-Parse-Application-Id: <span class="custom-parse-server-appid">${APPLICATION_ID}</span>" \
  -H "X-Parse-Master-Key: <span class="custom-parse-server-masterkey">${MASTER_KEY}</span>" \
  <span class="custom-parse-server-protocol">https</span>://<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span><span class="custom-parse-server-mount">/parse/</span>files/profile.png
</code></pre>
<pre><code class="python">
import http.client
import json


connection = http.client.HTTPSConnection('<span class="custom-parse-server-url">YOUR.PARSE-SERVER.HERE</span>', 443)
connection.connect()
connection.request('DELETE', '<span class="custom-parse-server-mount">/parse/</span>files/...profile.png', '', {
    "X-Parse-Application-Id": "<span class="custom-parse-server-appid">${APPLICATION_ID}</span>",
    "X-Parse-Master-Key": "<span class="custom-parse-server-masterkey">${MASTER_KEY}</span>"
})
result = json.loads(connection.getresponse().read())
print(result)
</code></pre>
</div>

Note that deleting a PFObject with a file associated with it will not delete the file. All files stored on Parse should be deleted by using the above explained API.
