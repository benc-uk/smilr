# Running & Developing Locally

To get started working with the project locally there are two main options, either using containers or working with the platform tools (e.g. Node and Mongo) directly on your dev machine

> :speech_balloon: Note. These docs focus only on the core Node.js + Vue.js implementation

This document is not intended to be a complete step by step guide, or lab, so tasks such as installing the pre-reqs will not be covered in any detail

All development of this project has been done in [VS Code 🡽](https://code.visualstudio.com/) although it is not required for basic building/testing.  
Full Visual Studio 2017/2019 is absolutely not required.

If you are on Windows, a recommendation is to use [Windows Subsystem for Linux, aka WSL + Bash 🡽](https://docs.microsoft.com/en-us/windows/wsl/install-win10) for all local development work. This simplifies installing and running things such as Node.js and MongoDB, and git is provided by default

## Build and Run
Prerequisites: 
- [Node.js v8+ & NPM 🡽](https://nodejs.org/en/)
- [Git 🡽](https://git-scm.com/downloads)
- [MongoDB 🡽](https://www.mongodb.com/download-center/community)

Details of building and running the components are covered elsewhere in various sub-sections of these docs. This serves as a quick index to these sections:

Assuming you have the pre-reqs installed and MongoDB running. A simplified "happy path" of the steps at the bash command line are:

#### 1. Clone the repo, set up local configuration env files and install Node modules:
```
git clone https://github.com/benc-uk/smilr.git
cd smilr
cp node/data-api/.env.sample node/data-api/.env
cp node/frontend/.env.sample node/frontend/.env
cp vue/.env.development.sample vue/.env.development.local
npm install ./node/data-api --prefix ./node/data-api
npm install ./node/frontend --prefix ./node/frontend
npm install ./vue --prefix ./vue
```

#### 2. Start the data API server
```
cd node/data-api
npm start
```
If you see any errors, check that MonogDB is running and accessible on localhost

#### 3. Open a second terminal
As the data API server will continue to run in the foreground it will tie up that terminal session. Either start another session, open a second window or if using VS Code start another integrated terminal with `ctrl+shift+'`

#### 4. Build the Vue SPA
```
cd smilr/vue
npm run build-modern
```

#### 5. Start the frontend server
```
cd ../node/frontend
npm start ../../vue/dist
```
Here we are starting the frontend and pointing it to the dist directory which was the output of the previous step

#### 6. Open the client app
Open a modern browser (Chrome, Edge or Firefox) and go to [`http://localhost:3000`](http://localhost:3000)

### Further details of these steps is covered in the respective sub-sections:

#### [:page_with_curl: 1. Running MongoDB](./database#option-3---run-mongodb-locally)
#### [:page_with_curl: 2. Running the Data API](../node/data-api/#building--running-locally)
#### [:page_with_curl: 3. Bundling or running the Vue.js client SPA](../vue/#building--running-locally)
#### [:page_with_curl: 4. Running the frontend](../node/frontend/#building--running-locally)

> :speech_balloon: Note. The dependencies between the components means the frontend and client can't function without the data API, and the data API will not start without a MongoDB instance. So you will likely want to work "backwards" from the database

---

## Use Docker and Containers
Prerequisites:
- [Docker for Windows 10](https://docs.docker.com/docker-for-windows/install/)
- Or Docker tools + admin access to a remote Docker host

> Note. Using containers means there is no requirement to have the underlying platform components such as Node & Mongo installed, however it does require access to a Docker host

Full details of building and running in containers is already covered elsewhere in these docs:

#### [:page_with_curl: Build Images Using Local Docker](./containers/#option-2---build-images-using-local-docker)

