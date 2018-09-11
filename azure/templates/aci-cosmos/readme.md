# ARM Template - Azure Container Instance & Cosmos DB
Deploy the Smilr app using Azure Container Instances & Cosmos DB. 
A new Cosmos DB account will be created, so this template takes around 5 minutes to deploy

## Deployed Resources
- Microsoft.DocumentDB/databaseAccounts
- Microsoft.ContainerInstance/containerGroups

## Parameters
- `previewLocation`: During preview, only available in these regions: **westeurope**, **westus** & **eastus**
- `acrName`: Name of your ACR instance
- `acrPassword`: Password for ACR

## Outputs
- `frontendURL`: URL to access frontend
- `apiURL`: URL to access the API
- `mongoConnStr`: Connection string for Cosmos DB Mongo API

## Quick Deploy
[![deploy](https://raw.githubusercontent.com/benc-uk/azure-arm/master/etc/azuredeploy.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fbenc-uk%2Fsmilr%2Fmaster%2Fazure%2Ftemplates%2Faci-cosmos%2Fazuredeploy.json)  

## Notes