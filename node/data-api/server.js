// Load .env file if it exists
require('dotenv').config()

const express = require('express');
const logger = require('morgan');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors');

// Our dataAccess library
var dataAccess = require('./lib/data-access');

// Allow all CORS
app.use(cors());

// Parse application/json
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

// We need this set or it's impossible to continue!
if(!process.env.MONGO_CONNSTR) {
  console.error("### !ERROR! Missing env variable MONGO_CONNSTR. Exiting!");
  process.exit(1)
}

// Routing to controllers
apiEvents = require('./routes/api-events');
apiFeedback = require('./routes/api-feedback');
apiOther = require('./routes/api-other');
app.use('/', apiEvents);
app.use('/', apiFeedback);
app.use('/', apiOther);

// Default port
var port = process.env.PORT || 4000;

// Connect to Mongo 
dataAccess.connectMongo(process.env.MONGO_CONNSTR)
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