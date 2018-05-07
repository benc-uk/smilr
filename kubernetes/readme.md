# Kubernetes - Azure Container Service (AKS)

![logo](https://avatars1.githubusercontent.com/u/13629408?s=250)

This document covers deploying Smilr into Kubernetes and specifically into Azure Container Service (AKS) 
This assumes you have the latest Azure CLI installed (2.0.21+)

> :exclamation::speech_balloon: **Note.** At the time of writing (May 2018) the only regions where AKS is deployed are; westeurope, eastus, centralus, canadacentral & canadaeast

# Set-up & Creation of AKS

This document is not intended to be a step by step guide for deploying Azure Container Service (AKS), if you do not have AKS setup then there are several guides you can use
 - Azure Citadel - [Kubernetes: Hands On With Microservices](https://azurecitadel.github.io/labs/kubernetes/)
 - Azure Docs - [Quickstart: Deploy an Azure Container Service (AKS) cluster](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough)

---

# Deploying Smilr to Kubernetes

Once you have AKS deployed and are able to interact with it via `kubectl` you can start deploying Smilr to it

## Pre-requisites 
Before starting deploying Smilr into Kubernetes you will need to Deploy Azure Container Registry (ACR), build the Docker images and push them up to ACR.  

:page_with_curl: [Refer to the complete container guide for details](/docs/containers.md)

Notes on Smilr Kubernetes deployment:
- When deploying to Kubernetes use of the `default` namespace is assumed.
- Kuberenetes version 1.9 is assumed, if you are using 1.8 or older the API version in the deployment YAML may require changing e.g. to `apiVersion: apps/v1beta1`. Older versions have not been tested.
- In most scenarios the default is to deploy MongoDB with a persistent volume claim to persist data in the database. This can result in a ~5 minute wait while this volume is created and bound to the MonogDB pod. Until this pod is ready the Smilr app will not be fully functional.

## Option 1 - Helm (Easiest)
[Helm](https://helm.sh/) is a package manager for Kubernetes, and a Helm Chart has been created to deploy Smilr. This means you can deploy Smilr with a single command. The chart is called simply 'smilr' and is in the helm subdirectory 

### Helm & Smilr Quick Start

- Install Helm https://docs.helm.sh/using_helm/#installing-helm
- Add Helm to your Kubernetes cluster: `helm init`
- `helm install stable/nginx-ingress`
- From root of this project `cd kubernetes/helm`
- `helm install smilr`
- Done!

See the [Helm chart readme for more details](helm/readme.md)

## Option 2 - Direct Deployment

Deployment YAML files have been provided to directly stand up Smilr in your Kubernetes cluster. Two scenarios are provided, in both cases the deployment has been split into multiple files. 

Before deployment of either scenario the two files `frontend.deploy.yaml` and `data-api.deploy.yaml` will require editing to point to your images and the relevant registry (i.e. ACR) & tag you are using. It is assumed you will be deploying to the default namespace

### Scenario A - Using Ingress
![kube1](../etc/kube-scenario-a.png)
 **[Deployment Files for this scenario are in /kubernetes/using-ingress](using-ingress/)** 

This method uses a Kubernetes ingress controller with a single entrypoint into your cluster, and rules to route traffic to the Smilr frontend and data-api as required. This simplifies config as the API endpoint is the same as where the Angular SPA is served from so it doesn't require any fiddling with IP addresses and DNS. However it does require an ingress controller (of type Nginx). Deploying an ingress controller is very simple with Helm and it's a single command `helm install stable/nginx-ingress`. If you don't want to use Helm you can [stand one up manually](https://kubernetes.github.io/ingress-nginx/deploy/)

Once you have an ingress deployed, the steps for deployment of Smilr are:
```
cd kubernetes/using-ingress
kubectl apply -f .
```
The app will be available at **http://{ingress-controller-ip}/smilr**  
If you want to get the IP of your ingress you can run  
```
kubectl get svc -l app=nginx-ingress --all-namespaces -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}{"\n"}'
```

### Scenario B - Using LoadBalancer
![kube2](../etc/kube-scenario-b.png)
**[Deployment Files for this scenario are in /kubernetes/using-loadbalancer](using-loadbalancer/)** 

This method exposes the two Smilr services externally with their own external IP addresses, using the Kubernetes ***LoadBalancer*** service type. This has the advantage of not requiring any dependency on an Ingress controller but does require some manual editing of the YAML during deployment. 

The steps for deployment are:
```
cd kubernetes/using-loadbalancer
kubectl apply -f mongodb.all.yaml
kubectl apply -f data-api.deploy.yaml
kubectl apply -f data-api.svc.yaml
kubectl get svc data-api-svc -w
```
Wait for `data-api-svc` to get an external IP address assigned, once it has, hit CTRL+C stop waiting. **Note.** This can take about 5-10 minutes in some cases, so be patient.  
Copy the external IP address and edit `frontend.deploy.yaml` modify the `API_ENDPOINT` env URL to point to the data-api IP which was just assigned. You will need to have `/api` as part of the URL, e.g. **http://{data-api-svc-ip}/api**

Now run:
```
kubectl apply -f frontend.deploy.yaml
kubectl apply -f frontend.svc.yaml
kubectl get svc frontend-svc -w
```
Wait for `frontend-svc` to get an external IP address assigned, once it has, hit CTRL+C stop waiting.  
The frontend-svc external IP address is where you can access the Smilr app, e.g. by visiting **http://{frontend-svc-ip}/** in your browser

---

# Optional Appendix - Deploy External DNS
These optional steps require you to have a DNS domain you own and that domain to be managed in Azure in a DNS Zone.  
:exclamation::speech_balloon: **Note.** This part is not for the faint of heart, so you can skip this section and just use IP addresses

Using DNS simplifies configuration, as you don't need to edit the `frontend.deploy.yaml` file to update it with the **data-api-endpoint** IP

Create a config file called `azure.json`, take a copy & rename the sample [azure.json.sample](azure.json.sample) file, and populate with real values. You will need your Azure subscription-id, tenant-id and the client-id & secret of the AAD service principal that was created when you created your AKS instance (it has the same name as the AKS instance). 

Most of this information is held in `~/.azure/aksServicePrincipal.json`, the key to each object in the JSON is the Azure subscription id

```
kubectl create secret generic azure-config-file --from-file=azure.json -n azure-system
```

Edit `external-dns/deploy.yaml` and change the DNS zone & resource group to match your configuration in Azure, then run
```
kubectl create -f external-dns/deploy.yaml -n azure-system
```

Edit both `frontend.svc.yaml` and `data-api.svc.yaml` and uncomment the annotation called **external-dns.alpha.kubernetes.io&#8203;/&#8203;hostname** giving them a name each within your domain zone, e.g. `smilr.example.com` and `smilr-api.example.com`

