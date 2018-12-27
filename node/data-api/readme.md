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


# Configuration
The server listens on port 4000 by default and requires just one mandatory configuration environmental variable to be set.

|Variable Name|Purpose|
|-------------|-------|
|MONGO_CONNSTR|**Required setting!** A valid [MongoDB connection string](https://docs.mongodb.com/v3.4/reference/connection-string/), e.g. `mongodb://localhost` or `mongodb://myhost.example.net:27017`. When using Azure Cosmos DB, obtain the full Mongo connection string from the Cosmos instance in the portal, which will include the username & password.
|PORT|Optional. Port the server will listen on. *Default: 4000*|
|MONGO_RETRIES|Optional. How many times the server will retry connecting to MongoDB. *Default: 5*|
|MONGO_RETRY_DELAY|Optional. How long to wait in seconds, before retry connecting to MongoDB. *Default: 5*|
|SECURE_CLIENT_ID|Optional. When set, certain admin API calls will be validated, leave blank or unset to disable security and validation. Details below. *Default: 'blank'*|
|AAD_V1|Optional. Use older Azure AD v1 issuer when validating tokens. Only used when SECURE_CLIENT_ID is set. Change this to true if you get 401 errors even with a valid user. *Default: false*|
|APPINSIGHTS_INSTRUMENTATIONKEY|Optional. Enables data collection and monitoring with Azure App Insights, set to the key of the instance you want to send data to. *Default: 'blank'*|


# Security
For demos it is suggested that the API is left open for ease of showing the API and the working app, however for a permanent or live instance it should be restricted.

The event PUT, POST and DELETE calls result in data modification, and are only called by the admin section of the Smilr client app. The configuration described here allows these calls to be placed behind an authentication scheme, to prevent direct API access. 

To switch on security for these three calls, set the `SECURE_CLIENT_ID` environmental variable to the client id of an [app registered with Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

HTTP request validation is done in `lib/utils.js` and the ***verifyAuthentication()*** method, validation is skipped entirely if SECURE_CLIENT_ID is unset or blank (Note. This is the default). This method calls on a library called 'azure-ad-jwt' in order to validate the tokens.  

> :speech_balloon: **Node.** At the time of writing (Dec 2018) there are some issues with the public version of 'azure-ad-jwt', so a locally modified copy is provided in `lib/azure-ad-jwt/`. The modifications are [detailed in this pull request](https://github.com/dei79/node-azure-ad-jwt/pull/13)

The validation logic first checks for the `authorization` header in the HTTP request, the bearer token is extracted and treated as a JWT, which is validated that it is signed and issued and signed by Azure AD. Lastly the token's 'audience claim' is checked that it matches the client id provided in `SECURE_CLIENT_ID`. This means the token was issued to our known registered app.  
Failure of any of these checks will result in no data being modified and a HTTP 401 error being returned (with a reason message in the body)

Once security is enabled, the Vue.js client will also need to be [similarly configured, with the matching AAD app client id used for validation](../../vue/#security)

> :speech_balloon: **Note.** If `SECURE_CLIENT_ID` is not set (which is the default), any tokens sent (in the authentication HTTP header) will simply be ignored, the header can also be omitted. Also the GET methods of the event API are always open and not subject to ANY validation, likewise the feedback API is left open by design
