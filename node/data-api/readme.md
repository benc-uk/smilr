# Node.js - Data API
This is a instantiation of the [Smilr API](../../docs/api-model) using Node.js and Express. It acts as the REST API endpoint for the Vue.js client app. This is a stateless service.

This app is based on the [**Node API starter template**](https://github.com/benc-uk/nodejs-api-starter)

Features:
- Separation of controllers, services, models & routes
- [Mongoose](https://mongoosejs.com/) for MongoDB interaction
- Unit tests via Mocha, [SuperTest](https://www.npmjs.com/package/supertest) and [mongodb-memory-server](https://www.npmjs.com/package/mongodb-memory-server)
- [Istanbul/nyc](https://www.npmjs.com/package/nyc) for code coverage
- Swagger auto generation & Swagger UI using [express-swagger-generator](https://www.npmjs.com/package/express-swagger-generator)
- A Dockerfile for containerisation
- 

# Building & Running Locally
Make sure you have Node.js v10+ and NPM installed.

Ensure the `MONGO_CONNSTR` environment variable is set as described below and is pointing at a running instance of MongoDB.  
Then from the main Smilr project root run:
```
cd node/data-api
npm install
npm start
```

# Project Structure
The project follows a fairly standard MVC style structure, except there are no views. This being an API, all data is returned as JSON

- `controllers/` - controllers, including base **Controller** class. HTTP interface layer
- `models/` - models, classes should initalize a Mogoose schema, and return instances of Mongoose models
- `services/` - services, carry out CRUD operations against the database via the models. Includes base **Service** class
- `core/` - main database connection and app routes

Controllers, models, services and routes for Smilr *events* and *feedback* have been created in line with [the Smilr API spec](../../docs/api-model.md)

# Sentiment Analysis
Optionally the service can pass feedback comments through Azure cognitive services (Text Analytics) for sentiment analysis. Any comments in the feedback POSTed to the API will be sent over to an external text analytics API endpoint. The resulting scores will be stored with the feedback objects in the database 

Enabling of this feature is done by setting the `SENTIMENT_API_ENDPOINT` environmental variable. By default this feature is not enabled

# Configuration
The server listens on port 4000 by default

|Variable Name|Purpose|
|-------------|-------|
|PORT|Optional. Port the server will listen on. *Default: 4000*|
|MONGO_CONNSTR|A valid [MongoDB connection string](https://docs.mongodb.com/v4.2/reference/connection-string/), e.g. `mongodb://myhost.example.net:27017`. When using Azure Cosmos DB, obtain the full Mongo connection string from the Cosmos instance in the portal, which will include the username & password. *Default: mongodb://localhost*
|MONGO_CONNECT_TIMEOUT|Optional. How many milliseconds the server will try connecting to MongoDB at startup. *Default: 30000*|
|MONGO_DB_NAME|Optional. Name of the database to use in MongoDB. *Default: SmilrDb*|
|SECURE_CLIENT_ID|Optional. When set, certain admin API calls will be validated, leave blank or unset to disable security and validation. Details below. *Default: 'blank'*|
|APPINSIGHTS_INSTRUMENTATIONKEY|Optional. Enables data collection and monitoring with Azure App Insights, set to the key of the instance you want to send data to. *Default: 'blank'*|
|SENTIMENT_API_ENDPOINT|Optional. When set, the feedback comment text will be processed for sentiment analysis using Azure Cognitive Services. Endpoint can point to a self hosted instance running in a container, or a Azure hosted API endpoint *Default: 'blank'*|
|SENTIMENT_API_KEY|Optional. If `SENTIMENT_API_ENDPOINT` points to Azure hosted Cognitive Service (e.g. `https://westeurope.api.cognitive.microsoft.com`), place the API key here, otherwise can be omitted *Default: 'blank'*|

# Security
For demos it is suggested that the API is left open for ease of showing the API and the working app, however for a permanent or live instance it should be restricted.

The event PUT, POST and DELETE calls result in data modification, and are only called by the admin section of the Smilr client app. The configuration described here allows these calls to be placed behind an authentication scheme, to prevent direct API access. 

To switch on security for these calls, set the `SECURE_CLIENT_ID` environmental variable to the client id of an [app registered with Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

Request & token validation is done by Passport.js (standard authenication middleware for Node.js Express) and the [Azure AD plugin](https://github.com/AzureAD/passport-azure-ad). This is configured as middleware to validate bearer tokens supplied on the certain sensitive routes mentioned above. `passport.authenicate` is called before those routes are run, and the tokens fetched and checked with the logic in `lib/auth.js`. We ensure the tokens are signed and valid, contain the `smilr.events` scope and also come from our registered app (audience)

Once security is enabled, the Vue.js client will also need to be [similarly configured, with the matching AAD app client id used for validation](../../vue/#security)

> :speech_balloon: **Note.** If `SECURE_CLIENT_ID` is not set (which is the default), any tokens sent (in the authentication HTTP header) will simply be ignored, the header can also be omitted. Also the GET methods of the event API are always open and not subject to ANY validation, likewise the feedback API is left open by design
