# Azure Container Registry - Setup
Azure Container Registry (ACR) is a managed Docker registry service (PaaS) based on the open-source Docker Registry 2.0. You can use ACR to store and manage your private Docker container images and host them securely in Azure

You can stand up an ACR instance two ways:

## Create ACR using Azure CLI
These steps assume you have the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest) installed

Substitute `{acr_name}` for the name of the ACR instance you want to create and use, change `{res_group}` as required.
```
az acr create -n {acr_name} -g {res_group} --admin-enabled --sku Standard
```

Before you can push images to your registry you will need to login to it.
Login to the ACR with (this is a wrapper around the `docker login` command):
```
az acr login -n {acr_name} -g {res_group}
```

Or you can get the password and login directly with the Docker command
```
az acr credential show -n {acr_name} -g {res_group}

docker login {acr_name}.azurecr.io
```

#### Set CLI Default Registry
You generally work with only a single Container Registry so it's helpful to set its name as the default for all CLI commands
```
az configure --defaults acr={acr_name}
```


## Create ACR using Azure Portal
As this is something you typically only do once, you can use the Azure portal:  
https://docs.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal