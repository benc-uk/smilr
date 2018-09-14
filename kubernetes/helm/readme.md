# Smilr Helm Chart

![logo](https://ngeor.files.wordpress.com/2017/11/helm-small.png?w=250)

This is a working Helm chart to deploy Smilr. It requires that you have an Ingress Controller deployed, which can be easily installed via Helm.

# Quick Start

- Install Helm https://docs.helm.sh/using_helm/#installing-helm
- Add Helm to your Kubernetes cluster: `helm init`
- `helm install stable/nginx-ingress`
- From root of this project `cd kubernetes/helm`
- `helm install smilr`
- Done!

# Configuration Settings

Create a values file e.g. `myvalues.yaml` by taking a copy of the provided `myvalues.sample.yaml` file and change the defaults. The two values that you are most likely to want to change are **registryPrefix** and **domainSuffix**, see details below

Then install into your cluster with
```
helm install smilr -f myvalues.yaml -n releasename
```

## General Settings

|  Setting  |  Description           | Type | Default |
| --------- | ---------------------- | ---- | ------- |
| **registryPrefix** | Set this to your registry name with trailing slash. If left blank images will be pulled from [here on Docker Hub](https://hub.docker.com/u/smilr/). | String | *blank* |
| **cmCertIssuer** | If you have [cert-manager](https://github.com/jetstack/cert-manager) configured and installed in your cluster set the name of the ClusterIssuer you wish to use here. The ingress shim will automatically request & issue certs. Otherwise leave blank and HTTPS will not be available | String | *blank* |
| **domainSuffix** | DNS Domain name associated with your ingress controller.<br/> &bull; If this is set, the chart will create host based ingress rules, with release name as the subdomain. E.g. if *domainSuffix* was set to `foobar.net` and you created a release called 'release1', the ingress will point `release1.foobar.net` at your app.<br/> &bull; If you have not set up DNS for your ingress controller then leave this blank. Path based ingress rules will be created based on the release name. E.g. creating a release called 'release2' will result in your app being at **http://{ingress-ip}/release2/** | String | *blank* |
| **ingressClass** | The class of Ingress to use, if not using AKS and the HTTP Routing add-on, then change this to the class of Ingress you have running in your cluster (e.g. nginx) | String | addon-http-application-routing |


## Data API Settings

|  Setting  |  Description           | Type | Default |
| --------- | ---------------------- | ---- | ------- |
|**dataApi.imageTag** | Which tag to pull, e.g. latest | String | latest |
|**dataApi.replicas** | Number of pod replicas to create | Int | 1 |
| **dataApi.mongoConnStr** | Leave blank to use "in cluster" MongoDB pod & service, set to a value to point to an external or existing MongoDB instance, e.g. Cosmos DB or other. If this value is set then no MonogDB deployment will take place | String | *blank* |
| **dataApi.magePullPolicy** | One of: `Always` or `IfNotPresent` | String | Always |

## Frontend Settings

|  Setting  |  Description           | Type | Default |
| --------- | ---------------------- | ---- | ------- |
| **frontend.imageTag** | Which tag to pull, e.g. latest | String | latest |
| **frontend.replicas** | Number of pod replicas to create | Int | 1 |
| **frontend.imagePullPolicy** | One of: `Always` or `IfNotPresent` | String | Always |

## MongoDB Settings

|  Setting  |  Description           | Type | Default |
| --------- | ---------------------- | ---- | ------- |
| **mongo.usePersistence** | Boolean. If true, then a persistent volume claim will be requested and mounted to persist MongoDB data. | Boolean | true |