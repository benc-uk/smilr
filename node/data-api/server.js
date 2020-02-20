const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser')
const cors = require('cors');
const ExpressSwaggerGenerator = require('express-swagger-generator')

const databaseConnection = require('./core/database');
const apiRoutes = require('./core/routes');

// Load .env file if it exists
require('dotenv').config()

// Disable all console output when testing
if(process.env.NODE_ENV == 'test') console.log = function() {}

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

// Create express app
console.log(`### API service starting...`);
const app = express();

// Allow all CORS and parse any JSON we receive
app.use(cors());
app.use(bodyParser.json())

// Optionally initialize Passport for bearer token validation
if(process.env.SECURE_CLIENT_ID) require('./core/auth')(app)

// Set up logging based on environment (set by NODE_ENV)
if(app.get('env') === 'production') {
  app.use(logger('short'))
} else if(app.get('env') === 'test') {
  // Disable logging in test
} else {
  app.use(logger('dev'));
}
console.log(`### Node environment is: ${app.get('env')}`);

// Get config from env vars or defaults where not provided
const port = process.env.PORT || 4000;
var mongoUrl = process.env.MONGO_CONNSTR || process.env.MONGO_CONNECTION || process.env.MONGO_URL || `mongodb://localhost/smilrDb`
const mongoTimeout = process.env.MONGO_CONNECT_TIMEOUT || 30000

// Load API routes
apiRoutes(app);

// Set up express-swagger-generator
const expressSwagger = new ExpressSwaggerGenerator(app);
let options = {
  swaggerDefinition: {
    // Customize here, see docs https://github.com/pgroot/express-swagger-generator#usage
    info: {
      description: 'Smilr microservice, RESTful data API',
      title: 'Smilr API',
      version: '6.2.0',
    },
    produces: [
      "application/json",
    ]
  },
  basedir: __dirname, 
  files: ['./controllers/**/*.js', './models/**/*.js'] 
};
expressSwagger(options)

// Catch annoying favicon.ico & robot.txt requests, return nothing
app.get(['/favicon.ico', '/robots*.txt'], function (req, res, next) {
  res.sendStatus(204);
})

// Global catch all for all requests not caught by other routes
// Return a HTTP 404 plus our standard error response JSON
app.use('*', function (req, res, next) {
  // Fake dummy controller, so we can call _sendError()
  const ctrl = new (require('./controllers/controller'))(null);
  ctrl._sendError(res, new Error("API route not implemented"), "not-found", 404)
})

// =========================================
// Start the app and connect to MongoDB
// =========================================
app.listen(port, async () => {
  try {
    // When testing run in-memory database
    if(process.env.NODE_ENV == 'test') {
      const mongoMemSrv = require('mongodb-memory-server');
      const mongod = await new mongoMemSrv.MongoMemoryServer();
      mongoUrl = await mongod.getConnectionString();
    }

    // Try to connect to database, and await the promise returned 
    await new databaseConnection(mongoUrl, mongoTimeout);

    console.log(`### Connected OK. Server up & listening on port ${port}`);
  } catch(err) {
    console.log(`### Error connecting to MongoDB: ${err}\n### Terminating...`);
    process.exit(1);
  }
});

// Only required for unit tests
module.exports.app = app;