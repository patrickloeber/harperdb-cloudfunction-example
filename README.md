# HarperDB Custom Functions Template

 This repo comprises a set of Fastify routes, helpers, and static content to be loaded by HarperDB's Custom Functions Fastify Server.

To deploy this template, simply clone this repo into your `custom_functions` folder. By default, this folder is located in your HarperDB user folder `(~/hdb)`.

**Routes are automatically prefixed with their parent folder name.**

## Routes

---

### GET /

NO preValidation AND USING hdbCore.requestWithoutAuthentication
BYPASSES ALL CHECKS: DO NOT USE RAW USER-SUBMITTED VALUES IN SQL STATEMENTS

```
  server.route({
    url: '/',
    method: 'GET',
    handler: (request) => {
      request.body= {
        operation: 'sql',
        sql: 'SELECT * FROM dev.dogs ORDER BY dog_name'
      };
      return hdbCore.requestWithoutAuthentication(request);
    }
  })
```

### POST /

STANDARD PASS-THROUGH BODY, PAYLOAD AND HDB AUTHENTICATION

```
server.route({
    url: '/',
    method: 'POST',
    preValidation: hdbCore.preValidation,
    handler: hdbCore.request,
  })
```

### GET /:id

WITH ASYNC THIRD-PARTY AUTH PREVALIDATION

```
  server.route({
    url: '/:id',
    method: 'GET',
    preValidation: (request) => customValidation(request, logger),
    handler: (request) => {
      request.body= {
        operation: 'sql',
        sql: `SELECT * FROM dev.dog WHERE id = ${request.params.id}`
      };

      /*
       * requestWithoutAuthentication bypasses the standard HarperDB authentication.
       * YOU MUST ADD YOUR OWN preValidation method above, or this method will be available to anyone.
       */
      return hdbCore.requestWithoutAuthentication(request);
    }
  });
```

## Helpers

---
THE ASYNCRONOUS THIRD PARTY VALIDATION, FROM helpers/example.js:

```
const customValidation = async (request,logger) => {
  const options = {
    hostname: 'jsonplaceholder.typicode.com',
    port: 443,
    path: '/todos/1',
    method: 'GET',
    headers: { authorization: request.headers.authorization },
  };

  const result = await authRequest(options);

  /*
   *  throw an authentication error based on the response body or statusCode
   */
  if (result.error) {
    const errorString = result.error || 'Sorry, there was an error authenticating your request';
    logger.error(errorString);
    throw new Error(errorString);
  }
  return request;
};

module.exports = customValidation;
```

THE ACTUAL HTTP CALL USED IN authRequest, also in helpers/example.js:

```
const authRequest = (options) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(responseBody));
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};
```

## Static Files (Web UI)

---

By adding a `/static` folder to your project, you can also host static files. You might, for example, create a dashboard that displays summary data based on standard HarperDB operations or Custom Functions that pull data from HarperDB.

- **Your static folder MUST contain an `index.html` file**
- **You must use absolute paths for assets (start with a slash)**

---

INDEX.HTML

```
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <link rel="icon" href="/resources/img/favicon.png" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>HarperDB Custom Functions Static Template</title>
  <link href="/resources/css/style.css" rel="stylesheet">
</head>
<body>
  <div id="app">
    <div id="app-content">
      <img width="64" height="64" src="/resources/img/logo.png" /><br /><br />
      <b>HarperDB Custom Functions Static Template</b><br /><br />
      Edit or replace this file to create and host your own custom UI.
    </div>
    <div id="app-bg-color" />
    <div id="app-bg-dots" />
  </div>
</body>
</html>
```
