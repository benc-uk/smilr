# Azure Pipelines

## Pipeline definitions
These are a set of CI/CD pipeline definitions for use with [Azure DevOps Pipelines](https://azure.microsoft.com/en-gb/services/devops/pipelines/) to automatically build and deploy Smilr

:warning: May 2019, These are multi-stage YAML pipelines which currently are in preview, and need to be enabled as a "preview feature" in Azure DevOps

The contents of the `azure\pipelines` directory are:

| Filename | Purpose | Trigger |
|----------|---------|---------|
|`build-acr.yml`|Build both frontend and data API as container images. Push tags `latest` & `{build-id}` to Azure Container Registry|CI triggered by any push to master branch|
|`deploy-aci.yml`|Deploys to Azure Container Instances in test/staging/prod environments with functional tests at each stage|Scheduled once a week|
|`deploy-aks.yml`|Deployment only. Deploys to Kubernetes AKS using Helm in test/staging/prod namespaces with functional tests at each stage|Manually triggered|
|`dockerhub-stable.yml`|Updates the image tags, and re-tags `latest` as `stable`, pushes `stable` to ACR and also pushes `latest` and `stable` to public Dockerhub|Manually triggered|
|`windows-images.yml`|Builds Windows containers versions of the frontend and data API. Both "2016 LTS" and "1809" versions are built. All images are pushed to both ACR and Dockerhub|Manually triggered|

