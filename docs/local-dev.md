# Running & Developing Locally

To get started working with the project locally there are two main options, either using containers or working with the platform tools (e.g. Node and Mongo) directly on your dev machine

> Note. These docs focus only on the "Core Node.js + Vue.js implementation"

This document is not intended to be a complete step by step guide, so tasks such as installing the pre-reqs will not be covered in any detail

All development of this project has been done in [VS Code 🡽](https://code.visualstudio.com/) although it is not required for building/testing. Full Visual Studio 2017/2019 is absolutely not required.

If you are on Windows, a recommendation is to use [Windows Subsystem for Linux, aka WSL + Bash 🡽](https://docs.microsoft.com/en-us/windows/wsl/install-win10) for all local dev work. This simplifies installing and running things such as Node.js and MongoDB, and git is provided by default

## Build and run using Node.js & MonogDB locally
Pre-reqs: 
- [Node.js v8+ & NPM 🡽](https://nodejs.org/en/)
- [Git 🡽](https://git-scm.com/downloads)
- [MongoDB 🡽](https://www.mongodb.com/download-center/community)

Details of building and running the components are covered elsewhere in various sub-sections of these docs. This serves as a quick index to these sections:

#### [:page_with_curl: Bundling or running the Vue.js client SPA](../vue/#building--running-locally)
#### [:page_with_curl: Running the frontend](../node/frontend/#building--running-locally)
#### [:page_with_curl: Running the Data API](../node/data-api/#building--running-locally)
#### [:page_with_curl: Running MongoDB](./database/#use-windows-subsystem-for-linux-wsl---ubuntu)

The dependencies between the components means the frontend and client can't function without the data API, and the data API will not start without a MongoDB instance. So in many regards you will likely want to work "backwards" from the database

---

## Use Docker and Containers
Pre-reqs:
- [Docker for Windows 10](https://docs.docker.com/docker-for-windows/install/)
- Or Docker tools + admin access to a remote Docker host

> Note. Using containers means there is no requirement to have the underlying platform components such as Node & Mongo installed, however it does require access to a Docker host

Full details of building and running containers are covered elsewhere in these docs:

#### [:page_with_curl: Build Images Using Local Docker](./containers/#option-2---build-images-using-local-docker)

