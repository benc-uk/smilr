# Kubernetes - Azure Container Service (AKS)
This document covers setting up Kubernetes in Azure Container Service (AKS) and then deploying the MicroSurvey app to it.  
This assumes you are using WSL bash and have the latest Azure CLI installed (2.0.21+)

### Set Variables
Modify variables and run this snippet in bash, note **acrName** and **cosmosName** need to be globally DNS unique. The ACR name can not contain dashes

```
resGroup=Demo.MicroSurvey
loc=westeurope
aksName=microsurvey-aks
```

> **NOTE.** At the time of writing (Nov 2017) the only regions where AKS is operational and functioning are **westeurope**, **centralus** & **eastus**. UK West and the West US 2 are offline

## Set up & Creation of AKS

### Create AKS 
Run in WSL bash, uses your default **~/.ssh/id_rsa.pub** file. If you have your own SSH keys you wish to replace the `--generate-ssh-keys` parameter with `--ssh-key-value`

You can obviously change the number of agents (VMs that will host containers) and their size

The command might take some time, so be patient 
```
az aks create -g $resGroup -n $aksName --agent-count 2 --agent-vm-size Standard_A2_v2 -k 1.8.1 -l $loc --generate-ssh-keys
```

---

### Get credentials
```
az aks get-credentials -g $resGroup -n $aksName
```

### Sanity Check Kubernetes and AKS
Optional, but recommended, don't panic, it can sometimes take 1-2 mins before any resources appear
```
kubectl get all --all-namespaces
```

### Access Kubernetes dashboard 
Optional, then access [http://127.0.0.1:8001](http://127.0.0.1:8001)
```
az aks browse -g $resGroup -n $aksName
```

---

## Deploying MicroSurvey to AKS

### Pre-requisites 
- Deploy Cosmos DB account and get the master key. [See main README for details](../../#db)
- Deploy Azure Container Registry (ACR), build docker images and push to ACR. [See docker.md for details](docker.md)

### OPTIONAL - Deploy External DNS
These optional steps require you to have a DNS domain you own and that domain to be managed in Azure in a DNS Zone. You can skip this part and just use IP addresses

Create a config file `azure.json`, see sample **azure.json.sample** file, and populate with real values. You will need your Azure sub-id, tenant-id and the client-id & secret of the AAD service principal that was created when you created your AKS instance. Find the service principal in the Azure portal under 'App Registrations' and create a new key and make a note of the secret.

```
kubectl create secret generic azure-config-file --from-file=azure.json
```

Edit `external-dns.yaml` and change the DNS zone & resource to match your domain configuration, then run
```
kubectl create -f external-dns.yaml
```

Edit both `deploy-frontend.yaml` and `deploy-data-api.yaml` and change the annotation called **external-dns.alpha.kubernetes.io&#8203;/&#8203;hostname** giving them a name each within your domain zone, e.g. `microsurvey.example.com` and `microsurvey-api.example.com`


### Deploy pods & service: data-api
Edit `deploy-data-api.yaml` and change the value of COSMOS_ENDPOINT to match the Cosmos instance you deployed earlier. 

Create secret which holds the Cosmos DB master key.  
Get the Cosmos DB key into a bash variable with the following command, change the name and/or resource group as required. They key variable is then used to create the Kubernetes secret
```
cosmosKey=`az cosmosdb list-keys -g $resGroup -n cosmosname --query "primaryMasterKey" -o tsv`
kubectl create secret generic cosmos-secrets --from-literal=$cosmosKey
```

Then deploy the service to Kubernetes with: 
```
kubectl create -f deploy-data-api.yaml
```
Wait for the service to be assigned a public IP, you can check with 
```
kubectl get svc
```
And validate that **data-api-svc** has an external IP, this can sometimes take 5-10 mins. If you used external DNS, validate it has been assigned by using `nslookup` and checking the DNS Zone in Azure with `az network dns record-set list -g fooGroup --zone-name example.com -o table`


### Deploy pods & service: frontend
Edit `deploy-frontend-api.yaml` and change the value of API_ENDPOINT. If you used external DNS, then set it to the domain name you configured in `deploy-data-api.yaml`. If not using DNS, then use the external IP of **data-api-svc**. Don't forget the URL scheme and trailing **/api** path API_ENDPOINT will take the form `http://{dns-or-ip}/api`

To deploy simply run: 
```
kubectl create -f deploy-frontend.yaml
```
Again wait for and validate that **frontend-svc** has an external IP and or DNS, then access this in your browser and follow the database init steps as detailed in the main [README](../../#db)