# ARM Template - Azure Container Instance
Deploy the Smilr app using just Azure Container Instances (ACI) with MongoDB running in a container. The data-api and mongo containers will run in the same container group and so demonstrates the shared container group model in ACI  

## Deployed Resources
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
[![deploy](https://raw.githubusercontent.com/benc-uk/azure-arm/master/etc/azuredeploy.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fbenc-uk%2Fsmilr%2Fmaster%2Fazure%2Ftemplates%2Faci-mongo%2Fazuredeploy.json)  

## Notes
The Mongo server is not exposed to the internet so you can not run the **demoData** script against it to load demo data, but you can create events using the admin pages of the frontend