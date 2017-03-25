# loopback-file-upload-example

> Example of using file system storage or AWS S3 for file uploads in Loopback.

## Configuration

**Filesystem storage:**

Configure storage directory in `server/datasources.json`

**AWS S3:**

Configure AWS S3 settings in `server/datasources.json`

**Storage buckets:**

Configure static or dynamic bucket names in `common/models/asset.js`

**Storage type:**

Configure whether to use file system storage or S3 storage in `server/model-config.js` for `container` model.

## Instructions

```bash
$ npm install
$ npm start
```

## Examples

Upload a file

```bash
$ curl -X POST -F file=@hello.txt -F name=Hello http://localhost:3000/api/assets/upload

{"name":"Hello","filename":"hello.txt","type":"text/plain","size":5,"id":1}
```

Delete a file

```bash
$ curl -X DELETE http://localhost:3000/api/assets/1

{"count":1}
```

## Resources

-

# License

MIT