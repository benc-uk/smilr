# Kubernetes - Azure Container Service (AKS)
This document covers setting up Kubernetes in Azure Container Service (AKS) and then deploying the Smilr app to it.  
This assumes you are using WSL bash and have the latest Azure CLI installed (2.0.21+)

> :exclamation::speech_balloon: **Note.** At the time of writing (Mar 2018) the only regions where AKS is deployed are; westeurope, westus2, eastus, centralus, canadacentral & canadaeast

> # TODO - !!! UPDATE FOR MONGO CHANGES !!!

# Set-up & Creation of AKS

## Create AKS cluster
Running in WSL bash, the `az aks create` command uses your default **~/.ssh/id_rsa.pub** file. If you have your own SSH keys you wish to use, then replace the `--generate-ssh-keys` parameter with `--ssh-key-value` and provide the key public contents as a string

You can obviously change the number of agents (VMs that will host containers) and their size

The command might take some time, so be patient 
```
az aks create -g {res_group} -n {aks_name} -l {location} --agent-count 2 --agent-vm-size Standard_A2_v2 -k 1.8.1 --generate-ssh-keys
```

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
- Deploy Cosmos DB account and get the master key. [See main README for details](/readme.md#component-4---database)
- Deploy Azure Container Registry (ACR), build docker images and push to ACR. [See container docs for details](/docs/containers.md)

## OPTIONAL - Deploy External DNS
These optional steps require you to have a DNS domain you own and that domain to be managed in Azure in a DNS Zone. This part is not for the faint of heart, so you can skip this part and just use IP addresses

Create a config file called `azure.json`, take a copy & rename sample '[**azure.json.sample**](azure.json.sample)' file, and populate with real values. You will need your Azure subscription-id, tenant-id and the client-id & secret of the AAD service principal that was created when you created your AKS instance. Find the service principal in the Azure portal under 'App Registrations' and create a new key and make a note of the secret.

```
kubectl create secret generic azure-config-file --from-file=azure.json
```

Edit `external-dns.yaml` and change the DNS zone & resource to match your domain configuration, then run
```
kubectl create -f external-dns.yaml
```

Edit both `deploy-frontend.yaml` and `deploy-data-api.yaml` and change the annotation called **external-dns.alpha.kubernetes.io&#8203;/&#8203;hostname** giving them a name each within your domain zone, e.g. `smilr.example.com` and `smilr-api.example.com`


## Deploy pods & service: data-api
Unfortunately Kubernetes deployment YAML files don't currently support injecting variables at deployment time like Docker Compose. The only solution is editing the files.

Edit [**deploy-data-api.yaml**](deploy-data-api.yaml) and change the value of `COSMOS_ENDPOINT` to match the Cosmos instance you deployed earlier. 

Create secret which holds the Cosmos DB master key.  
Get the Cosmos DB key into a bash variable with the following command, change the name and/or resource group as required. They key variable is then used to create the Kubernetes secret. You only need to do this once, even after removing and re-deploying the pods
```
cosmosKey=`az cosmosdb list-keys -g $resGroup -n cosmosname --query "primaryMasterKey" -o tsv`
kubectl create secret generic cosmos-secrets --from-literal=$cosmosKey
```

Then deploy the data-api service to Kubernetes with: 
```
kubectl create -f deploy-data-api.yaml
```
Wait for the service to be assigned a public IP, you can check with 
```
kubectl get svc
```
And validate that **data-api-svc** has an external IP, this can sometimes take 5-10 mins. If you used external DNS, validate it has been assigned by using `nslookup` and checking the DNS Zone in Azure with `az network dns record-set list -g {dns_res_group} --zone-name {mydomain.com} -o table`


## Deploy pods & service: frontend
Edit [**deploy-frontend-api.yaml**](deploy-frontend-api.yaml) and change the value of `API_ENDPOINT`. If you used external DNS, then set it to the domain name you configured in **deploy-data-api.yaml**. If not using DNS, then your need the external IP of **data-api-svc** you fetched earlier, this means you need to wait for that to deploy.

:exclamation::speech_balloon: **Note.** Don't forget the URL scheme and trailing **/api** path, so `API_ENDPOINT` will take the form `http://{dns-or-ip}/api`

To deploy the frontend pods now run: 
```
kubectl create -f deploy-frontend.yaml
```
Again wait for and validate that **frontend-svc** has an external IP and or DNS, then access this in your browser :)
