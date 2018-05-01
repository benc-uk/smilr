# Helm Chart

This is a working Helm chart to deploy Smilr

## Quick Start

- Install Helm https://docs.helm.sh/using_helm/#installing-helm
- Add Helm to your Kubernetes cluster: `helm init`
- From root of this project `cd kubernetes`
- `helm install smilr`
- Done!

# Configuration Settings
### General Settings
- **registryPrefix:** Set this to your registry name with trailing slash. If left blank images will be pulled from Docker Hub. *Default: bcdemo.azurecr.io/*
- **domainSuffix:** DNS Domain name to use. *Default: democloud.org.uk*

### Data API Settings
- **dataApi.imageTag:** stable
- **dataApi.replicas:** 1
- **dataApi.mongoConnStr:** 

### Frontend Settings
- **frontend.imageTag:** stable
- **frontend.replicas:** 1

### MongoDB Settings
- **mongo.usePersistence:** false