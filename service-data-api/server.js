// Load .env file if it exists
require('dotenv').config()

const express = require('express');
const logger = require('morgan');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors');

// Allow all CORS
app.use(cors());

// Parse application/json
app.use(bodyParser.json())

// Enable Swagger UI
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
apiEvents = require('./routes/api-events');
apiFeedback = require('./routes/api-feedback');
apiOther = require('./routes/api-other');
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