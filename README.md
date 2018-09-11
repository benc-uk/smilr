# Microservices Demo App

This is a multi component application designed to showcase microservices design patterns & deployment architectures. It consists of a front end single page application (SPA), two lightweight services, supporting database and back end data enrichment functions.

The application is called *'Smilr'* and allows people to provide feedback on events or sessions they have attended via a simple web & mobile interface. The feedback consists of a rating (scored 1-5) and supporting comments.

- The user interface is written in Angular (Angular 6) and is completely de-coupled from the back end, which it communicates with via REST. The UI is fully responsive and will work on on both web and mobile.

- The two microservices are both written in Node.js using the Express framework. These have been containerized so can easily be deployed & run as containers

- The database is a NoSQL document store holding JSON, provided by MongoDB and/or *Azure Cosmos DB*

The app has been designed to be deployed to Azure, but the flexible nature of the design & chosen technology stack results in a wide range of deployment options and compute scenarios, including:
- Containers: *Azure Container Service (ACS or AKS)* or *Azure Container Instances* 
- Platform services: Regular Windows *Azure App Service (Web Apps)* or Linux *Web App for Containers*
- Serverless: *Azure Functions*
- Virtual Machines: Sub-optimal but theoretically possible

This application supports a range of demonstration, and learning scenarios, such as:
 - A working example of microservices design
 - Use of containers, Docker & Kubernetes
 - No-SQL and document stores over traditional relational databases
 - CQRS (Command & Query Responsibility Segregation) as a possible pattern to separate read and write actions and stores 
 - Development and deployment challenges of single page applications 
 - Platform services for application hosting
 - Using serverless technology to support or provide services
 - Use of an open source application stack such as Angular and Node.js
 - RESTful API design 
 - The Actor model as an alternative to a traditional data model

---


# :star: Architecture & Core App Components
![arch](/etc/architecture.png){: .framed .padded}


# :file_folder: Repository Structure
The main levels of the repository directory tree are laid out as follows 
```
/
├── angular            The main frontend Angular app
│   └── src               Angular source code
├── azure              Supporting files for Azure deployment etc
│   ├── appservice        Script to deploy frontend to Azure App Service
│   ├── functions         Azure Functions implementation of the data-api service
│   └── templates         Example ARM templates
├── docs               Documentation
├── dotnet             .NET Core ASP implementation of the services - WIP
├── etc                Supporting files, pictures and other artefacts 
├── kubernetes         Docs and files to support deployment to Kubernetes & AKS
│   ├── helm              Helm chart for deploying Smilr with Helm
│   ├── using-ingress     Deployment YAML for use with K8S Ingress
│   └── using-lb          Deployment YAML for use with K8S LoadBalancer
├── node               Main microservices, written in Node.js
│   ├── data-api          Data API service source code
│   └── frontend          Frontend service source code
├── orleans            Orleans actor model implementation of the services  - WIP
├── scripts            Supporting helper scripts
│   ├── genOTP            Generate one time passwords for API testing
│   └── demoData          Load the database with demo data
└── servicefabric      Service Fabric implementation of the services - WIP
```

# :computer: Dev Tools & Pre-Reqs
If you are looking to build & work with the Smilr app locally, either as a learning exercise or to run demos, there are a small number of pre-reqs:

