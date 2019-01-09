# Azure DevOps Pipelines

This directory contains YAML definitions for use with [Azure DevOps Pipelines](https://azure.microsoft.com/en-gb/services/devops/pipelines/) to build Smilr

## Build definitions

These are found in the `azure\pipelines\builds` sub-directory:

| Filename | Purpose | Notes |
|----------|---------|-------|
|`acr-dockerhub.yml`|Build both frontend and data API as container images. Push tags `latest` & `{build-id}` to Azure Container Registry & `latest` to Dockerhub|Used by project, ignore unless you want to host images on Dockerhub too|
|`acr-dockerhub-win.yml`|Build both frontend and data API as Windows container images. Push `windows` tag to Azure Container Registry & Dockerhub|Used by project, ignore unless you want to host images on Dockerhub too|
|`acr-only.yml`|Build both frontend and data API as container images. Push tags `latest` & `{build-id}` to Azure Container Registry|If building your own images this is the pipeline to start with|
|`update-stable.yml`|Re-tags `latest` images as `stable` and pushes to both Azure Container Registry & Dockerhub|Ignore if not using `stable` tag|
|`api-tests.yml`|Deploys MongoDB with ACI, then stands up the data API, then runs Postman tests with newman runner|Please don't run your tests in a separate pipeline like this|

## Release definitions

These will eventually found in the `azure\pipelines\releases` sub-directory:

***Pending Azure DevOps supporting YAML for releases***