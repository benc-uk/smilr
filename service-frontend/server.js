require('dotenv').config()
var express = require('express');
var app = express();
var static_dir = __dirname;

// Serve all Angular app static content (index.html, js, css, assets, etc.)
app.use('/', express.static(static_dir));

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

//
// This is VERY important, with out this, App Service Auth and AAD Login will not work!
// This prevents calls to /.auth (used by App Svc login flow) from being directed to our Angular code
//
app.get('/.auth/*', function (req, res) {
    res.end;
})

// Redirect all other requests to index.html, 
// - see https://angular.io/guide/deployment#server-configuration
app.use('*', function(req, res) {
   res.sendFile(`${static_dir}/index.html`);
});

// Start the server
var port = process.env.PORT || 3000;
var server = app.listen(port, function (){
   var host = server.address().address;
   var port = server.address().port;
   console.log(`### Server listening at http://${host}:${port}`);
});