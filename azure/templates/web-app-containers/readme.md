# ARM Template - Web App for Containers
Deploy the app using Azure Web App for Containers (aka App Service Linux) & Cosmos DB

## Deployed Resources
- Microsoft.DocumentDB/databaseAccounts
- Microsoft.Web/serverfarms
- Microsoft.Web/sites

## Parameters
- `frontendAppName`: Web app site name for frontend, must be unique
- `apiAppName`: Web app site name for data-api, must be unique
- `acrName`: Name of your ACR instance
- `acrPassword`: Password for ACR
- `servicePlanSize`: App Service Plan size (SKU), one of [B1, B2, B3, S1, S2, S3]

## Outputs
- `frontendURL`: URL to access frontend
- `apiURL`: URL to access the API
- `cosmosEndpoint`: Endpoint of new Cosmos DB instance
- `cosmosKey`: Key needed to access Cosmos DB
- `initDbCommand`: Helpful to copy and paste to run the initdb script

## Quick Deploy
[![deploy](https://raw.githubusercontent.com/benc-uk/azure-arm/master/etc/azuredeploy.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fbenc-uk%2Fmicroservices-demoapp%2Fmaster%2Fazure%2Ftemplates%2Fweb-app-containers%2Fazuredeploy.json)  

## Notes
After deployment you will need to initialize the database, use the [initdb script](/scripts/initdb/), the `initDbCommand` output can be copy and pasted to help