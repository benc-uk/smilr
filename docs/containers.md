# Containers & Docker

This covers the building of the app as Docker images and running as containers, using Docker Compose and and pushing into Azure Container Registry.

# Docker Images (Node.js)
The Dockerfiles for both services are based on Alpine Linux and Node.js v8, the Dockerfiles are in the corresponding node services directories. There are two Docker images, one for each micro service:
 - [node/data-api/Dockerfile](/node/data-api/Dockerfile) For the data API REST service
 - [node/frontend/Dockerfile](/node/frontend/Dockerfile) For the frontend server which serves the Angular app to users, 

The frontend Dockerfile is multi-stage and will carry out the entire Angular build process without needing the Angular CLI installed on the local machine

### :exclamation::speech_balloon: Gotcha
If you want to build the images directly, rather than using Docker Compose, you must do so with the build context set to the root of the project, and point to the Dockerfile, e.g. run `docker build . -f /node/frontend/Dockerfile` from project root (the **microservices-demoapp** directory).

# Docker Registry - ACR
It is assumed that your images will be stored in Azure Container Registry (ACR) rather than a public repo (i.e. Dockerhub).  
As a pre-req, [create and set-up an ACR instance](acr.md) if you have an existing ACR instance, you can simply re-use it.

# Docker Compose
Docker Compose allows us to simplify the building and running of the two images, so a [docker-compose.yml](../docker-compose.yml) file has been created.  
The compose file is fairly simple, so even if you are unfamiliar with Docker Compose I recommend taking a look at it. Some notes:
- Both the frontend and API services are defined
- They will expose their default ports (3000 and 4000), you can map these to something else (with the syntax `<external_port>:<container_port>`)
- The compose file is setup to build and tag the images (see the `build` section)
- The `env_file` parameter for each service is pointing to a `.env` config file. This file is exactly the same as the one discussed in the [main readme docs](/README.md#wrench-runtime-configuration--settings). This saves us declaring & passing lots of environmental variables (e.g. `API_KEY`, `COSMOS_ENDPOINT` & `COSMOS_KEY`) to the containers.  
This setting is pointing to the `.env` file in each of the Node service sub-directories (node/data-api/ and node/frontend/) . ***By default these `.env` files will not exist*** so it suggested you create them by renaming and editing the `.env.sample` files provided

## Docker Compose - Building Images

To build both images simply run the following from the root of the project:
```
docker-compose build
```

This will build the images and by default, tag them as: 
- `smilr/data-api` 
- `smilr/frontend`

In order to help tagging the images to be pushed to ACR, you can set the `DOCKER_REG` env var. This should hold the name of the ACR instance with a trailing slash '/', e.g. `myregistry.azurecr.io/`. This is then prefixed in front of the image.  
The best way to set `DOCKER_REG` is with an `.env` file, there is a sample file provided at the root of the project, `.env` files are automatically picked up when you run **docker-compose**

Fully tagged images with registry prefix:
- `myregistry.azurecr.io/smilr/data-api` 
- `myregistry.azurecr.io/smilr/frontend`


## Docker Compose - Running Containers
To run both both containers and configure them with the settings held in the `.env` files simply run:
```
docker-compose up
```
This will start both the containers and you will see some of the console output as the services start. To run detached and not tie up your terminal, run with `docker-compose up -d`

You can then access the Smilr app UI at [`http://localhost:3000`](http://localhost:3000) and the API at [`http://localhost:4000/api`](http://localhost:4000/api)

### :exclamation::speech_balloon: Cosmos DB Emulator Gotcha
If using the Cosmos DB emulator with the data-api running locally in a container, the emulator will refuse connections from the api container (you will see **ECONNREFUSED** errors). This is because by default the emulator only binds to loopback (127.0.0.1). The fix is to run the emulator the `AllowNetworkAccess` and `Key` switches, e.g.

```
& "C:\Program Files\Azure Cosmos DB Emulator\CosmosDB.Emulator.exe" /AllowNetworkAccess /Key={YOUR_KEY}
```
The key needs to be a base64 encoded value of 64 bytes (characters). You can use https://www.base64encode.org/ to create a valid key, or simply re-use the pre-defined key. A [helper PowerShell script](/scripts/cosmosEmu) is provided to run the emulator with **AllowNetworkAccess** and the default key

The Cosmos endpoint you specify in the data-api container will no longer be localhost, you will need to use your real local IP, e.g. `COSMOS_ENDPOINT=https://192.168.0.53:8081`

## Docker Compose - Push to ACR
If you've tagged your images with an ACR prefix as described above, simply run
```
docker-compose push
```
This will push the latest images to the registry.

---

# Windows Containers
Docker build files for creating Windows containers are also provided, with the filename `windows.Dockerfile`.  
These are using the [Node on Windows base images from Stefan Scherer](https://hub.docker.com/r/stefanscherer/node-windows/). Currently the Dockerfile is set to use the `nanoserver-2016` tag however this can be changed to any of the *many* tags available for this image (for example 1709)

A Docker Compose file `docker-compose-windows.yml` has been created to build and run the Windows containers. The images will be tagged with a `:windows` tag. Add the `-f docker-compose-windows.yml` switch to the compose commands to point Docker Compose at the Windows version.
