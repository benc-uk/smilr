# :warning: NO LONGER MAINTAINED! 
### THIS CODE & ASSOCIATED DOCS ARE NO LONGER MAINTAINED.  
This section of the repo is only kept for historical purposes

----

There are two serverless components to Smilr, and both are optional

## Data Enrichment - Sentiment Analysis
This optional component enriches data as feedback is submitted. It takes any comment text in the feedback and runs it through Azure Text Analytics Cognitive Services. The resulting sentiment score (normalized 0.0 ~ 1.0) is added to the feedback document in the database.

The is implemented in Azure Functions, using the Cosmos DB change trigger, so that when new items are added to the DB, the function runs and processes them. The Function then writes the document back to Cosmos DB via the Node.js MonogDB driver to update the document. The update was done this way as you can not use the Functions output bindings for Cosmos with MongoDB. The Function is written in Node.js

Further notes are [included with the code here](./sentimentScore)

## Data API Serverless Version

***SECTION NEEDS UPDATING***

The data-api service has been re-implemented in a serverless model, this is also using Azure Functions. This component is optional as functionally it is identical to the "normal" non-serverless version of the service. It has been created as a small proof of concept around the idea of using serverless design in a RESTful microservices app, such as Smilr.

The complete API of data-api service has not been replicated, rather a minimum subset has been implemented, in order to get the front end functional and users can submit feedback. The admin part of the API and front end has been omitted.

Azure Functions and Azure Functions Proxies are used to reproduce the same REST API as the regular Node service. There are two Functions, the [eventsAPI](azure/functions/eventsAPI/) and [feedbackAPI](azure/functions/feedbackAPI/), both written in JavaScript and ported from the Node.js code with very little change. 

The exact same [data access library](node/data-api/lib/data-access.js) used by the Node service is used by the Functions version, meaning 100% code reuse without any change.

## Deploying Serverless Data API
You can deploy the serverless data-api any v2 Functions App, simply copy the whole of the [azure-functions](azure/functions/) to the App Service, into `wwwroot`. 

> :exclamation::speech_balloon: **Note.** Version 2 of Functions is required along with Node v8+ due to the use of Promises and async/await in the data access library

![](https://user-images.githubusercontent.com/14982936/36417631-5e5c4cca-1624-11e8-9e22-65e7ff2e31bd.png)

The NPM packages used by the data-access library to connect to MongoDB will need to be installed. After copying all the files to your Function App (including package.json) go into the portal for your Function App, then into 'Platform Features' and 'Console', from there run `npm install`

The [proxies.json](azure/functions/proxies.json) file will need to be modified and the `backendUri` values changed to point to your instance of Functions by altering the "changeme" part. You can also change this using the Functions web Portal in the Proxies section
