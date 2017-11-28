require('dotenv').config()
var express = require('express');
var logger = require('morgan');
var app = express();
var bodyParser = require('body-parser')
var cors = require('cors');

// Allow all CORS
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

// To work with the Cosmos DB emulator, and self signed certs
if (app.get('env') !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// We need these set or it's impossible to continue!
if(!process.env.COSMOS_ENDPOINT || !process.env.COSMOS_KEY) {
  console.error("### !ERROR! Missing env variables `COSMOS_ENDPOINT` or `COSMOS_KEY`. Exiting!");
  process.exit(1)
}

// Routing to controllers
apiEvents = require('./api-events');
apiFeedback = require('./api-feedback');
apiOther = require('./api-other');
app.use('/', apiEvents);
app.use('/', apiFeedback);
app.use('/', apiOther);

// Start the server
var port = process.env.PORT || 4000;
var server = app.listen(port, function (){
   var host = server.address().address;
   var port = server.address().port;
   console.log(`### Server listening at http://${host}:${port}`);
});