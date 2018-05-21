# Azure Templates

These ARM templates allow you to deploy the complete app to Azure.

These templates all use containers, so an Azure Container Registry (ACR) instance populated with the Smilr images is a pre-req before deploying. Please refer to the 
:page_with_curl: **[Containers & Docker Guide](/docs/containers.md)** 
for how to build the images and push to ACR.  

:exclamation::speech_balloon: **Note.** It would not be helpful to deploy Azure Container Registry as part of these templates, as it would simply result in an empty registry

## Template List

### [:hammer: Template 1 - Azure Container Instance](aci-mongo/)

### [:hammer: Template 2 - Azure Container Instance & Cosmos DB](aci-cosmos/)

### [:hammer: Template 3 - Azure Web App for Containers (Linux App Service)](web-app-containers/)