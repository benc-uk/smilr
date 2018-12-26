//
// Main Express server for Smilr Data API
// ----------------------------------------------
// Ben C, March 2018
//

// Load .env file if it exists
require('dotenv').config()

// Load in modules, and create Express app 
var express = require('express');
var app = express();

// Serve static content from working directory ('.') by default
// - Optional parameter can specify different location, use when debugging & running locally
// - e.g. `node server.js ../angular/dist/`
var staticContentDir = process.argv[2] || __dirname;
// resolve to an absolute path
staticContentDir = require('path').resolve(staticContentDir)
console.log(`### Content dir = '${staticContentDir}'`);

// Serve all Angular app static content (index.html, js, css, assets, etc.)
app.use('/', express.static(staticContentDir));

//
// MICRO API allowing dynamic configuration of the client side Angular
// Allow Angular to fetch a comma separated set of environmental vars from the server
//
app.get('/.config/:vars', function (req, res) {
    let data = {};
    req.params.vars.split(",").forEach(varname =>{
        data[varname] = process.env[varname];
    })
    res.send(data);
});

// Redirect all other requests to Angular app - i.e. index.html
// This allows us to do in-app, client side routing and deep linking 
// - see https://angular.io/guide/deployment#server-configuration
app.use('*', function(req, res) {
   res.sendFile(`${staticContentDir}/index.html`);
});

//
// Start the Express server
//
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
    var port = server.address().port;
    console.log(`### Server listening on ${server.address().port}`);
 });