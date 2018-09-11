# Containers & Docker

This covers the building of the app as Docker images and running as containers, using Docker Compose and and pushing into Azure Container Registry.

# Docker Images (Node.js)
The Dockerfiles for both services are based on Alpine Linux and Node.js v8, the Dockerfiles are in the corresponding node services directories. There are two Docker images, one for each micro service:
 - [node/data-api/Dockerfile](../node/data-api/Dockerfile) For the data API REST service
 - [node/frontend/Dockerfile](../node/frontend/Dockerfile) For the frontend server which serves the Angular app to users, 

The frontend Dockerfile is multi-stage and will carry out the entire Angular build process without needing the Angular CLI installed on the local machine

### :exclamation::speech_balloon: Gotcha
If you want to build the images individually, rather than using Docker Compose, you must do so with the build context set to the root of the project, and point to the Dockerfile, e.g. run `docker build . -f /node/frontend/Dockerfile` from project root (the **smilr** directory).

# Docker Registry - ACR
It is assumed that your images will be stored in Azure Container Registry (ACR) rather than a public repo (i.e. Dockerhub).  
As a pre-req, create and set-up an ACR instance using the guide below, if you have an existing ACR instance, you can simply re-use it.

#### [:page_with_curl: Setting Up ACR](acr.md)

# Docker Compose
Docker Compose allows us to simplify the building and running of the two images, so a [docker-compose.yml](/docker-compose.yml) file has been created.  
The compose file is relatively simple, so even if you are unfamiliar with Docker Compose I recommend taking a look at it. Some notes:
- The compose file is setup to build and tag the images (see the `build` section)
- The Smilr frontend, Smilr data API and MonogDB services are defined
- The Smilr containers will expose their default ports (3000 and 4000), you can map these to something else (with the syntax `<external_port>:<container_port>`)
- MongoDB will expose port 27017 externally. Note this is only to allow the **demoData** helper script to be run against it
- The Smilr data API and MonogDB containers will internally communicate via a network called **smilr-net**
- Volumes will be created to persist the MongoDB data

This might sound quite complex but in most cases you can ignore what the file does and just run `docker-compose build` and/or `docker-compose up`

## Docker Compose - Building Images

To build both the Smilr images simply run the following from the root of the project:
```
docker-compose build
```

This will build the images and by default, tag them as: 
- `smilr/data-api` 
- `smilr/frontend`

:exclamation::speech_balloon: **Note.** There is no build required for the MongoDB image, as we use the [official **mongo** image from Dockerhub](https://hub.docker.com/_/mongo/)

In order to help tagging the images to be pushed to ACR, you can set the `DOCKER_REG` env var. This should hold the name of the ACR instance with a trailing slash '/', e.g. `myregistry.azurecr.io/`. This is then prefixed in front of the image.  
The best way to set `DOCKER_REG` is with an `.env` file, there is a sample file provided at the root of the project, `.env` files are automatically picked up when you run **docker-compose**

Fully tagged images with registry prefix:
- `myregistry.azurecr.io/smilr/data-api` 
- `myregistry.azurecr.io/smilr/frontend`


## Docker Compose - Running Containers
To run all containers and stand up a complete running instance of Smilr, simply run:
```
docker-compose up
```
This will start the containers and the MonogDB database, you will see a bunch of the console output as the services start. To run detached and not tie up your terminal, run with `docker-compose up -d`

You can then access the Smilr app UI at [`http://localhost:3000`](http://localhost:3000) and the API at [`http://localhost:4000/api`](http://localhost:4000/api)


## Docker Compose - Push to ACR
If you've tagged your images with an ACR prefix as described above, simply run
```
docker-compose push
```
This will push the latest images to the registry.

---

# Windows Containers

### :exclamation::speech_balloon: Note. **It is strongly advised not to use Windows Containers**. They are currently in a state of flux with the 1709 and Nano Server changes, running them locally on Windows 10 is extremely problematic on numerous fronts. The use of Windows Containers has not been fully tested. Proceed at your own risk.

Docker build files for creating Windows containers are also provided, with the filename `windows.Dockerfile`.  
These are using the [Node on Windows base images from Stefan Scherer](https://hub.docker.com/r/stefanscherer/node-windows/). Currently the Dockerfile is set to use the `nanoserver-2016` tag however this can be changed to any of the *many* tags available for this image (for example 1709)

A Docker Compose file `docker-compose-windows.yml` has been created to build and run the Windows containers. The images will be tagged with a `:windows` tag. Add the `-f docker-compose-windows.yml` switch to the compose commands to point Docker Compose at the Windows version.

