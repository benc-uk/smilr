// Load in modules, and create Express app 
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser')
const cors = require('cors');
const database = require('./lib/database');

// Load .env file if it exists
require('dotenv').config()

console.log(`### Smilr data API service starting...`);
const app = express();
// Allow all CORS and parse any JSON we receive
app.use(cors());
app.use(bodyParser.json())

// Set up logging
if(app.get('env') === 'production') {
  app.use(logger('short'))
} else if(app.get('env') === 'test') {
  // disable logging
} else {
  app.use(logger('dev'));
}
console.log(`### Node environment mode is '${app.get('env')}'`);

// Get values from env vars or defaults where not provided
const PORT = process.env.PORT || 4000;
const MONGO_CONNSTR = process.env.MONGO_CONNSTR || `mongodb://localhost/smilrDb`
const MONGO_RETRIES = process.env.MONGO_RETRIES || 6;
const MONGO_RETRY_DELAY = process.env.MONGO_RETRY_DELAY || 15;


//
//
//
const setRoutes = require('./lib/routes');
setRoutes(app);

const server = app.listen(PORT, () => {
  console.log(`### Started, & listening on port ${PORT}`);
  try {
    new database(MONGO_CONNSTR)
    .catch(e => {
      console.log(`### Error connecting to MongoDB: ${e}`);
      process.exit(1);
    }) 
  } catch(err) {
    console.log(`### Error connecting to MongoDB: ${err}`);
    process.exit(1);
  }
});
