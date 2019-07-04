//
// Main Express server for Smilr frontend
// ----------------------------------------------
// Ben C, March 2018
// - Updated: May 2019
//

// Load .env file if it exists
require('dotenv').config()

console.log(`### Smilr frontend service starting...`);

// Load in modules, and create Express app 
const express = require('express');
const app = express();
const cors = require('cors');

// Serve static content from working directory ('.') by default
// - Optional parameter can specify different location, use when debugging & running locally
// - e.g. `node server.js ../vue/dist/`
//var staticContentDir = process.argv[2] || __dirname;
var staticContentDir = process.env.STATIC_DIR || __dirname;
// resolve to an absolute path
staticContentDir = require('path').resolve(staticContentDir)
console.log(`### Content dir = '${staticContentDir}'`);

// Serve all Angular app static content (index.html, js, css, assets, etc.)
app.use('/', express.static(staticContentDir));
app.use(cors());

//
// MICRO API allowing dynamic configuration of the client side Vue.js
// Allow Vue.js to fetch a comma separated set of environmental vars from the server
//
app.get('/.config/:vars', function (req, res) {
  let data = {};
  req.params.vars.split(",").forEach(varname =>{
      data[varname] = process.env[varname];
  })
  res.send(data);
});

// Extra info for debugging
if(process.env['API_ENDPOINT']) {
  console.log(`### Will use API endpoint: ${process.env['API_ENDPOINT']}`);
}

// Redirect all other requests to Vue.js app - i.e. index.html
// This allows us to do in-app, client side routing and deep linking 
// - see https://cli.vuejs.org/guide/deployment.html#general-guidelines
app.use('*', function(req, res) {
  res.sendFile(`${staticContentDir}/index.html`);
});

//
// Start the Express server
//
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  console.log(`### Frontend server listening on ${server.address().port}`);
});