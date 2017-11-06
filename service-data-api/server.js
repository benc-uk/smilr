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
if(!process.env.STORAGE_ACCOUNT || !process.env.STORAGE_KEY) {
  console.error("### !ERROR! Missing env variables `STORAGE_ACCOUNT` or `STORAGE_KEY`. Exiting!");
  process.exit(1)
}

// Routing to controllers
api_events = require('./api_events');
api_feedback = require('./api_feedback');
api_other = require('./api_other');
app.use('/', api_events);
app.use('/', api_feedback);
app.use('/', api_other);

// Start the server
var port = process.env.PORT || 4000;
var server = app.listen(port, function (){
   var host = server.address().address;
   var port = server.address().port;
   console.log(`### Server listening at http://${host}:${port}`);
});