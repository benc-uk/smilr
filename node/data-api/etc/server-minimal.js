const express = require('express');
const bodyParser = require('body-parser')

const databaseConnection = require('./core/database');
const apiRoutes = require('./core/routes');

console.log(`### API service starting...`);
const app = express();
app.use(bodyParser.json())

const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGO_CONNSTR || process.env.MONGO_CONNECTION || process.env.MONGO_URL || `mongodb://localhost`
const mongoTimeout = process.env.MONGO_CONNECT_TIMEOUT || 30000

apiRoutes(app);

app.listen(port, async () => {
  try {
    await new databaseConnection(mongoUrl, mongoTimeout);
    console.log(`### Connected OK. Server up & listening on port ${port}`);
  } catch(err) {
    console.log(`### Error connecting to MongoDB: ${err}\n### Terminating...`);
    process.exit(1);
  }
});