# Smilr Helm Chart

![logo](https://ngeor.files.wordpress.com/2017/11/helm-small.png?w=250)

This is a working Helm chart to deploy Smilr. It requires that you have an working Ingress Controller deployed, which can be installed via Helm.

# Quick Start

- Install Helm https://docs.helm.sh/using_helm/#installing-helm
- Add Helm to your Kubernetes cluster: `helm init`
- `helm install stable/nginx-ingress`
- From root of this project `cd kubernetes/helm`
- `helm install smilr`
- Done!

# Configuration Settings

Create a values file (e.g. `myvalues.yaml` take a copy of the provided .sample file) if you want to change the defaults, and install with
```
helm install smilr -f myvalues.yaml -n releasename
```

## General Settings
- **registryPrefix:** Set this to your registry name with trailing slash. If left blank images will be pulled from [here on Docker Hub](https://hub.docker.com/u/smilr/). 
- **domainSuffix:** DNS Domain name associated with your ingress controller.
  - If this is set, the chart will create host based ingress rules, with release name as the subdomain. E.g. if *domainSuffix* was set to `foobar.net` and you created a release called 'release1', the ingress will point `release1.foobar.net` at your app.
  - If you have not set up DNS for your ingress controller then leave this blank. Path based ingress rules will be created based on the release name. E.g. creating a release called 'release2' will result in your app being at **http://{ingress-ip}/release2/**


## Data API Settings
- **dataApi.imageTag:** Which tag to pull, e.g. latest
- **dataApi.replicas:** Number of pod replicas to create
- **dataApi.mongoConnStr:** Leave blank to use "in cluster" MongoDB pod & service, set to a value to point to an external or existing MongoDB instance, e.g. Cosmos DB or other. If this value is set then no MonogDB deployment will take place
- **imagePullPolicy:** One of: *Always* or *IfNotPresent*

## Frontend Settings
- **frontend.imageTag:** Which tag to pull, e.g. latest
- **frontend.replicas:** Number of pod replicas to create
- **imagePullPolicy:** One of: *Always* or *IfNotPresent*

## MongoDB Settings
- **mongo.usePersistence:** Boolean. If true, then a persistent volume claim will be requested and mounted to persist MongoDB data.