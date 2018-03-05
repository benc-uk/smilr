# Azure Templates

These ARM templates allow you to deploy the complete app to Azure.

Most templates use containers, so a Azure Container Registry instance populated with the Smilr images is a pre-req before deploying. Please refer to [these instructions](/docs/containers.md) for how to deploy ACR, build and push your images to it. 

:exclamation::speech_balloon: **Note.** It would not be helpful to deploy Azure Container Registry as part of these templates, as it would simply result in an empty registry!

## Template 1 - Deploy to Azure Container Instance
Deploy the app using Azure Container Instances & Cosmos DB

#### Deployed Resources
- Microsoft.DocumentDB/databaseAccounts
- Microsoft.ContainerInstance/containerGroups

#### Parameters
- `previewLocation`: During preview, only available in these regions: **westeurope**, **westus** & **eastus**
- `acrName`: Name of your ACR instance
- `acrPassword`: Password for ACR

#### Outputs
- `frontendURL`: URL to access frontend
- `apiURL`: URL to access the API
- `cosmosEndpoint`: Endpoint of new Cosmos DB instance
- `cosmosKey`: Key needed to access Cosmos DB

#### Quick Deploy
[![deploy](https://raw.githubusercontent.com/benc-uk/azure-arm/master/etc/azuredeploy.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fbenc-uk%2Fmicroservices-demoapp%2Fmaster%2Fazure%2Ftemplates%2Faci-cosmos%2Fazuredeploy.json)  

#### Notes
After deployment you will need to initialize the database, use the [initdb script](/scripts/initdb/) and pass the template output values `cosmosEndpoint` and `cosmosKey`