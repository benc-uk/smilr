//
// Main Express server for Smilr Data API
// ---------------------------------------------
// Ben C, March 2018
//

// Load .env file if it exists
require('dotenv').config()

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

// We need this set or it's impossible to continue!
if(!process.env.MONGO_CONNSTR) {
  console.error("### !ERROR! Missing env variable MONGO_CONNSTR. Exiting!");
  process.exit(1)
}

// Allow all CORS and parse any JSON we receive
app.use(cors());
app.use(bodyParser.json())

// Enable Swagger UI, load in JSON definition doc
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, true));

// Set up logging
if (app.get('env') === 'production') {
    app.use(logger('combined'));
  } else {
    app.use(logger('dev'));
}
console.log(`### Node environment mode is '${app.get('env')}'`);

// Routing to controllers
app.use(require('./routes/api-events'));
app.use(require('./routes/api-feedback'));
app.use(require('./routes/api-other'));

// Global catch all for all requests not caught by other routes
// Just return a HTTP 400
app.use('*', function (req, res, next) {
  res.sendStatus(400);
})

// Get values from env vars or defaults where not provided
var port = process.env.PORT || 4000;
var monogUrl = process.env.MONGO_CONNSTR;  // Note. NO DEFAULT!
var retries = process.env.MONGO_RETRIES || 5;
var retryDelay = process.env.MONGO_RETRY_DELAY || 30;

//
// Connect to Mongo and start server
//
dataAccess.connectMongo(monogUrl, retries, retryDelay)
.then(() => {
  // This is important, pass our connected dataAccess 
  app.set('data', dataAccess);

  var server = app.listen(port, function () {
    var port = server.address().port;
    console.log(`### Server listening on ${server.address().port}`);
  });
})
.catch(err => {
  console.error(`### ERROR! Unable to connect to MongoDB!, URL=${process.env.MONGO_CONNSTR}`);
  console.error(err.message);
  process.exit(-1);
})