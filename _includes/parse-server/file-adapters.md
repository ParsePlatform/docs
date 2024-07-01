# Configuring File Upload

*Available on Parse Server >=5.0.0*

Parse Server restricts file upload to authenticated users only to improve Parse Server's default security. This behaviour can be modified by specifying `fileUpload` options to your Parse Server configuration.

Available options are:

- `enableForAnonymousUser`: Enable file upload for anonymous users
- `enableForAuthenticatedUser`: Enable file upload for authenticated users
- `enableForPublic`: Enable file upload for the public, i.e. everyone

To allow public file uploads to Parse Server:

```javascript
const api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.PARSE_SERVER_CLOUD || __dirname + '/cloud/main.js',
  appId: process.env.PARSE_SERVER_APPLICATION_ID || 'myAppId',
  masterKey: process.env.PARSE_SERVER_MASTER_KEY || '',
  fileUpload: {
    enableForPublic: true,
    enableForAnonymousUser: true,
    enableForAuthenticatedUser: true,
  }
});
await api.start();
```

# Configuring File Adapters

Parse Server allows developers to choose from several options when hosting files:

* `GridStoreAdapter`, which is backed by MongoDB;
* `S3Adapter`, which is backed by [Amazon S3](https://aws.amazon.com/s3/); or
* `GCSAdapter`, which is backed by [Google Cloud Storage](https://cloud.google.com/storage/); or
* `FSAdapter`, local file storage

`GridStoreAdapter` is used by default and requires no setup, but if you're interested in using S3 or Google Cloud Storage, additional configuration information is available below.

When using files on Parse, you will need to use the `publicServerURL` option in your Parse Server config. This is the URL that files will be accessed from, so it should be a URL that resolves to your Parse Server. Make sure to include your mount point in this URL.

When using `Postgres`, you will need to configure `S3Adapter`,  `GCSAdapter`, or `FSAdapter` for file support. The `GridStoreAdapter` does not work with `Postgres`.

## Configuring `GridStoreAdapter`

If you are using `Mongo` and don't need file encryption, there are no additional steps needed to use the `GridStoreAdapter`. If you'd like to enable file encryption follow these instructions to configure Parse Server to use `GridStoreAdapter` with file encryption.

### Set up file encryption
File encryption is available in parse-server 4.4.0+. The `GridStoreAdapter` can encrypt files at rest in `Mongo` using AES256-GCM, allowing the adapter to detect if files are tampered with.

To use, simply do any of the following:
- Use the environment variable `PARSE_SERVER_ENCRYPTION_KEY`
- Pass the encryption key via parameter `--encryptionKey` in the command line when starting Parse Server
- Initialize Parse Server with `encryptionKey="PATH_TO_ENCRYPTION_KEY_FILE`.

An example starting your Parse Server in `index.js` is below:

```javascript
const api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.PARSE_SERVER_CLOUD || __dirname + '/cloud/main.js',
  appId: process.env.PARSE_SERVER_APPLICATION_ID || 'myAppId',
  masterKey: process.env.PARSE_SERVER_MASTER_KEY || '',
  encryptionKey: process.env.PARSE_SERVER_ENCRYPTION_KEY, //Add your file key here. Keep it secret
  ...
});
await api.start();
```

Be sure not to lose your key or change it after encrypting files.

### Enabling encryption on a server that already has unencrypted files
When this is the case, it is recommended to start up a development parse-server (or a separate process from your main process) that has the same configuration as your production server. On the development server, initialize the file adapter as above with the new key and do the following after initialization in your `index.js`:

```javascript
//You probably want to back up your unencrypted files before doing this.
//This can take awhile depending on how many files and how large they are. It will attempt to rotate the key of all files in your filesSubDirectory
const {rotated, notRotated} =  await api.filesAdapter.rotateEncryptionKey();
console.log('Files rotated to newKey: ' + rotated);
console.log('Files that couldn't be rotated to newKey: ' + notRotated);
```

### Rotating your encryption key
Periodically you may want to rotate your encryptionKey for security reasons. When this is the case, it is recommended to start up a development parse-server (or a separate process from your main process) that has the same configuration as your production server. On the development server, initialize the file adapter with the new key and do the following in your `index.js` (you will need your `oldKey`):

```javascript
//This can take awhile depending on how many files and how large they are. It will attempt to rotate the key of all files in your filesSubDirectory
const {rotated, notRotated} =  await api.filesAdapter.rotateEncryptionKey({oldKey: oldKey});
console.log('Files rotated to newKey: ' + rotated);
console.log('Files that couldn't be rotated to newKey: ' + notRotated);
```

### Removing file encryption
When this is the case, it is recommended to start up a development parse-server (or a separate process from your main process) that has the same configuration as your production server. Different from the previous examples, don't initialize your fileAdapter with a `encryptionKey`. Pass in your `oldKey` to `rotateEncryptionKey()`.

```javascript
const api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.PARSE_SERVER_CLOUD || __dirname + '/cloud/main.js',
  appId: process.env.PARSE_SERVER_APPLICATION_ID || 'myAppId',
  masterKey: process.env.PARSE_SERVER_MASTER_KEY || '',
  //No encryptionKey here
  ...
});
await api.start();

//This can take awhile depending on how many files and how larger they are. It will attempt to rotate the key of all files in your filesSubDirectory
//It is not recommended to do this on the production server, deploy a development server to complete the process.
const {rotated, notRotated} =  await api.filesAdapter.rotateEncryptionKey({oldKey: oldKey});
console.log('Files rotated to unencrypted with noKey: ' + rotated);
console.log('Files that couldn't be rotated to unencrypted with noKey: ' + notRotated);

```

### Rotating the key for a subset of files
This is useful if for some reason there were errors and some of the files weren't rotated and returned in `notRotated`. The process is the same as the previous examples, but pass in your `oldKey` along with the array of `fileNames` to `rotateEncryptionKey()`.

```javascript
//This can take awhile depending on how many files and how large they are. It will attempt to rotate the key of all files in your filesSubDirectory
const {rotated, notRotated} =  await api.filesAdapter.rotateEncryptionKey({oldKey: oldKey, fileNames: ["fileName1.png","fileName2.png"]});
console.log('Files rotated to newKey: ' + rotated);
console.log('Files that couldn't be rotated to newKey: ' + notRotated);
```

## Configuring `S3Adapter`

If you'd like to use Amazon S3, follow these instructions to configure Parse Server to use `S3Adapter`.

### Set up your bucket and permissions

First you will create a bucket in S3 to hold these files.

1. Log into your [AWS account](https://console.aws.amazon.com/) or create a new one.
2. Head to the S3 service and choose **Create Bucket**
3. Fill out a unique **Bucket Name** and click **Create**. The bucket name should not contain any period '.' for `directAccess` to work. All other defaults are OK.
4. Now head to the Identity and Access Management (IAM) service.
5. Click the **Users** tab, then **Create New User**.
6. Fill out at least one user name and make sure **Generate an access key for each user** is selected before clicking **Create**.
7. Make sure to **Download Credentials** on the next screen.
8. Now select the **Policies** tab, then **Create Policy**.
9. Select **Create Your Own Policy**, fill out a **Policy Name**.
10. Copy the following config in **Policy Document**, changing **BUCKET_NAME** for the name of the bucket you created earlier. (note: this is a little more permissive than Parse Server needs, but it works for now)
  ```jsonc
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:*"
                ],
                "Resource": [
                    "arn:aws:s3:::BUCKET_NAME",
                    "arn:aws:s3:::BUCKET_NAME/*"
                ]
            }
         ]
     }
    ```
11. Make sure to **Validate Policy** first, then click **Create Policy**.
12. Go back to the **Users** tab and select the user you created earlier.
13. In Permissions, select **Attach Policy** and find the policy we just created to attach it.

### Configuration options

Writing to your Amazon S3 bucket from Parse Server is as simple as configuring and using the S3 files adapter.

#### Using environment variables

If you're running a standalone Parse Server, you can use the following environment variables to configure the S3 adapter:

| Variable Name | Description | Notes |
| ------------- | ----------- | ----- |
| PARSE_SERVER_FILES_ADAPTER  | Set this variable to './Files/S3Adapter.js'. | Required |
| S3_ACCESS_KEY               | The AWS access key for a user that has the required permissions. | Required |
| S3_SECRET_KEY               | The AWS secret key for the user. | Required |
| S3_BUCKET                   | The name of your S3 bucket. Needs to be globally unique in all of S3. | Required |
| S3_REGION                   | The AWS region to connect to. | Optional. Default: 'us-east-1' |
| S3_BUCKET_PREFIX            | Create all the files with the specified prefix added to the filename. Can be used to put all the files for an app in a folder with 'folder/'. | Optional. |
| S3_DIRECT_ACCESS            | Whether reads are going directly to S3 or proxied through your Parse Server. If set to true, files will be made publicly accessible, and reads will not be proxied. | Optional. Default: false |

#### Passing as options

If you're using Node.js/Express:

```javascript
...
var S3Adapter = require('parse-server').S3Adapter;

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  appId: process.env.APP_ID || 'APPLICATION_ID',
  masterKey: process.env.MASTER_KEY || 'MASTER_KEY',
  ...
  filesAdapter: new S3Adapter(
    "S3_ACCESS_KEY",
    "S3_SECRET_KEY",
    "S3_BUCKET",
    {directAccess: true}
  ),
  ...
});
```

Don't forget to change **S3_ACCESS_KEY**, **S3_SECRET_KEY** and **S3_BUCKET** to their correct value.

### Adapter Options

```js
new S3Adapter(accessKey, secretKey, bucket, options)
```

| Parameter | Description | Notes |
| --------- | ----------- | ----- |
| accessKey    | The AWS access key for a user that has the required permissions | Required. |
| secretKey    | The AWS secret key for the user | Required. |
| bucket       | The name of your S3 bucket. | Required. |
| options      | JavaScript object (map) that can contain: | |
| region       | Key in `options`. Set the AWS region to connect to. | Optional. Default: `us-east-1` |
| bucketPrefix | Key in `options`. Set to create all the files with the specified prefix added to the filename. Can be used to put all the files for an app in a folder with 'folder/'. | Optional. Default: `null` |
| directAccess | Key in `options`. Controls whether reads are going directly to S3 or proxied through your Parse Server. If set to true, files will be made publicly accessible, and reads will not be proxied. | Optional. Default: `false` |
| baseUrl | Key in `options`. The base URL the file adapter uses to determine the file location for direct access. | Optional. Default: `null`. To be used when `directAccess=true`. When set the file adapter returns a file URL in format `baseUrl/bucketPrefix` + `filename`. Example for `baseUrl='http://domain.com/folder'` and `bucketPrefix='prefix_'` the returned file location is  `http://domain.com/folder/prefix_file.txt`. |
| baseUrlDirect | Key in `options`. Is `true` if the file adapter should ignore the bucket prefix when determining the file location for direct access. | Optional. Default: `false`. To be used when `directAccess=true` and `baseUrl` is set. When set to `true`, the file adapter returns a file URL in format `baseUrl/filename`. Example for `baseUrl='http://domain.com/folder'` and `baseUrlDirect=true` the returned file location is `http://domain.com/folder/file.txt`. |
| globalCacheControl | Key in `options`. The `Cache-Control` http header to set in the file request. | Optional. Default: `null`. Example: `public, max-age=86400` for 24 hrs caching. More info [here](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9.1). |

### S3-compatible Services
#### Digital Ocean Spaces

[Digital Ocean Spaces](https://try.digitalocean.com/cloud-storage) is an S3-compatible storage service in the cloud. See their [documentation](https://docs.digitalocean.com/products/spaces/) for more details.

```javascript
const s3Options = {
  bucket: "SPACES_BUCKET_NAME",
  baseUrl: "SPACES_BASE_URL",
  region: "SPACES_REGION",
  bucketPrefix: "SPACES_BUCKET_PREFIX",
  s3overrides: {
    accessKeyId: "SPACES_ACCESS_KEY",
    secretAccessKey: "SPACES_SECRET_KEY",
    endpoint: 'SPACES_ENDPOINT'
  }
};
```

#### Linode Object Storage

[Linode Object Storage](https://www.linode.com/products/object-storage/) is an S3-compatible storage service in the cloud. See their [documentation](https://www.linode.com/docs/guides/how-to-use-object-storage/) for more details.

```js
const s3Options = {
  bucket: "S3_BUCKET_NAME",
  baseUrl: "S3_BASE_URL", // https://myBucket.myRegion.linodeobjects.com
  region: "S3_REGION", // possible values: eu-central-1 or us-east-1
  s3overrides: {
    accessKeyId: "S3_ACCESS_KEY", // bucket access key
    secretAccessKey: "S3_SECRET_KEY", // bucket secret key
    endpoint: "S3_ENDPOINT", // regionName.linodeobjects.com
  },
};
```

#### Backblaze B2 Cloud Storage

[Backblaze B2 Cloud Storage](https://www.backblaze.com/b2/cloud-storage.html) is an S3-compatible storage service in the cloud. See their [documentation](https://www.backblaze.com/b2/docs/) for more details.

```js
const s3Options = {
  bucket: "S3_BUCKET",
  baseUrl: "S3_BASE_URL", // taken from BackBlaze, normally https://BUCKET.s3.REGION.backblazeb2.com
  signatureVersion: 'v4',
  region: 'us-west-000',
  s3overrides: {
    endpoint: "S3_ENDPOINT", // check backblaze bucket endpoint
    accessKeyId: "S3_ACCESS_KEY",
    secretAccessKey: "S3_SECRET_KEY"
  },
};
```


## Configuring `GCSAdapter`

Unlike the S3 adapter, you must create a new Cloud Storage bucket, as this is not created automatically. See the Google Cloud guide on [Authentication](https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/master/guides/authentication) for more details.

To generate a private key in the Cloud Platform Console follow [these instructions](https://cloud.google.com/storage/docs/authentication#generating-a-private-key).

### Installation

Starting 2.2.6, GCS Adapter is not provided by default by parse-server. To install run:

```
npm install --save parse-server-gcs-adapter
```

### Configuration options

Writing to your Google Cloud Storage bucket from Parse Server is as simple as configuring and using the GCS files adapter.

#### Using environment variables

You can use Google Cloud Storage to host your static files by setting the following environment variables:

| Variable Name | Description | Notes |
| ------------- | ----------- | ----- |
| PARSE_SERVER_FILES_ADAPTER  | Set this variable to 'parse-server-gcs-adapter'. | Required. |
| GCP_PROJECT_ID              | The project ID from the Google Developer's Console. | Required. |
| GCP_KEYFILE_PATH            | Full path to the a .json, .pem, or .p12 key downloaded from the Google Developers Console. | Required. |
| GCS_BUCKET                  | The name of your GCS bucket. | Required. |
| GCS_BUCKET_PREFIX           | Create all the files with the specified prefix added to the filename. Can be used to put all the files for an app in a folder with 'folder/'. | Optional. |
| GCS_DIRECT_ACCESS           | Whether reads are going directly to GCS or proxied through your Parse Server. | Optional. Default: false |

#### Passing as options

If you're using Node.js/Express:

```javascript
...
var GCSAdapter = require('parse-server-gcs-adapter');

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  appId: process.env.APP_ID || 'APPLICATION_ID',
  masterKey: process.env.MASTER_KEY || 'MASTER_KEY',
  ...
  filesAdapter: new GCSAdapter(
    "GCP_PROJECT_ID",
    "GCP_KEYFILE_PATH",
    "GCS_BUCKET",
    {directAccess: true}
  ),
  ...
});
```

##### GCSAdapter constructor options

```js
new GCSAdapter(projectId, keyfilePath, bucket, options)
```

| Parameter | Description | Notes |
| --------- | ----------- | ----- |
| projectId    | The project ID from the Google Developer's Console. | Required. |
| keyfilePath  | Full path to the a .json, .pem, or .p12 key downloaded from the Google Developers Console. | Required. |
| bucket       | The name of your GCS bucket. | Required. |
| options      | JavaScript object (map) that can contain: | |
| bucketPrefix | Key in `options`. Set to create all the files with the specified prefix added to the filename. Can be used to put all the files for an app in a folder with 'folder/'. | Optional. Default: '' |
| directAccess | Key in `options`. Controls whether reads are going directly to GCS or proxied through your Parse Server. | Optional. Default: false |

## Configuring `FSAdapter`

To use the [FSAdapter](https://github.com/parse-community/parse-server-fs-adapter), simply initialize your Parse Server in `index.js` by doing the following:

```javascript
var FSFilesAdapter = require('@parse/fs-files-adapter');

var fsAdapter = new FSFilesAdapter({
  "filesSubDirectory": "my/files/folder" // optional, defaults to ./files
});

var api = new ParseServer({
	appId: 'my_app',
	masterKey: 'master_key',
	filesAdapter: fsAdapter
})
```

### Using `FSAdapter` with multiple instances of Parse Server
When using [parse-server-fs-adapter](https://github.com/parse-community/parse-server-fs-adapter) across multiple Parse Server instances it's important to establish "centralization" of your file storage (this is the same premise as the other file adapters, you are sending/recieving files through a dedicated link). You can accomplish this at the file storage level by Samba mounting (or any other type of mounting) your storage to each of your parse-server instances, e.g if you are using Parse Server via docker (volume mount your SMB drive to `- /Volumes/SMB-Drive/MyParseApp1/files:/parse-server/files`). All Parse Server instances need to be able to read/write to the same storage in order for parse-server-fs-adapter to work properly with parse-server. If the file storage isn't centralized, parse-server will have trouble locating files and you will get random behavior on client-side.

### Set up file encryption
File encryption is available in parse-server-fs-adapter 1.1.0+. The `FSAdapter` can encrypt files at rest for local storage using AES256-GCM, allowing the adapter to detect if files are tampered with.

To use, simply do the same as above, but add a `encryptionKey`:

```javascript
var FSFilesAdapter = require('@parse/fs-files-adapter');

var fsAdapter = new FSFilesAdapter({
  "filesSubDirectory": "my/files/folder", // optional, defaults to ./files
  "encryptionKey": "someKey" //mandatory if you want to encrypt files
});

var api = new ParseServer({
	appId: 'my_app',
	masterKey: 'master_key',
	filesAdapter: fsAdapter
})
```

Be sure not to lose your key or change it after encrypting files.

### Enabling encryption on a server that already has unencrypted files
When this is the case, it is recommended to start up a development parse-server (or a separate process from your main process) that has the same configuration as your production server. On the development server, initialize the file adapter as above with the new key and do the following after initialization in your `index.js`:

```javascript
//You probably want to back up your unencrypted files before doing this.
//This can take awhile depending on how many files and how large they are. It will attempt to rotate the key of all files in your filesSubDirectory
const {rotated, notRotated} =  await api.filesAdapter.rotateEncryptionKey();
console.log('Files rotated to newKey: ' + rotated);
console.log('Files that couldn't be rotated to newKey: ' + notRotated);
```

### Rotating your encryption key
Periodically you may want to rotate your `encryptionKey` for security reasons. When this is the case, it is recommended to start up a development parse-server (or a separate process from your main process) that has the same configuration as your production server. On the development server, initialize the file adapter with the new key and do the following in your `index.js` (you will need your `oldKey`):

```javascript
//This can take awhile depending on how many files and how large they are. It will attempt to rotate the key of all files in your filesSubDirectory
const {rotated, notRotated} =  await api.filesAdapter.rotateEncryptionKey({oldKey: oldKey});
console.log('Files rotated to newKey: ' + rotated);
console.log('Files that couldn't be rotated to newKey: ' + notRotated);
```

### Removing file encryption
When this is the case, it is recommended to start up a development parse-server (or a separate process from your main process) that has the same configuration as your production server. Different from the previous examples, don't initialize your fileAdapter with a `encryptionKey`. Pass in your `oldKey` to `rotateEncryptionKey()`.

```javascript
const api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.PARSE_SERVER_CLOUD || __dirname + '/cloud/main.js',
  appId: process.env.PARSE_SERVER_APPLICATION_ID || 'myAppId',
  masterKey: process.env.PARSE_SERVER_MASTER_KEY || '',
  filesAdapter: new FSFilesAdapter(), //No encryptionKey supplied
  ...
});
await api.start();

//This can take awhile depending on how many files and how larger they are. It will attempt to rotate the key of all files in your filesSubDirectory
//It is not recommended to do this on the production server, deploy a development server to complete the process.
const {rotated, notRotated} =  await api.filesAdapter.rotateEncryptionKey({oldKey: oldKey});
console.log('Files rotated to unencrypted with noKey: ' + rotated);
console.log('Files that couldn't be rotated to unencrypted with noKey: ' + notRotated);

```

### Rotating the key for a subset of files
This is useful if for some reason there were errors and some of the files weren't rotated and returned in `notRotated`. The process is the same as the previous examples, but pass in your `oldKey` along with the array of `fileNames` to `rotateEncryptionKey()`.

```javascript
//This can take awhile depending on how many files and how large they are. It will attempt to rotate the key of all files in your filesSubDirectory
const {rotated, notRotated} =  await api.filesAdapter.rotateEncryptionKey({oldKey: oldKey, fileNames: ["fileName1.png","fileName2.png"]});
console.log('Files rotated to newKey: ' + rotated);
console.log('Files that couldn't be rotated to newKey: ' + notRotated);
```
