# ARM Template - Azure Container Instance 
Deploy the app using Azure Container Instances & Cosmos DB

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
- `cosmosEndpoint`: Endpoint of new Cosmos DB instance
- `cosmosKey`: Key needed to access Cosmos DB
- `initDbCommand`: Helpful to copy and paste to run the initdb script

## Quick Deploy
[![deploy](https://raw.githubusercontent.com/benc-uk/azure-arm/master/etc/azuredeploy.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fbenc-uk%2Fmicroservices-demoapp%2Fmaster%2Fazure%2Ftemplates%2Faci-cosmos%2Fazuredeploy.json)  

## Notes
After deployment you will need to initialize the database, use the [initdb script](/scripts/initdb/), the `initDbCommand` output can be copy and pasted to help