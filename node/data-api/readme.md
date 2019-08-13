# Node.js - Data API
This is a instantiation of the [Smilr API](../../docs/api-model) using Node.js and Express. It acts as the REST API endpoint for the Vue.js client app. This is a stateless service. The main API routes & logic are held in `routes/api_events.js`, `routes/api_feedback.js`, `routes/api_other.js`


# Building & Running Locally
Make sure you have Node.js v8.9+ and NPM installed.

Ensure the `MONGO_CONNSTR` environment variable is set as described below.  
Then from the main Smilr project root run:
```
cd node/data-api
npm install
npm start
```


# Data Access
All data is held in MongoDB, the data access layer is a plain ES6 class **DataAccess** in [`lib/data-access.js`](lib/data-access.js). This is a singleton which encapsulates all MongoDB specific code and logic (e.g. connecting and creating the database, collections etc) and also operations on the event and feedback entities. See [Database](../../docs/database.md) for more details.


# Sentiment Analysis
Optionally the service can pass feedback comments through Azure cognitive services (Text Analytics) for sentiment analysis. Any comments in the feedback POSTed to the API will be sent over to an external text analytics API endpoint. The resulting scores will be stored with the feedback objects in the database 

Enabling of this feature is done by setting the `SENTIMENT_API_ENDPOINT` environmental variable. By default this feature is not enabled

# Configuration
The server listens on port 4000 by default and requires just one mandatory configuration environmental variable to be set.

|Variable Name|Purpose|
|-------------|-------|
|MONGO_CONNSTR|**Required setting!** A valid [MongoDB connection string](https://docs.mongodb.com/v3.4/reference/connection-string/), e.g. `mongodb://localhost` or `mongodb://myhost.example.net:27017`. When using Azure Cosmos DB, obtain the full Mongo connection string from the Cosmos instance in the portal, which will include the username & password.
|PORT|Optional. Port the server will listen on. *Default: 4000*|
|MONGO_RETRIES|Optional. How many times the server will retry connecting to MongoDB. *Default: 6*|
|MONGO_RETRY_DELAY|Optional. How long to wait in seconds, before retry connecting to MongoDB. *Default: 15*|
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
