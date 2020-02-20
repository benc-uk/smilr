# Smilr Helm Chart

![logo](https://datamountaineer.com/wp-content/uploads/2016/09/helm.png)

This is a working Helm chart to deploy Smilr. It requires that you have an Ingress Controller deployed, which can be easily installed via Helm.

# Quick Start

- Install Helm [https://docs.helm.sh/using_helm/#installing-helm](https://docs.helm.sh/using_helm/#installing-helm)
- Add Helm to your Kubernetes cluster: `helm init`
- From root of this project `cd kubernetes/helm`
- `helm dependency update smilr`
- `helm install smilr`
- Done!

# Configuration Settings

Create a values file e.g. `myvalues.yaml` by taking a copy of the provided `values.sample.yaml` file and change the defaults. The two values that you are most likely to want to change are **registryPrefix** and **ingress.domainSuffix**, see details below

Then install into your cluster with
```
helm install <<release-name>> smilr -f myvalues.yaml
```

## General Settings

|  Setting  |  Description           | Type | Default |
| --------- | ---------------------- | ---- | ------- |
| **registryPrefix** | Set this to your registry name with trailing slash. If left blank images will be pulled from [here on Docker Hub](https://hub.docker.com/u/smilr/). | String | *blank* |

## Ingress Settings

|  Setting  |  Description           | Type | Default |
| --------- | ---------------------- | ---- | ------- |
| **ingress.domainSuffix** | DNS Domain name associated with your ingress controller.<br/> &bull; If this is set, the chart will create host based ingress rules, with release name as the subdomain. E.g. if *domainSuffix* was set to `foobar.net` and you created a release called 'release1', the ingress will point `release1.foobar.net` at your app.<br/> &bull; If you have not set up DNS for your ingress controller then leave this blank. Path based ingress rules will be created based on the release name. E.g. creating a release called 'release2' will result in your app being at **http://{ingress-ip}/release2/** | String | *blank* |
| **ingress.class** | The class of Ingress to use, if not using AKS and the HTTP Routing add-on, then change this to the class of Ingress you have running in your cluster (e.g. `nginx` or `contour`) | String | addon-http-application-routing |
| **ingress.certIssuer** | If you have [cert-manager](https://github.com/jetstack/cert-manager) configured and installed in your cluster set the name of the ClusterIssuer you wish to use here. The ingress shim will automatically request & issue certs. | String | *blank* |
| **ingress.certName** | If you have an existing TLS cert stored as a secret put the name here, you can use this if you don't want the cert-manager ingress shim automatically issuing certs (so leave `ingress.certIssuer` as blank) | String | *blank* |

## Data API Settings

|  Setting  |  Description           | Type | Default |
| --------- | ---------------------- | ---- | ------- |
| **dataApi.imageTag** | Which tag to pull, e.g. latest | String | latest |
| **dataApi.replicas** | Number of pod replicas to create | Int | 1 |
| **dataApi.mongoConnStr** | Leave blank to use "in cluster" MongoDB pod & service, set to a value to point to an external or existing MongoDB instance, e.g. Cosmos DB or other. If this value is set then no MonogDB deployment will take place | String | *blank* |
| **dataApi.imagePullPolicy** | One of: `Always` or `IfNotPresent` | String | Always |

## Frontend Settings

|  Setting  |  Description           | Type | Default |
| --------- | ---------------------- | ---- | ------- |
| **frontend.imageTag** | Which tag to pull, e.g. latest | String | latest |
| **frontend.replicas** | Number of pod replicas to create | Int | 1 |
| **frontend.imagePullPolicy** | One of: `Always` or `IfNotPresent` | String | Always |

## MongoDB Settings
To prevent MongoDB from being deployed at all, set `mongodb.enabled: false` in this situation, ensure `dataApi.mongoConnStr` points to an external MongoDB/Cosmos DB instance.

|  Setting  |  Description           | Type | Default |
| --------- | ---------------------- | ---- | ------- |
| **mongodb.enabled** | Deploy MongoDB or not,  | Boolean | true |

The smilr chart pulls in the official mongodb chart as a dependency. A full list of the MANY settings that can be used are available here https://github.com/helm/charts/tree/master/stable/mongodb#parameters  

A common scenario is to turn persistence on/off using `mongodb.persistence.enabled`, for speed in demos it's set to `false` as a default. When enabled teh chart will create a persistent volume, and MonogDB startup might be significantly longer


## Sentiment API Settings
Running the sentiment analysis 'in-cluster' is optional.

|  Setting  |  Description           | Type | Default |
| --------- | ---------------------- | ---- | ------- |
| **sentiment.enabled** | Enable or disable running the cognitive services container | Boolean | false |
| **sentiment.key** | Cognitive Services API key. Required if enabled | String | *blank* |
| **sentiment.region** | Cognitive Services Azure region. Required if enabled | String | *blank* |