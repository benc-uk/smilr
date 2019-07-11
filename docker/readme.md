# Containers & Docker

This covers the building of the app as Docker images and running as containers, using Docker Compose and and pushing into Azure Container Registry (ACR).

# Docker Images for Node.js Implementation
The Dockerfiles for both services are based on Alpine Linux and Node.js v10, the Dockerfiles are in the corresponding node services directories. There are two Docker images, one for each micro service:
 - [node/data-api/Dockerfile](../node/data-api/Dockerfile) For the data API REST service
 - [node/frontend/Dockerfile](../node/frontend/Dockerfile) For the frontend server which serves the Vue.js app to users, 

The frontend Dockerfile is multi-stage and will also carry out the Vue.js build process and integrate the output with the frontend server, without needing to separately build/bundle the Vue.js app

# Azure Container Registry
It is assumed that you will want to store the images in Azure Container Registry (ACR) rather than a public repo (i.e. Dockerhub). Therefore as a pre-req, create and set-up an ACR instance using the guide below, if you have an existing ACR instance, you can simply re-use it.

#### [:page_with_curl: Setting Up Azure Container Registry](../docs/acr.md)

---

# Option 1 - Build Images Using ACR Tasks
This option does not require you to have Docker installed and running locally or access to any sort of Docker host. Images will be built directly in Azure using a feature of Azure Container Registry called 'ACR Tasks'. 

##### [ACR Tasks Docs 🡽](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tasks-overview)

You will require the [Azure CLI installed](https://aka.ms/azure-cli) (either in Windows/PowerShell or WSL/Bash), and ensure the version is at least v2.0.50

In the bash command snippet below modify the *myAcrName* parameter to match the name of ACR instance you have setup or are using, and modify *myAcrResGroup* to the resource group it resides in

Run from the root of this repo/project:

```
# Build data API
az acr build --registry myAcrName -g myAcrResGroup --file node/data-api/Dockerfile --image smilr/data-api https://github.com/benc-uk/smilr.git

# Build frontend
az acr build --registry myAcrName -g myAcrResGroup --file node/frontend/Dockerfile --image smilr/frontend https://github.com/benc-uk/smilr.git
```

> Note. If you are working from a local git clone of the repo, you can switch the URL of the GitHub repo for a local file path, such as `.` if working inside the root of the project

---

# Option 2 - Build Images Using Local Docker
This options require that you have Docker installed and functional on you location machine

# Option 2a - Building Manually
If you want to build the images individually with `docker build`, rather than using Docker Compose, you can do so. When running the command ensure the build context set to the root of the project, and point to the Dockerfile. E.g. from the root of the project run the commands:
```
docker build . -f /node/data-api/Dockerfile -t changeme
docker build . -f /node/frontend/Dockerfile -t changeme
```

You can then run or push the images as you see fit

# Option 2b - Docker Compose
Docker Compose allows us to simplify the building and running of the two images, so a [docker-compose.yml](./docker-compose.yml) file has been created.  
The compose file is relatively simple, so even if you are unfamiliar with Docker Compose, I recommend taking a look at it. Some notes:
- The compose file is setup to build and tag the images (see the `build` section)
- The Smilr frontend, Smilr data API and MonogDB services are defined
- The Smilr containers will expose their default ports (3000 and 4000), you can map these to something else (with the syntax `<external_port>:<container_port>`)
- MongoDB will expose port 27017 externally. Note this is only to allow the **demoData** helper script to be run against it
- The Smilr data API and MonogDB containers will internally communicate via a network called **smilr-net**
- Volumes will be created to persist the MongoDB data

This might sound quite complex but in most cases you can ignore what the file does and just run `docker-compose build` and/or `docker-compose up`

## Docker Compose - Building Images

To build both the Smilr images simply run the following:
```
cd docker
docker-compose build
```

This will build the images and by default, tag them as: 
- `smilr/data-api` 
- `smilr/frontend`

> :speech_balloon: **Note.** There is no build required for the MongoDB image, as we use the [official **mongo** image from Dockerhub](https://hub.docker.com/_/mongo/)

### IMPORTANT! Registry Prefix 
In order to help tagging the images with your registry/repo prefix, you can set the `DOCKER_REG` env variable which prefixed in front of the images. When pushing to ACR this should hold the name of the ACR instance with a trailing slash, e.g. `myregistry.azurecr.io/`. If not using ACR, you can pick any prefix you like. 

It is strongly suggested you set `DOCKER_REG` using a `.env` file. There is a sample file provided in the docker folder which can be copied & renamed. A `.env` file is automatically picked up when you run **docker-compose**

Fully tagged images with registry prefix:
- `myregistry.azurecr.io/smilr/data-api` 
- `myregistry.azurecr.io/smilr/frontend`


## Docker Compose - Running Containers
To run all containers and stand up a complete local running instance of Smilr, simply run:
```
cd docker
docker-compose up
```
This will start the containers and the MonogDB database, you will see a bunch of the console output as the services start. To run detached and not tie up your terminal, run with `docker-compose up -d`

You can then access the Smilr app UI at [`http://localhost:3000`](http://localhost:3000) and the API at [`http://localhost:4000/api`](http://localhost:4000/api)


## Docker Compose - Push to ACR
If you've tagged your images with an ACR prefix as described above, simply run
```
cd docker
docker-compose push
```
This will push the latest images to the registry.

---

# Windows Containers

### :speech_balloon: Note. **It is strongly advised not to use Windows Containers**. 

Windows Containers are currently in a state of flux and running them locally on Windows 10 is extremely problematic on numerous fronts. The use of Windows Containers has not been fully tested. Proceed at your own risk.

Docker build files for creating Windows containers are  provided, with the filename `windows.Dockerfile`.  

These Dockerfiles use the [Node on Windows base images from Stefan Scherer](https://hub.docker.com/r/stefanscherer/node-windows/). For compatibility with Azure Container Instances, currently the Dockerfile is set to use the `nanoserver-2016` tag however this can be changed to any of the *many* tags available for this image