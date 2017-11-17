# Azure Templates

These ARM templates allow you to deploy the complete app to Azure.  
Most templates use containers, so Azure Container Registry is a pre-req for these and it is expected that the two service images are build and pushed to the registry before deploying, see [the instructions here](/etc/docker/docker.md)

## Deploy to Azure Container Instance
Deploy the app using Azure Container Instances & Cosmos DB

#### Deployed Resources
- Microsoft.DocumentDB/databaseAccounts
- Microsoft.ContainerInstance/containerGroups

#### Parameters
- `previewLocation`: During preview, only available in these regions: **westeurope**, **westus** & **eastus**
- `acrName`: Name of ACR instance
- `acrPasswrod`: Password for ACR

#### Outputs
- `frontendURL`: URL to access frontend
- `apiURL`: URL to access the API

#### Quick Deploy
[![deploy](https://raw.githubusercontent.com/benc-uk/azure-arm/master/etc/azuredeploy.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fbenc-uk%2Fmicroservices-demoapp%2Fmaster%2Fetc%2Fazure-templates%2Fcontainer-instance%2Fazuredeploy.json)  


