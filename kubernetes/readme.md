# Kubernetes - Azure Container Service (AKS)
This document covers setting up Kubernetes in Azure Container Service (AKS) and then deploying the Smilr app to it.  
This assumes you have the latest Azure CLI installed (2.0.21+)

> :exclamation::speech_balloon: **Note.** At the time of writing (Mar 2018) the only regions where AKS is deployed are; westeurope, westus2, eastus, centralus, canadacentral & canadaeast

# Set-up & Creation of AKS

## Create AKS cluster
Using the Azure CLI creating an AKS cluster is easy. 

The command might take some time, in some cases up to an hour 
```
az aks create -g {res_group} -n {aks_name} -l {location} --node-count 3 --node-vm-size Standard_B4ms -k 1.9.1
```
You can obviously change the number of nodes (VMs that will host containers) and their size. Here we are using the B-series VMs with 4 cores and 16GB memory and we build three of them

Running in WSL bash, the `az aks create` command uses your default **~/.ssh/id_rsa.pub** file to provision the cluster. If you have your own SSH keys you wish to use, then add the `--ssh-key-value` parameter and provide the key public contents as a string


## Get Kubectl and Credentials
To access the Kubernetes system you will be using the standard Kubernetes `kubectl` command line tool. To download the `kubectl` binary run:
```
az aks install-cli
```

The `kubectl` command works off a set of cached credentials, held in a .kube directory your user profile/homedir. The Azure CLI makes getting these credentials for your AKS instance easy:
```
az aks get-credentials -g {res_group} -n {aks_name} 
```

## Sanity Check Kubernetes and AKS
Optional, but recommended run the following. Don't panic, it can sometimes take several minutes before any resources appear
```
kubectl get all --all-namespaces
```

## Access Kubernetes Dashboard 
Accessing the Kubernetes dashboard is entirely optional, but if it's your first time using Kubernetes it can help provide visibility into what is going on. The dashboard is accessed via a proxy tunnel into the Kubernetes cluster itself. To create this proxy run the following Azure CLI command
```
az aks browse -g {res_group} -n {aks_name} 
```
Then access [http://127.0.0.1:8001](http://127.0.0.1:8001) in your browser. Note. It is fairly common for the proxy to drop after short periods of inactivity, so have a terminal on hand to re-start the `az aks browse` command

---

# Deploying Smilr to AKS

## Pre-requisites 
Before starting deploying Smilr into Kubernetes you will need to Deploy Azure Container Registry (ACR), build the Docker images and push them up to ACR.  

:page_with_curl: [Refer to the complete container guide for details](/docs/containers.md)

Notes on Smilr Kubernetes deployment:
- When deploying to Kubernetes use of the `default` namespace is assumed.
- The deployment files are split into separate `.deploy` and `.svc` files. This allows us to modify and deploy them separately. In many cases you might want to re-deploy the pods (in the `.deploy` file) but leave the load-balancer in place (in the `.svc` file).
- Kuberenetes version 1.9 is assumed, if you are using 1.8 or older the API version in the deployment YAML may require changing e.g. to `apiVersion: apps/v1beta1`


## Deploy MongoDB
Deploy the MongoDB pod to Kubernetes with the following: 
```
kubectl create -f mongodb.all.yaml
```
This will run as a single pod, and the be exposed only inside the cluster (with ClusterIP), the default hostname to access it from within the cluster is `mongodb-svc`. This is the name of the ClusterIP service we created, as Kubernetes provides internal DNS for all services

> :exclamation::speech_balloon: **Note.** Currently Mongo is configured as a StatefulSet, however it is not replication aware so you can only have a single replica running. This simplifies things significantly for most demos. Replicating Mongo across multiple pods is outside of the scope of this doc.

## Deploy Smilr Microservice - Data API 
Then deploy the data-api containers to Kubernetes with: 
```
kubectl create -f data-api.deploy.yaml
```
Check the pods all start using the dashboard or with `kubectl get pods`  
There should be four pods created and running

Then deploy the data-api loadbalanced public IP and endpoint to Kubernetes with: 
```
kubectl create -f data-api.svc.yaml
```
Check the status with `kubectl get svc`, and wait for the **EXTERNAL-IP** to get assigned to **data-api-endpoint**, this will take about 5-10 minutes so be patient. It is advised in a demo to create this ahead of time and not delete it. 

Make of note of this IP as will need it in the next step


## Deploy Smilr Microservice - Frontend
Edit [**frontend.deploy.yaml**](frontend.deploy.yaml) and change the value of `API_ENDPOINT`. If you used external DNS, then set it to the domain name you configured in **data-api.deploy.yaml**. If not using DNS, then your need the external IP of **data-api-endpoint** you fetched in the previous step, this means you need to wait for that to deploy.

:exclamation::speech_balloon: **Note.** Don't forget the URL scheme and trailing **/api** path, so `API_ENDPOINT` will take the form `http://{dns-or-ip}/api`

Then deploy the frontend containers to Kubernetes with: 
```
kubectl create -f frontend.deploy.yaml
```

Then deploy the frontend loadbalanced public IP and endpoint to Kubernetes with: 
```
kubectl create -f frontend.svc.yaml
```
Again wait for and validate that **frontend-endpoint** has an external IP and or DNS (same process and delay as the **data-api-endpoint**), then access this in your browser :)

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

