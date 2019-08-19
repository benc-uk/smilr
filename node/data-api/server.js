//
// Main Express server for Smilr Data API
// ---------------------------------------------
// Ben C, March 2018
// - Updated Aug 2019
//

// Load .env file if it exists
require('dotenv').config()

// Disable all console output when testing
if(process.env.NODE_ENV === 'test') console.log = function() {}

console.log(`### Smilr data API service starting...`);

// App Insights. Set APPINSIGHTS_INSTRUMENTATIONKEY as App Setting or env var
if(process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  const appInsights = require("applicationinsights");
  appInsights.setup()
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true, true)
  .setUseDiskRetryCaching(true);
  appInsights.start();
  console.log("### Server will report data to App Insights");
}

// Load in modules, and create Express app 
const express = require('express');
const logger = require('morgan');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors');

// Include our data-access library for MongoDB
var dataAccess = require('./lib/data-access');
const ApiError = require('./lib/api-error');
const Utils = require('./lib/utils')

// We need this set or it's impossible to continue!
if(!process.env.MONGO_CONNSTR) {
  console.error("### !ERROR! Missing env variable MONGO_CONNSTR. Exiting!");
  process.exit(1)
}

// Allow all CORS and parse any JSON we receive
app.use(cors());
app.use(bodyParser.json())

// Initialize Passport for bearer token validation
if(process.env.SECURE_CLIENT_ID) require('./lib/auth')(app)

// Enable Swagger UI, load in JSON definition doc
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, true));

// Set up logging
if(app.get('env') === 'production') {
  app.use(logger('combined'));
} else if(app.get('env') === 'test') {
  // disable logging
} else {
  app.use(logger('dev'));
}
console.log(`### Node environment mode is '${app.get('env')}'`);

// Main routing and API hooks here
app.use(require('./routes/api-events'));
app.use(require('./routes/api-feedback'));
app.use(require('./routes/api-other'));

// Catch annoying favicon.ico & robot.txt requests, return nothing
app.get(['/favicon.ico', '/robots*.txt'], function (req, res, next) {
  res.status(204).send();
})

// Global catch all for all requests not caught by other routes
// Just return a HTTP 404
app.use('*', function (req, res, next) {
  Utils.sendError(res, new ApiError(`No matching route for ${req.originalUrl}`, 404));
})

// Get values from env vars or defaults where not provided
var port = process.env.PORT || 4000;
var monogUrl = process.env.MONGO_CONNSTR;  // Note. NO DEFAULT!
var retries = process.env.MONGO_RETRIES || 6;
var retryDelay = process.env.MONGO_RETRY_DELAY || 15;

if(process.env.NODE_ENV == 'test') {
  var server = require('http').createServer(app);
  server.listen(port);
  console.log(`### TEST MODE API server listening on ${server.address().port}`); 
  module.exports = app;
  return;
}

//
// Connect to Mongo and start server
//
dataAccess.connectMongo(monogUrl, retries, retryDelay)
.then(() => {
  // This is important, pass our connected dataAccess 
  app.set('data', dataAccess);

  var server = require('http').createServer(app);
  server.keepAliveTimeout = 0; // This is a workaround for WSL v2 issues
  server.listen(port);
  console.log(`### API server listening on ${server.address().port}`);  
  // var server = app.listen(port, function () {
  //   var port = server.address().port;
  //   console.log(`### API server listening on ${server.address().port}`);
  // });
})
.catch(err => {
  console.error(`### ERROR! Unable to connect to MongoDB!, URL=${process.env.MONGO_CONNSTR}`);
  console.error(err.message);
  process.exit(-1);
})

module.exports = app;