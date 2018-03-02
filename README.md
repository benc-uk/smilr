# Microservices Demo App

This is a multi component application designed to showcase microservices design patterns & deployment architectures. It consists of a front end single page application (SPA), two lightweight services, supporting database and back end data enrichment functions.

The application is called *'Smilr'* and allows people to provide feedback on events or sessions they have attended via a simple web & mobile interface. The feedback consists of a rating (scored 1-5) and supporting comments.

- The user interface is written in Angular (Angular 5) and is completely de-coupled from the back end, which it communicates with via REST. The UI is fully responsive and will work on on both web and mobile.

- The two microservices are both written in Node.js using the Express framework. These have been containerized so can easily be deployed & run as containers

- The database is a NoSQL document store holding JSON, provided by *Azure Cosmos DB*

The app has been designed to be deployed to Azure, but the flexible nature of the design & chosen technology stack results in a wide range of deployment options and compute scenarios, including:
- Containers: *Azure Container Service (ACS or AKS)* or *Azure Container Instances* 
- Platform services: Regular Windows *Azure App Service (Web Apps)* or Linux *Web App for Containers*
- Serverless: *Azure Functions*
- Virtual Machines: Sub-optimal but theoretically possible

This application supports a range of demonstration, and learning scenarios, such as:
 - A working example of microservices design
 - Use of containers, Docker & Kubernetes
 - No-SQL and document stores over traditional relational databases
 - Development and deployment challenges of single page applications 
 - Platform services for application hosting
 - Using serverless technology to support or provide services
 - Use of an open source application stack such as Angular and Node.js
 - RESTful API design 

---

# :boom: March 3rd 2018 :boom:
**This repo has undergone a major restructure, with the entire folder layout being modified - this readme is yet to be updated, most links to files and folders will be incorrect**

---


