# Azure Container Service (AKS)
This doc covers some of the commands needed to setup Azure Container Service (AKS) and then deploy MicroSurvey app to it.  
This assumes you are using WSL bash and have the latest Azure CLI installed (2.0.20+)

> NOTE. At the time of writing (13th Nov 2017) the only region where AKS is operational and functioning is **eastus**. UK West deploys unstable clusters, and the West US 2 is out of service due to capacity issues.

## Set up & Creation of AKS

### Set Variables
```
resg=Temp.AKS
loc=eastus
name=microsurvey-aks
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
az aks create -g $resg -n $name --agent-count 2 --agent-vm-size Standard_A2_v2 -k 1.8.1 -l $loc
```

---

### Get credentials
**NOTE** Must run this
```
az aks get-credentials -g $resg -n $name
```

### Sanity Check Kubernetes and AKS
Optional, but recommended, don't panic, it can sometimes take 1-2 mins before any resources appear
```
kubectl get all --all-namespaces
```

### Access dashboard 
Optional, then access [http://127.0.0.1:8001](http://127.0.0.1:8001)
```
az aks browse -g $resg -n $name
```

---

## Deploying MicroSurvey to AKS


### Create secret
Get your Cosmos DB master key beforehand
```
kubectl create secret generic azure-secrets --from-literal=cosmosKeySecret=1234changeme1234
1s6D0t9KDLaWP8Dg5gFMilTBxVwgX41YfN938bf1zjnk2LrALTqGI2NhAlBIj3QFu3BY6EJIFagCQruY6AFC6A==
```