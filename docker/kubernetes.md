# Azure Container Service (AKS)
This doc covers some of the commands needed to setup Azure Container Service (AKS) and then deploy MicroSurvey app to it.  
This assumes you are using WSL bash and have the latest Azure CLI installed (2.0.20+)

## Set up & Creation of AKS

### Set Variables
```
resg=Temp.AKS2
loc=ukwest
name=ben-aks
```

### Create Group
```
az group create -n $resg -l $loc
```

### Create AKS 
Run in WSL bash, uses your default **~/.ssh/id_rsa.pub** file
Optional params:
* `--generate-ssh-keys` 
* `--ssh-key-value `
* `-k 1.8.1` 

```
az aks create -g $resg -n $name --agent-count 2 --agent-vm-size Standard_A2_v2 -l $loc
```

### Get credentials
**NOTE** Must run this
```
az aks get-credentials -g $resg -n $name
```

### Access dashboard 
Optional
```
az aks browse -g $resg -n $name
```

### Sanity Check Kubernetes and AKS
Optional
```
kubectl get all --all-namespaces
```

---

## Deploying MicroSurvey to AKS


### Create secret
Get your Cosmos DB master key beforehand
```
kubectl create secret generic azureSecrets -from-literal=COSMOS_KEY=1234changeme1234
```