# Architecture & Core App Components
![arch](https://user-images.githubusercontent.com/14982936/32730129-fb8583b2-c87d-11e7-94c4-547bfcbfca6b.png)

The main app components are:
1) [Angular front end UI](#angular)
1) [Frontend service](#front)
1) [Backend data API service](#data-api)
1) [Database](#db)
1) [Optional serverless components](#serverless) 

These will be each described in their own sections below. 

-----------------------------------------------------------------------------------------------------

<a name="angular"></a>

# Component 1 - Angular Front End UI 
This app was generated with the [Angular CLI](https://github.com/angular/angular-cli) and uses Angular 5.0. To build and run you will need Node.js installed (6.11 and 8.9 have been tested) and also NPM. To install the Angular CLI run `npm install @angular/cli -g`, v1.5.0 or higher will be needed. 

### Development Server
First install packages from NPM by running `npm install`. Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
When running in non production (or dev) mode, InMemoryDbService is used to provide a mock HTTP API and datastore, this will intercept all HTTP calls made by the app and act as both the API and DB.

### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. You should use the `--prod` flag for a production build.

### API endpoint configuration
***IMPORTANT!*** The API endpoint for the backend data service must be set, there are two ways this is done, depending on if you are running in non production (e.g. from `ng serve`) or in production mode:
- **Non production:** The API endpoint is set in [environment.ts](angular-src/environments/environment.ts), see comments in there for details. ***However in non-prod mode the value of this setting is always ignored*** as the InMemoryDbService intercepts all calls
- **Production mode:** The API endpoint is fetched dynamically at runtime, from the frontend server where it is set as an environmental variable. This is loaded using a call to a special API on the frontend server (see below) by a [ConfigService](angular-src/app\/config.service.ts) which is loaded during app initialization. Note. The static config file [environment.prod.ts](angular-src/environments/environment.prod.ts) controls what variables **ConfigService** fetches

### UI Screenshot
![screen](https://user-images.githubusercontent.com/14982936/32730539-4b85e806-c87f-11e7-89a5-a12543314a34.png)



<a name="front"></a>

# Component 2 - Frontend service
This is held in [service-frontend](service-frontend) and is an extremely simple Node.js Express app. It simply serves up the static content of the Angular app (e.g. index.html, JS files, CSS and images). Once the client browser has loaded the app, no further interaction with this service takes place. This service is stateless

The Node.js server serves the static content from its root directory (i.e. where `server.js` is), this content comes from the output of the Angular command `ng build --prod` which outputs to `./dist` so this output must be copied in. The Dockerfile ([frontend.Dockerfile](frontend.Dockerfile)) carries out both these tasks

The service listens on port 3000 and requires a single configuration variable to be set. This taken from the OS environmental variables. A `.env` file [can also be used](https://www.npmjs.com/package/dotenv) if present.

|Variable Name|Purpose|
|-------------|-------|
|API_ENDPOINT|The URL endpoint of the data service API, e.g. `https://myapi.azurewebsites.net/api`|

### Front end server - config API
The frontend server presents a special API located at `/.config` this API responds to GET requests and will return values of environmental variables from the server as JSON. This is a workaround to a well known configuration limitation of all client side JS apps (such as Angular, React and others)

The API takes a comma separated list of variable names, and returns them in a single JSON object e.g.
**GET `/.config/HOSTNAME,FOO`** will result in `{"HOSTNAME":"hostblah", "FOO":"Value of foo"}`

This config API is used by the Angular app's **ConfigService** to get the API endpoint from the API_ENDPOINT env var.

### Running frontend service/server locally
If you want to run the front-end service locally, it is advised to do this in a temporary runtime directory outside of this project, otherwise you will polute the source.  
Copy `package.json` and `server.js` into this runtime directory, then run `npm install` in this directory to grab all the packages. Then copy in all of the contents of `dist` as described above, and start with `npm start`



<a name="data-api"></a>

# Component 3 - Backend Data API Service
This is held in [service-data-api](service-data-api) and is another Node.js Express app. It acts as the REST API endpoint for the Angular client app. This service is stateless

The API routes are held in `api_events.js`, `api_feedback.js`, `api_other.js` and currently are set up as follows:
#### Events:
- `GET /api/events` - Return a list of all events
- `GET /api/events/filter/{active|future|past}` - Return list of events filtered to a given time frame
- `GET /api/event/{id}` - Return just one event, by id
- `POST /api/events` - Create a new event (*secured admin API call*)
- `PUT /api/events` - Update existing event (*secured admin API call*)
- `DELETE /api/events/{id}` - Delete event (*secured admin API call*)

#### Feedback:
- `GET /api/feedback/{eventid}/{topicid}` - Return all feedback for given event and topic
- `POST /api/feedback` - Submit feedback

#### Other. Admin & helper routes:
- `POST /api/dbinit` - Reinit the database, delete and recreate Cosmos db & collection, then load seed data. Seed data is held in `seed-data.json` and can be modified as required. See notes below on security for this API
- `GET /api/info` - Provide some information about the backend service, including hostname (good for debugging & checking loadbalancing)

### Swagger / OpenAPI
There is a [Swagger definition file for the API](service-data-api/swagger.json) and Swagger UI is also available, just use `/api-docs` as the URL, e.g.  **http://localhost:4000/api-docs/**

### DB Init Security (/api/dbinit)
This API method is special in that it requires a secret key/password to be supplied, and it must be called with a POST. The secret value must be supplied in a HTTP header called **X-SECRET**.  
The default secret is `secret123!` but can be set and changed with the environmental variable `DBINIT_SECRET` 

It is recommend to use a tool such a [Postman](https://www.getpostman.com/) to call this API, however CLI tools such as curl can also be used, e.g.
`curl -X POST "http://localhost:4000/api/dbinit" -H "accept: application/json" -H "X-SECRET: 123secret!"`

### Admin Calls Security
The event PUT, POST and DELETE calls are considered sensitive, and are only called by the admin section of the Smilr app. Optionally these calls can be locked down to prevent people hitting the API directly. For demos it is suggested that the APIs are left open for ease of showing the API and the working app, however for a permanent or live instance it should be restricted.

To switch on security for these three calls, set the `API_SECRET` environmental variable with a key you want to use, note the key can be any length but only contain the following characters: 
`ABCDEFGHIJKLMNOPQRSTUVWXYZ234567`.  
This key is used to generate Time-based One-time Passwords (TOTP), these passwords must be sent to the API in the HTTP request headers, in a header named **X-SECRET**. The password is validated against the key and is only valid for 30 seconds. Invalid passwords will result in a 401 response.

Once enabled the Angular client will need to know this key so it can generate the TOTP to send with any requests to the event PUT, POST and DELETE calls. This is done by setting it in **environment.prod.ts** in the `dataApiKey` field. 

Note. If `API_SECRET` is not set, any value sent in the X-SECRET header is not validated and is just ignored, the header can also be omitted.  
Also Note. The GET methods of the event API are always open and not subject to TOTP validation, likewise the feedback API is left open by design


### Data access
All data is held in Cosmos DB, the data access layer is a plain ES6 class **DataAccess** in [lib/data-access.js](service-data-api/lib/data-access.js). All Cosmos DB specific code and logic is encapsulated here

### Data API server - Config
The server listens on port 4000 and requires two configuration variables to be set. These are taken from the OS environmental variables. A `.env` file [can also be used](https://www.npmjs.com/package/dotenv) if present.

|Variable Name|Purpose|
|-------------|-------|
|COSMOS_ENDPOINT|The URL endpoint of the Cosmos DB account, e.g. `https://foobar.documents.azure.com/`|
|COSMOS_KEY|Master key for the Cosmos DB account|
|DBINIT_SECRET|*Optional* secret key used for DB init (default value `secret123!`)|
|API_SECRET|*Optional* secret key used for admin calls to the event API (setting this turns security on, see **Admin Calls Security** above for details)|

### Running Data API service locally
Run `npm install` in the **service-data-api** folder, ensure the environment variables are set as described above, then run `npm start`



<a name="db"></a>

# Component 4 - Database
All data is held in a single Cosmos DB database called **smilrDb** and also in single collection, this collection is called **alldata**

The collection is partitioned on a key called `doctype`, when events and feedback are stored the partition key is added as an additional property on all entities/docs, e.g. `doctype: 'event'` or `doctype: 'feedback'`. Note. the `doctype` property only exists in Cosmos DB, the Angular model has no need for it so it is ignored.  
Note. This may not be the best collection / partitioning scheme but it serves our purposes, and saves costs

### Database Initialization 
In order to create the database (**smilrDb**) and the collection (**alldata**) you will need to use the data service API, and call `/api/dbinit`, before you do this the app will not function and you will get errors. This call will also load demo/seed data. See notes above about how to call this API.

### Deploying Cosmos DB
Deployment of a new Cosmos DB account is simple, using the Azure CLI it is a single command. Note the account name must be unique so you will have to change it
```
az cosmosdb create --resource-group SmilrRG --name smilr-cosmos
```

### Data Model
There are two main models, one for holding an **Event** and one for submitted **Feedback**, there are also **Topics** which only exist as simple objects nested in Events.

```ts
Event {
  id:     any       // Six character UID string or int
  title:  string    // Title of the event, 50 char max
  type:   string    // Type of event ['event', 'workshop', 'hack', 'lab']
  start:  Date      // Start date, an ISO 8601 string; YYYY-MM-DD
  end:    Date      // End date, an ISO 8601 string; YYYY-MM-DD
  topics: Topic[];  // List of Topics, must be at least one
}
``` 
```ts
Topic {
  id:       number       // int (starting at 1)
  desc:     string       // Short description 
  feedback: Feedback[];  // Only populated when reporting
}
``` 
```ts
Feedback {
  id:       number  // Six character UID string or int
  event:    string  // Event id
  topic:    number  // Topic id
  rating:   number  // Feedback rating 1 to 5
  comment:  string  // Feedback comments
}
``` 


<a name="serverless"></a>

# Component 5 - Optional Serverless Components

There are two serverless components to Smilr, and both are optional

### Data Enrichment - Sentiment Analysis
This optional component enriches data as feedback is sumbitted. It takes any comment text in the feedback and runs it through Azure Text Analytics  Cognitive Services. The resulting sentiment score (normalized 0.0 ~ 1.0) is added to the feedback document in the database.

The is implemented in Azure Functions, using the Cosmos DB change trigger, so that when new items are added to the DB, the function runs and processes them. The Function has an output binding back to Cosmos DB to update the document. The Function is written in C#

Further notes are [included with the code here](azure-functions/sentimentFunction/)

### Data API Serverless Version
The data-api service has been re-implemented in a serverless model, this is also using Azure Functions. This component is optional as functionally it is identical to the "normal" non-serverless version of the service. It has been created as a small proof of concept around the idea of using serverless design in a RESTful microservices app, such as Smilr.

The complete API of data-api service has not been replicated, rather a minimum subset has been implemented, in order to get the front end functional and users can submit feedback. The admin part of the API and front end has been omitted.

Azure Functions and Azure Functions Proxies are used to reproduce the same REST API as the regular Node service. There are two Functions, the [eventsAPI](azure-functions/eventsAPI/) and [feedbackAPI](azure-functions/feedbackAPI/), both written in JavaScript and ported from the Node.js code with very little change. 

The exact same [data access library](service-data-api/lib/data-access.js) used by the Node service is used by the Functions version, meaning 100% code reuse without any change.

#### Deploying Serverless Data API
You can deploy the serverless data-api into any Functions App, simply copy the whole of the [azure-functions](azure-functions/) to the App Service, into `wwwroot`

![](https://user-images.githubusercontent.com/14982936/36417631-5e5c4cca-1624-11e8-9e22-65e7ff2e31bd.png)

The NPM packages used by the data-access library to connect to Cosmos DB will need to be installed. After copying all the files to your Function App (including package.json) go into the portal for your Function App, then into 'Platform Features' and 'Console', from there run `npm install`

The [proxies.json](azure-functions/proxies.json) file will need to be modified and the `backendUri` values changed to point to your instance of Functions by altering the "changeme" part. You can also change this using the Functions web Portal in the Proxies section

---

# Deploying Smilr Locally

If you are deploying Smilr for the first time, and still getting your head around the various moving pieces, you may want to deploy it initially locally on your desktop machine and set up each of the tiers and make sure they are working correctly, and debug locally if you hit issues.

### Run the CosmosDB emulator 

There is a CosmosDB local emulator available for Windows - see  https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator for details of how to set it up. Use the Data Explorer to ensure the emulator is up and running.

### Run the Backend Data API Service

The CosmosDB emulator listens on https://localhost:8081 and uses a predefined security key "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==" that you will need to assign to COSMOS_ENDPOINT and COSMOS_KEY before running the data service API.

In the browser go to http://localhost:4000/api/dbinit and you should, if all is well, see a message saying the database is being initialised.

### Run the Front End Service

Remember that you need to build a production version of the service, otherwise the Angular app defaults to the in-memory version and the back end version won't be called.
Don't forget to set API_ENDPOINT to the URL endpoint of the data service API, http://localhost:4000/api.
Check that the system works end to end by browsing to http://localhost:3000 and view the events and create new ones, etc. 



# Deploying Smilr to Azure

There a are many ways to host and deploy Smilr in Azure, the primary ones being:


## Docker & Kubernetes (AKS)
[See the this section for full notes and guides on building the Docker images & running in Kubernetes via AKS](/etc/docker)

## Azure Container Instance
[See ARM templates for deploying ACI + Cosmos](etc/azure-templates/) and also [building Docker images](etc/docker/docker.md)

## Azure App Service
See [PowerShell script](etc/deploy-appsvc/) to build the front end service and deploy to Azure App Service. The backend service can also be deployed as a regular Node app to App Service.

---

# Appendix - Running A Secured Instance
The application is designed to be deployed in a demo scenario, so access to the admin pages where you can create/edit events and view feedback is open to all, without login. 

However should you want to run the app permanently in non-demo instance for real use, there is an option to secure it. In `environment.prod.ts` change the `secured` setting to `true`. The Angular app will now hide the admin and report sections behind a login prompt. Authentication is expected to be handled by Azure App Service authentication and AAD.

**Important Note!** For this `secured` mode to work the Angular app must be deployed with the supplied frontend server ([/service-frontend](/service-frontend)) and that ***must be deployed to a Windows App Service***. On that App Service, Authentication must be enabled but ***anonymous access should be allowed***, and AAD should be set up as an auth provider. No other configuration will work.

As follows:
![app-svc-auth](https://user-images.githubusercontent.com/14982936/32653292-4a065c4a-c5ff-11e7-8d48-a3d2df805b4a.png)
