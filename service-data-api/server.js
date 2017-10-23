require('dotenv').config()
var express = require('express');
var logger = require('morgan');
var app = express();
var bodyParser = require('body-parser')
var cors = require('cors');

app.use(cors());

// Parse application/json
app.use(bodyParser.json())

// Set up logging
if (app.get('env') === 'production') {
    app.use(logger('combined'));
  } else {
    app.use(logger('dev'));
}
console.log(`### Node environment mode is '${app.get('env')}'`);

// We need these set or it's impossible to continue!
if(!process.env.APPSETTING_STORAGE_ACCOUNT || !process.env.APPSETTING_STORAGE_KEY) {
  console.error("### !ERROR! Missing env variables `APPSETTING_STORAGE_ACCOUNT` or `APPSETTING_STORAGE_KEY`. Exiting!");
  process.exit(1)
}

// Routing to controllers
api = require('./api');
app.use('/', api);

// Start the server
var port = process.env.PORT || 4000;
var server = app.listen(port, function (){
   var host = server.address().address;
   var port = server.address().port;
   console.log(`### Server listening at http://${host}:${port}`);
});