require('dotenv').config()
var express = require('express');
var logger = require('morgan');
var app = express();
var fs = require("fs");

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set up logging
if (app.get('env') === 'production') {
    app.use(logger('combined'));
  } else {
    app.use(logger('dev'));
}
console.log(`### Node environment mode is '${app.get('env')}'`);

// Serve static content
app.use('/public', express.static('public'))

// Routing to controllers
var route_path = "./routes/";
fs.readdirSync(route_path).forEach( function(file) {
  console.log(`### Loading routes from ${route_path}${file}`);
  var route = require(route_path + file);
  app.use('/', route);
});

// Start the server, wow!
var port = process.env.PORT ||  3000
app.listen(port);
console.log(`### Server listening on port ${port}`);