- [Node.js](https://nodejs.org/en/download/) installed, if using Windows then [installing Node under WSL is also an option](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
- [Docker CE](https://store.docker.com/search?offering=community&type=edition). Required if building the Docker images to run locally, or in Azure or Kubernetes. Note. A remote Docker host can be set-up & used (e.g. via Docker Machine) rather that installing Docker locally. The process of setting this up are outside the scope of this readme
- [VS Code](https://code.visualstudio.com/) This project has been developed almost entirely using VS Code. The one area where Visual Studio was used was for some of the C# work, for its templates and the new Docker container support. However you can use any editor/IDE you wish, but VS Code is highly recommended. Various task & debug configurations for VS Code are provided.


# :wrench: Runtime Configuration & Settings
The primary configuration mechanism for this project is system environmental variables (or env vars). These env vars are used with the Node.js services, container runtime, Docker tools and helper scripts. This gives a flexible and cross platform way to inject runtime settings, it is also widely supported in Azure (e.g. Azure App Service Settings) and Docker/Kubernetes.

There are numerous ways to set & override environmental variables; in the operating system, the user profile or from command line tools. For local development purposes it is strongly recommended you create & use `.env` files. These are simple text files containing `var=value` pairs. Sample files named `.env.sample` are provided within the project, which you can rename and use. *Note.* `.env` files normally contain secrets so they are prevented from being committed to Git

The main app components are:
1. [Angular front end UI](#component-1---angular-front-end-ui)
2. [Frontend service](#component-2---frontend-service)
3. [Backend data API service](#component-3---backend-data-api-service)
4. [Database](#component-4---database)
5. [Optional serverless components](#component-5---optional-serverless-components) 

These will be each described in their own sections below. 


# :hourglass_flowing_sand: Build & Release Pipeline

Automated CI/CD Pipeline has been created using Azure Pipelines. This automatically builds the various components as containers and releases them to Azure for testing. To view the status of these builds & releases, you can visit the Azure Devops Public Project


Data API Automated Build: [![Build Status](https://dev.azure.com/bencoleman/Smilr/_apis/build/status/Build%20Image%20-%20Data%20API)](https://dev.azure.com/bencoleman/Smilr/_build/latest?definitionId=3)

Frontend Automated Build: [![Build Status](https://dev.azure.com/bencoleman/Smilr/_apis/build/status/Build%20Image%20-%20Frontend)](https://dev.azure.com/bencoleman/Smilr/_build/latest?definitionId=2)

### [DevOps Public Project - Smilr](https://dev.azure.com/bencoleman)

---

# Component 1 - Angular Front End UI 
This app was generated with the [Angular CLI](https://github.com/angular/angular-cli) and uses Angular 5.0. To build and run you will need Node.js installed (6.11 and 8.9 have been tested) and also NPM. To install the Angular CLI run `npm install @angular/cli -g`, v1.7.0 or higher will be needed. 

## Development Server
First install packages from NPM by running `npm install`. Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
When running in non production (or dev) mode, **InMemoryDbService** is used to provide a mock HTTP API and datastore, this will intercept all HTTP calls made by the app and act as both the API and DB.

## Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. You should use the `--prod` flag for a production build.

## API Endpoint Configuration
The API endpoint for the data service must be set, there are two ways this is done, depending on if you are running in non production (e.g. locally with `ng serve`) or in production mode:

- **Non production:** The API endpoint is set in [environment.ts](angular/src/environments/environment.ts), see comments in there for details. ***However in non-prod mode the value of this setting is always ignored*** as the InMemoryDbService will intercept all calls
- **Production mode:** The API endpoint is fetched dynamically at runtime, from the frontend server where it is set as an environmental variable. This is loaded using a call to a special API on the frontend server (see below) by a [ConfigService](angular/src/app/config.service.ts) which is loaded during app initialization. Note. The static config file [environment.prod.ts](angular/src/environments/environment.prod.ts) controls what variables **ConfigService** fetches

## UI Screenshot
![screen](https://user-images.githubusercontent.com/14982936/41047514-9f8bf4ba-69a4-11e8-98a3-45957ab17fb0.png){: .framed .padded}

---

# Component 2 - Frontend service
This is held in [node/frontend](node/frontend) and is an extremely simple Node.js Express app. It simply serves up the static content of the Angular app (e.g. index.html, JS files, CSS and images). Once the client browser has loaded the app, no further interaction with this service takes place. This service is stateless

By default the Express server serves the static content using `express.static()` from its root directory (i.e. where `server.js` is), this content should be the output of the Angular build & bundle process `ng build --prod` which outputs to `angular/dist` directory.  
So to package a working frontend service these files must be copied (recursively) across. Note. Do not copy the `dist` directory, only the *contents under it*. You must overwrite the **index.html** file which is just a placeholder.  
The [Dockerfile](node/frontend/Dockerfile) carries out both the Angular build and the copy step so will always create a fully packaged frontend

When running locally you can skip this copy step (see below)

The service listens on port 3000 and requires a single environmental configuration variable to be set.

|Variable Name|Purpose|
|-------------|-------|
|API_ENDPOINT|The URL endpoint of the data service API, e.g. `https://myapi.azurewebsites.net/api`|

## Front end server - config API
The frontend server presents a special API located at `/.config` this API responds to GET requests and will return values of any environmental variable on the server as JSON. This is a workaround to a well known configuration limitation of all client side JS apps (such as Angular, React and others)

The API takes a comma separated list of variable names, and returns them in a single JSON object e.g.
**GET `/.config/HOSTNAME,FOO`** will result in `{"HOSTNAME":"hostblah", "FOO":"Value of foo"}`

This config API is used only once and at startup by the Angular app's **ConfigService** to get the API endpoint from the API_ENDPOINT environment var. The ConfigService is injected in using Angular's APP_INITIALIZER token which suffers from non-existent documentation, however [this blog post](https://www.intertech.com/Blog/angular-4-tutorial-run-code-during-app-initialization/) is a good source of information. This approach allows dynamic configuration of the endpoint address without needing to re-build the Angular app

## Running frontend service/server locally
If you want to run the front-end service locally, you can point the server at a directory containing the static content you want to serve, i.e. the bundled output of `ng build --prod`. To do this pass the directory as a parameter to the `server.js` e.g.
```
node server.js C:\Dev\smilr\angular\dist
```
This saves you copying the Angular dist content to same folder as the Node **server.js** file. The path must be fully qualified and not relative.

---

# Component 3 - Backend Data API Service
This is held in [node/data-api](node/data-api) and is another Node.js Express app. It acts as the REST API endpoint for the Angular client app. This service is stateless

The API routes are held in `api_events.js`, `api_feedback.js`, `api_other.js` and currently are set up as follows:

**Events:**  
- `GET /api/events` - Return a list of all events
- `GET /api/events/filter/{active|future|past}` - Return list of events filtered to a given time frame
- `GET /api/event/{id}` - Return just one event, by id
- `POST /api/events` - Create a new event (*secured admin API call*)
- `PUT /api/events` - Update existing event (*secured admin API call*)
- `DELETE /api/events/{id}` - Delete event (*secured admin API call*)

**Feedback:**  
- `GET /api/feedback/{eventid}/{topicid}` - Return all feedback for given event and topic
- `POST /api/feedback` - Submit feedback

**Other routes:**  
- `GET /api/info` - Provide some information about the backend service, including hostname (good for debugging & checking loadbalancing)

## Swagger / OpenAPI
There is a [Swagger definition file for the API](node/data-api/swagger.json) and Swagger UI is also available, just use `/api-docs` as the URL, e.g.  **http://localhost:4000/api-docs/**

## Security
The event PUT, POST and DELETE calls are considered sensitive, and are only called by the admin section of the Smilr app. Optionally these calls can be locked down to prevent people hitting the API directly. For demos it is suggested that the APIs are left open for ease of showing the API and the working app, however for a permanent or live instance it should be restricted.

To switch on security for these three calls, set the `API_SECRET` environmental variable with a key you want to use, note the key can be any length but only contain the following characters: 
`ABCDEFGHIJKLMNOPQRSTUVWXYZ234567`.  
This key is used to generate Time-based One-time Passwords (TOTP), these passwords must be sent to the API in the HTTP request headers, in a header named **X-SECRET**. The password is validated against the key and is only valid for 30 seconds. Invalid passwords will result in a 401 response.

Once enabled the Angular client will need to know this key so it can generate the TOTP to send with any requests to the event PUT, POST and DELETE calls. This is done by setting it in **environment.prod.ts** in the `dataApiKey` field. 

> :exclamation::speech_balloon: **Note.** If `API_SECRET` is not set (which is the default), any value sent in the X-SECRET header is not validated and is simply ignored, the header can also be omitted. Also the GET methods of the event API are always open and not subject to TOTP validation, likewise the feedback API is left open by design

## Data access
All data is held in MongoDB, the data access layer is a plain ES6 class **DataAccess** in [lib/data-access.js](node/data-api/lib/data-access.js). This is a singleton which encapsulates all MongoDB specific code and logic (e.g. connecting and creating the database, collections etc) and also operations on the event and feedback entities. See [Database component](#component-4---database) below for more details.

## Data API server - Config
The server listens on port 4000 and requires just one configuration environmental variable to be set. 

|Variable Name|Purpose|
|-------------|-------|
|MONGO_CONNSTR|A valid [MongoDB connection string](https://docs.mongodb.com/v3.4/reference/connection-string/), e.g. `mongodb://localhost`. When using Azure Cosmos DB, obtain the full Mongo connection string from the Cosmos instance in the portal, which will include the username & password.
|API_SECRET|***Optional*** secret key used for admin calls to the event API (setting this turns security on, see [Admin Calls Security](#admin-calls-security) above for details)|

## Running Data API service locally
Run `npm install` in the **data-api** folder, ensure the environment variables are set as described above, then run `npm start`

---

# Component 4 - Database
All data is held in a single MongoDB database called **smilrDb** across two collections `events` and `feedback`.
If they don't exist, the database and collections will be created by the data API on first access, so there is no need to initialize the database.  
The app has been developed and tested again MongoDB versions 3.6 and 3.4, however only very standard Mongo API functionality is used, so it is expected that other 3.x versions will be compatible.

The choice of MongoDB allows us to explore several deployment architectures, the main two being 
- Running MongoDB as a containerised microservice
- Using cloud platform service, namely *Azure Cosmos DB*

Switching between the two options is simply a matter of changing the MongoDB connection string used by the data API, this can be done to highlight or demonstrate the compatibility of Cosmos DB

## MongoDB as a containerised microservice
If you don't want to use platform services or have any external dependencies, then running MongoDB in a container along side our two other microservices is an option. This represents a more "pure microservices" scenario 

The provided [Docker Compose](docs/containers.md) and [Kubernetes](kubernetes/) configurations and documentation are already set up for this scenario.

## Deploying with Cosmos DB
As *Azure Cosmos DB* fully supports the MonogDB API, you can use Cosmos DB to deploy Smilr. This provides a number of benefits, such as near global scale, geo-replication and a range of consistency models.
Deployment of a new Cosmos DB account is simple, using the Azure CLI it is a single command. Note the account name must be globally unique so you will have to change it
```
az cosmosdb create --resource-group {res_group} --name changeme --kind MongoDB
```

You can then obtain the MongoDB connection string using the Azure portal or the following command:
```
az cosmosdb list-connection-strings --resource-group {res_group} --name changeme 
```

## Loading Demo Data
The database requires no initialization, however a helper script is provided to populate the system with demo data:
#### [:page_with_curl: Helper Script: demoData](scripts/demoData)

## Data Model
There are two main models, one for holding an **Event** and one for submitted **Feedback**, there are also **Topics** which only exist as simple objects nested inside **Events**. **Topics** as entities only exist logically client side, from the perspective of the API and database, there are only **Events** & **Feedback**, this means events are always stored & retrieved with a simple serialized JSON array of topics within them

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
  feedback: Feedback[];  // VIRTUAL PROPERTY - Only hydrated client side when reporting
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

---

# Component 5 - Optional Serverless Components

There are two serverless components to Smilr, and both are optional

## Data Enrichment - Sentiment Analysis
This optional component enriches data as feedback is submitted. It takes any comment text in the feedback and runs it through Azure Text Analytics Cognitive Services. The resulting sentiment score (normalized 0.0 ~ 1.0) is added to the feedback document in the database.

The is implemented in Azure Functions, using the Cosmos DB change trigger, so that when new items are added to the DB, the function runs and processes them. The Function then writes the document back to Cosmos DB via the Node.js MonogDB driver to update the document. The update was done this way as you can not use the Functions output bindings for Cosmos with MongoDB. The Function is written in Node.js

Further notes are [included with the code here](azure/functions/sentimentScore)

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

---

# Deploying Locally
If you are deploying Smilr for the first time, and still getting your head around the various moving pieces, you may want to deploy it initially locally on your desktop machine and set up each of the tiers and make sure they are working correctly, and debug locally if you hit issues.  
It is assumed you are using Windows 10, however as all of the steps can be applied to MacOS or Linux, using Windows 10 is not a hard requirement.

## Run MongoDB Locally
You have three options when it comes to running MongoDB locally:

### Use Windows Subsystem For Linux (WSL) - Ubuntu
Using Windows Subsystem For Linux (WSL) is probably the easiest way to run MongoDB on a Windows 10 machine. If you haven't already enabled WSL and installed a Linux distribution, [then do so](https://docs.microsoft.com/en-us/windows/wsl/install-win10). I strongly recommend picking Ubuntu as the distribution to run.

Open an Ubuntu bash terminal and install MonogDB with the following:
```
sudo apt update
sudo apt install -y mongodb
sudo mkdir /data/db
```

Then start the server with:
```
sudo mongod
```
MonogDB server will start and be listening on all IPs by default, there is no authentication or SSL so you can simply connect with `mongodb://localhost` as the connection string

### Run as Docker Container
If you have [Docker CE for Windows 10 installed](https://docs.docker.com/docker-for-windows/install/), you can very easily run MongoDB in a container on you local machine. Just run:
```
docker run -it --rm -p 27017:27017 mongo 
```

It my be better to run it detached and with a name so you can link it to other containers
```
docker run -d --rm -p 27017:27017 --name localmongo mongo 
```

If you are running the data API directly on your machine using Node (e.g. running `node server.js` or `npm start`), then you can connect to the MongoDB container simply using `mongodb://localhost` as the connection string. 
 
> :exclamation::speech_balloon: **Note.**  If you are running the data API ***also in local container***, you must link the two containers together using either a network or `--link`. When doing so the connection string will need to point to the name of the linked mongo container **not localhost** e.g. `mongodb://localmongo` in the example above.


### Install MongoDB for Windows
[Install MongoDB Community Edition on Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/). This has not been tested but should work. 


## Run the Backend Data API Service
The connection string for MongoDB on the local machine is `mongodb://localhost` this will need to be passed to the data api as the `MONGO_CONNSTR` env var. 

Optional - Load the database using the **demoData** helper script - [full documentation](scripts/demoData)

## Run the Front End Service
Remember that you need to build a production version of the service, otherwise the Angular app defaults to the in-memory version and the back end version won't be called.
Don't forget to set API_ENDPOINT to the URL endpoint of the data service API, http://localhost:4000/api.
Check that the system works end to end by browsing to http://localhost:3000 and view the events and create new ones, etc. 

---

# Deployment in Azure
## Deploying as Containers
Containers provide a perfect environment for running microservices, as such documentation and supporting files are provided to run Smilr in both Linux and Windows containers

#### [:page_with_curl: Guide on Containers & Docker](docs/containers.md)

## Kubernetes (AKS)
#### [:page_with_curl: Guide for running in Kubernetes](kubernetes/readme.md)

## Azure Container Instance
#### [:page_with_curl: ARM Templates](/azure/templates/readme.md)

## Azure App Service
Provided [PowerShell script](/azure/appservice/) will build the front end service and deploy to Azure App Service. 

The backend service can also be deployed as a regular Node app to App Service, just deploy the **node/data-api** folder using [Kudu zipdeploy](https://github.com/projectkudu/kudu/wiki/Deploying-from-a-zip-file) or other means (FTP, Git etc). If using zipdeploy you can omit the **node_modules** directory as the `.deployment` file instructs Kudu to run npm install after deployment.

:exclamation::speech_balloon: **Note.**  
Remember to set the required configuration environmental vars on the deployed web apps, this can be done with regular [App Service App Settings](https://docs.microsoft.com/en-us/azure/app-service/web-sites-configure#app-settings)

## Service Fabric
Coming soon

## Orleans 2.0 in Containers
Coming soon

---

# Appendix - Running A Secured Instance
The application is designed to be deployed in a demo scenario, so access to the admin pages where you can create/edit events and view feedback is open to all, without login. 

However should you want to run the app permanently in non-demo instance for real use, there is an option to secure it. In `environment.prod.ts` change the `secured` setting to `true`. The Angular app will now hide the admin and report sections behind a login prompt. Authentication is expected to be handled by Azure App Service authentication and AAD.

**Important Note!** For this `secured` mode to work the Angular app must be deployed with the supplied frontend server ([node/frontend](/node/frontend)) and that ***must be deployed to a Windows App Service***. On that App Service, Authentication must be enabled but ***anonymous access should be allowed***, and AAD should be set up as an auth provider. No other configuration will work.

E.g.  
![app-svc-auth](https://user-images.githubusercontent.com/14982936/32653292-4a065c4a-c5ff-11e7-8d48-a3d2df805b4a.png)
