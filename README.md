# Microservices Demo App

This is a simple app designed to showcase multiple microservices patterns & deployment architectures. It consists of a SPA written in Angular 4, and currently a single backend service, which provides all data to the client app via REST.  
Currently the backend data store is Cosmos DB

The backend services are written in Node.js Express. They can be deployed directly to Azure Web or API apps (as Node.js is supported), however as the purpose of the app is to demonstrate microservices rather than PaaS, this deployment path is a side effect of the technology rather than a desired outcome.

The two services have been containerized so can be run in a number of container hosting options. Simple deployment can be done in Azure Linux Web Apps, or Azure Container Instances.  
Deployment to Azure Container Service (in AKS managed Kubernetes) has also been tested.

### Simplified Architecture
![arch](https://user-images.githubusercontent.com/14982936/32603569-18f43734-c542-11e7-80c3-afb616714d24.png)


# Angular Front End
This project was generated with the [Angular CLI](https://github.com/angular/angular-cli) and uses Angular 5.0

### Development Server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
When running in non production (or dev) mode, InMemoryDbService is used to provide a mock HTTP API and datastore, this will intercept all HTTP calls made by the app and act as both the API and DB.

### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

### API endpoint configuration
***IMPORTANT!*** The API endpoint for the backend data service must be set, there are two ways this is done, depending on if you are running in non production (e.g. from `ng serve`) or in production mode:
- Non production: The API endpoint is set in [environment.ts](angular-src/environments/environment.ts), see comments in there. However in non-prod mode the value of this setting is ignored as the InMemoryDbService intercepts all calls
- Production mode: The API endpoint is fetched from the frontend server where it is set as an environmental variable. This is loaded using a call to a special API on the frontend server (see below) by a [ConfigService](angular-src/app\/config.service.ts) which is loaded during app initialization. Note [environment.prod.ts](angular-src/environments/environment.prod.ts) controls what variables **ConfigService** fetches

### Screenshot
![screen](https://user-images.githubusercontent.com/14982936/32010139-e7542fda-b9a8-11e7-874f-545133f45c83.png)

# Data Model
Two main models exist, one for events and one for submitted feedback, Topics exist as simple objects nested in Events.

```ts
Event {
  id: any           // Six character UID string or int
  title: string     // Title of the event, 50 char max
  type: string      // Type of event ['event', 'workshop', 'hack', 'lab']
  start: Date       // Start date
  end: Date         // End date
  topics: Topic[];  // List of Topics, must be at least one
}
``` 
```ts
Topic {
  id: number              // int
  desc: string            // Short description 
  feedback: Feedback[];   // Only populated when reporting
}
``` 
```ts
Feedback {
  id: number        // Six character UID string or int
  event: string     // Event id
  topic: number     // Topic id
  rating: number    // Feedback rating 1 to 5
  comment: string   // Feedback comments
  metadata: string  // Extra metadata from enrichment, e.g. sentiment
}
``` 
## Data Model in Cosmos DB
All data is held in a single Cosmos DB database called `microserviceDb` and also in single collection to save costs! This collection is called `alldata` :)  

The collection is partitioned on a key called `doctype`, when events and feedback are stored the partition key is added as an additional property on all entities/docs, e.g. `doctype: 'event'` or `doctype: 'feedback'`. The `doctype` property only exists in Cosmos DB, the Angular model has no need for it so it is ignored.  
Note. This may not be the best partitioning scheme but it serves our purposes.

# Services 

## Front end server 
This is held in [service-frontend](service-frontend) and is an extremely simple Node.js Express app. It simply serves up the static content of the Angular app (e.g. index.html, JS files, CSS and images). Once the client browser has loaded the app, no further interaction with this service takes place. This service is stateless

The Node.js server serves the static content from its root directory, this content comes from the output of `ng build --prod` which outputs to `./dist` so this output must be copied in. The Dockerfile ([Dockerfile.frontend](Dockerfile.frontend)) carries out both these tasks

The service listens on port 3000 and requires a single configuration variable to be set. This taken from the OS environmental variables. A `.env` file [can also be used](https://www.npmjs.com/package/dotenv) if present.
|Variable Name|Purpose|
|-------------|-------|
|API_ENDPOINT|The URL endpoint of the data service API, e.g. `https://myapi.azurewebsites.net/api`|

### Front end server - config API
The frontend server presents a special API located at `/.config` this API responds to GET requests and will return values of environmental variables from the server as JSON. This is a workaround to a well known configuration limitation of all client side JS apps (such as Angular, React and others)

The API takes a comma separated list of variable names, and returns them in a single JSON object e.g.
**GET `/.config/HOSTNAME,FOO`** will result in `{"HOSTNAME":"hostblah", "FOO":"Value of foo"}`

This config API is used by the Angular app's **ConfigService** to get the API endpoint from the API_ENDPOINT env var.


## Data API server 
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
- `GET /api/info` - Provide some information about the backend service, including hostname (good for debuging loadbalanced containers)

### Data access
All data is held in Cosmos DB, the data access layer is a plain ES6 class **DataAccess* in `data-access.js`. Any Cosmos DB specific code and logic is encapsulated here

### Data API server - Config
The server listens on port 4000 and requires two configuration variables to be set. These are taken from the OS environmental variables. A `.env` file [can also be used](https://www.npmjs.com/package/dotenv) if present.
|Variable Name|Purpose|
|-------------|-------|
|COSMOS_ENDPOINT|The URL endpoint of the Cosmos DB account, e.g. `https://foobar.documents.azure.com/`|
|COSMOS_KEY|Master key for the Cosmos DB account|


# Kubernetes 
Deployment YAML files for the front and backend services are held in the [docker](/docker) directory. Before deployment build the docker images and push to Azure Container Registry, the ACR name in the YAML will require modification. 

More information on running the app in Kubernetes is contained in [kubernetes.md](docker/kubernetes.md)


# Running A Secured Instance
The application is designed to be deployed in a demo scenario, so access to the admin pages where you can create/edit events and view feedback is open to all, without login. 

However should you want to run the app permanently in non-demo instance for real use, there is an option to secure it. In `environment.prod.ts` change the `secured` setting to `true`. The Angular app will now hide the admin and report sections behind a login prompt. Authentication is expected to be handled by Azure App Service authentication and AAD.

**Important Note!** For this `secured` mode to work the Angular app must be deployed with the supplied frontend server ([/service-frontend](/service-frontend)) and that ***must be deployed to a Windows App Service***. On that App Service, Authentication must be enabled but ***anonymous access should be allowed***, and AAD should be set up as an auth provider. No other configuration will work.

As follows:
![app-svc-auth](https://user-images.githubusercontent.com/14982936/32653292-4a065c4a-c5ff-11e7-8d48-a3d2df805b4a.png)