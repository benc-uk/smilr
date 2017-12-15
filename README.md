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
- `GET /api/events` - Return all events
- `GET /api/events?time={active|future|past}` - Return events in given time frame
- `GET /api/event/{id}` - Return just one topic, by id
- `POST /api/events` - Create a new event
- `PUT /api/events` - Update existing event
- `DELETE /api/events/{id}` - Delete event

#### Feedback:
- `GET /api/feedback/{eventid}/{topicid}` - Return all feedback for given event and topic
- `POST /api/feedback` - Submit feedback

#### Other. Admin & helper routes:
- `GET /api/dbinit` - Reinit the database, delete and recreate Cosmos db & collection, then load seed data. Seed data is held in `seed-data.json` and can be modified as required.
- `GET /api/info` - Provide some information about the backend service, including hostname (good for debuging & checking loadbalancing)

### Data access
All data is held in Cosmos DB, the data access layer is a plain ES6 class **DataAccess** in `data-access.js`. All Cosmos DB specific code and logic is encapsulated here

### Data API server - Config
The server listens on port 4000 and requires two configuration variables to be set. These are taken from the OS environmental variables. A `.env` file [can also be used](https://www.npmjs.com/package/dotenv) if present.

|Variable Name|Purpose|
|-------------|-------|
|COSMOS_ENDPOINT|The URL endpoint of the Cosmos DB account, e.g. `https://foobar.documents.azure.com/`|
|COSMOS_KEY|Master key for the Cosmos DB account|

### Running Data API service locally
Run `npm install` in the **service-data-api** folder, ensure the environment variables are set as described above, then run `npm start`



<a name="db"></a>

# Component 4 - Database
All data is held in a single Cosmos DB database called **microserviceDb** and also in single collection, this collection is called **alldata**

The collection is partitioned on a key called `doctype`, when events and feedback are stored the partition key is added as an additional property on all entities/docs, e.g. `doctype: 'event'` or `doctype: 'feedback'`. Note. the `doctype` property only exists in Cosmos DB, the Angular model has no need for it so it is ignored.  
Note. This may not be the best collection / partitioning scheme but it serves our purposes, and saves costs

### Database Initialization 
In order to create the database (**microserviceDb**) and the collection (**alldata**) you will need to use the data service API, and call `/api/dbinit`, before you do this the app will not function and you will get errors. This call will also load demo/seed data 

### Deploying Cosmos DB
Deployment of a new Cosmos DB account is simple, using the Azure CLI it is a single command. Note the account name must be unique so you will have to change it
```
az cosmosdb create -g SmilrRG -n smilr-cosmos
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


# Deploying Smilr locally

If you are deploying Smilr for the first time, and still getting your head around the various moving pieces, you may want to deploy it initially locally on your desktop machine and set up each of the tiers and make sure they are working correctly, and debug locally if you hit issues.

### Run the CosmosDB emulator 

There is a CosmosDB local emulator available for Windows - see  https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator for details of how to set it up. Use the Data Explorer to ensure the emulator is up and running.

### Run the Backend Data API Service

TheCosmosDB emulator listens on https://localhost:8081 and uses a predefined security key "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==" that you will need to assign to COSMOS_ENDPOINT and COSMOS_KEY before running the data service API.

In the browser go to http://localhost:4000/api/dbinit and you should, if all is well, see a message saying the database is being initialised.

### Run the Front End Service

Rememeber that you need to build a production version of the service, otherwise the Angular app defaults to the in-memory version and the back end version won't be called.
Don't forget to set API_ENDPOINT to the URL endpoint of the data service API, http://localhost:4000/api.
Check that the system works end to end by browsing to http://localhost:3000 and view the events and create new ones, etc. 

# Deploying Smilr to Azure

TODO


# Component 5 - Optional Serverless Components
TODO

----------------------------------------------------------------------------------------------------

# Docker & Kubernetes 
[See the this section for full notes and guides on building the Docker images & running in Kubernetes](/etc/docker)


# Azure Templates
[Azure Resource Manager deployment templates are provided here](/etc/azure-templates)


# Appendix - Running A Secured Instance
The application is designed to be deployed in a demo scenario, so access to the admin pages where you can create/edit events and view feedback is open to all, without login. 

However should you want to run the app permanently in non-demo instance for real use, there is an option to secure it. In `environment.prod.ts` change the `secured` setting to `true`. The Angular app will now hide the admin and report sections behind a login prompt. Authentication is expected to be handled by Azure App Service authentication and AAD.

**Important Note!** For this `secured` mode to work the Angular app must be deployed with the supplied frontend server ([/service-frontend](/service-frontend)) and that ***must be deployed to a Windows App Service***. On that App Service, Authentication must be enabled but ***anonymous access should be allowed***, and AAD should be set up as an auth provider. No other configuration will work.

As follows:
![app-svc-auth](https://user-images.githubusercontent.com/14982936/32653292-4a065c4a-c5ff-11e7-8d48-a3d2df805b4a.png)
