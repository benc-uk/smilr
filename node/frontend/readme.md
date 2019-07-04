# Node.js - Frontend Server
This is a simple server for serving the bundled/minified Vue.js static files. It is written in Node.js and Express. This is a stateless service and consists of a single `server.js` file


# Building & Running Locally
Make sure you have Node.js v10+ and NPM installed.

You will need to build/bundle the Vue.js app so you have something to actually serve, refer to the [Vue.js SPA docs](../../vue) and the section 'Compile & Bundle for Production'. We assume you leave the bundled output in the default location of `vue/dist`

Then from the main Smilr project root run:
```
cd node/frontend
npm install
STATIC_DIR=../../vue/dist npm start
```


# Configuration
The server listens on port 3000 by default and requires no configuration in order to run

The server serves static content using `express.static`. The location of the files to be served defaults to the local working directory, i.e. the bundled Vue.js files (HTML, JS, CSS, etc) are copied to the root along side `server.js` and `package.json`. However you can optionally supply a relative path to the location of the bundled content with the environmental variable `STATIC_DIR`, which is show in the example above `STATIC_DIR=../../vue/dist npm start`

Setting the configuration `AAD_CLIENT_ID` will switch on security. The value should be the client id of an [app registered with Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app). Setting this changes the app behavior in two ways

|Variable Name|Purpose|
|-------------|-------|
|PORT|Optional. Port the server will listen on. *Default: 3000*|
|STATIC_DIR|Optional. Directory with Vue build output, i.e. the bundled static output. *Default: same dir as server.js*|

> *NOTE.* Although these are the config environmental variables used by the frontend service itself, due to the config endpoint (see below) which passes variables to the Vue client app, there are several client specific variables you probably want to set in order to configure the client. These are covered in detail in [the Vue client docs](../../vue)


# Configuration Endpoint
The frontend server presents a special 'mini' API located at `/.config` this endpoint responds to GET requests and will return values of any environmental variable on the server as JSON. This is a workaround to a well known configuration limitation of all client side JS apps

The API takes a comma separated list of environmental variable names, and returns them in a single JSON object as a dictionary of key-value pairs.

Example: **GET `/.config/HOSTNAME,FOO`** will result in 
```json
{
  "HOSTNAME": "webserver001", 
  "FOO": "Value of foo"
}
```

This config endpoint is used only once and at startup by the Vue.js app (in `main.js`) and is called with a list of configuration variables that it accepts (currently `API_ENDPOINT, AAD_CLIENT_ID`). If any of these are set on the frontend server either with a `.env` file, through running as a container/pod or as a real OS env variable, they will be sent to the Vue.js client and used dynamically at runtime


# Routing

The Vue.js app uses history mode in the router https://router.vuejs.org/guide/essentials/history-mode.html  
This means we need to direct all URL requests that aren't static files to the SPA, i.e. to index.html and let the Vue router handle them. This allows us to do in-app, client side routing and deep linking 

This is easily done with Express

```js
app.use('*', function(req, res) {
   res.sendFile(`${staticContentDir}/index.html`);
});
```

