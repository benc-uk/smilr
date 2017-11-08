# Microservices Demo App

This is a simple app designed to showcase multiple microservices patterns & deployment architectures. It consists of a SPA written in Angular 4, and currently a single backend service, which provides all data to the client app via REST.  
Currently the backend data store is Azure Tables, however this may be moved to Cosmos DB / MongoDB later.

The backend services are written in Node.js Express. They can be deployed directly to Azure Web or API apps (as Node.js is supported), however as the purpose of the app is to demonstrate microservices rather than PaaS, this deployment path is a side effect of the technology rather than a desired outcome.

The two services have been containerized so can be run in a number of container hosting options. Simple deployment can be done in Azure Linux Web Apps, or Azure Container Instances.  
Deployment to Azure Container Service (in AKS managed Kubernetes) has also been tested.

### Simplified architecture
![arch](https://user-images.githubusercontent.com/14982936/32010128-dca5d85e-b9a8-11e7-9802-e0147342093e.png)


# Angular 4 Front End
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.9

### Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
When running in non production mode, InMemoryDbService is used to provide a mock HTTP API and datastore, this will intercept all HTTP calls made by the app and act as both the API and DB.

### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

### API endpoint configuration
***IMPORTANT!*** The API endpoint for the backend data service must be set at build time. 

This due to the nature of Angular apps (they run entirely on the client in the browser) and the Angular CLI used to package, bundle and build the app, makes it almost impossible to override this value at runtime. There are complex workarounds which cause additional problems and configuration pain

The endpoint is held in the Angular CLI `environment` files in the [src/environments](src/environments) directory, in [`environment.prod.ts`](src/environments/environment.prod.ts), setting name is `api_endpoint`. Note the API endpoint for development mode is always ignored, due to the dev mode mock API intercepting all calls

### Screenshot
![screen](https://user-images.githubusercontent.com/14982936/32010139-e7542fda-b9a8-11e7-874f-545133f45c83.png)

# Data Model
Just two models currently exist, one for topics and one for submitted feedback

```ts
Event {
  id: any           // six character UID string or int
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
  id: number        // UUID
  event: string     // event id
  topic: number     // topic id
  rating: number    // Feedback rating 1 to 5
  comment: string   // Feedback comments
  metadata: string  // Extra metadata from enrichment, e.g. sentiment
}
``` 

# Services 

### Front end server 
This is held in [service-frontend](service-frontend) and is an extremely simple Node.js Express app. It simply serves up the static content of the Angular app (e.g. index.html, JS files, CSS and images). Once the client browser has loaded the app, no further interaction with this service takes place.  

The Node.js server serves the static content from it's root directory, this content come from the output of `ng build --prod` which outputs to `./dist` so must be copied in. The Dockerfile ([Dockerfile.frontend](Dockerfile.frontend)) carries out this copy step

The service listens on port 3000 and requires no config

### Data API server 
This is held in [service-data-api](service-data-api) and is another Node.js Express app. It acts as the REST API endpoint for the Angular client app.

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
- `GET /api/db/delete` - Delete the Azure table
- `GET /api/db/create` - Create the Azure table
- `GET /api/db/seed` - Load the table with seed/sample data
- `GET /api/admin/info` - Provide some information about the backend service, including hostname (good for debuging loadbalanced containers)

The server listens on port 4000 and requires two configuration variables to be set. These are taken from environmental variables. A `.env` file [can also be used](https://www.npmjs.com/package/dotenv) if present.
|Variable Name|Purpose|
|-------------|-------|
|STORAGE_ACCOUNT|Name of the Azure storage account|
|STORAGE_KEY|Access key for the named storage account|


# Kubernetes 
Deployment YAML files for the front and backend services are held in the [docker](docker) directory. Before deployment build the docker images and push to Azure Container Registry, the ACR name in the YAML will require modification. 

Also prior to deployment a Kubernetes secret will need to be created with the Azure Storage account key. This is done via kubectl as follows  
 `kubectl create secret generic azuresecrets --from-literal=storeAcctKey=<keyhere>`


# Running a live, secured instance

> !TODO! Put something here about running in App Service with AAD Auth + switching secured to true in environment.ts

 