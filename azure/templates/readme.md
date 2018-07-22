# Azure Templates

These ARM templates allow you to deploy the complete app to Azure.

These templates all use containers, so an Azure Container Registry (ACR) instance populated with the Smilr images is a pre-req before deploying. Please refer to the 
:page_with_curl: **[Containers & Docker Guide](../../docs/containers.md)** 
for how to build the images and push to ACR.  

:exclamation::speech_balloon: **Note.** It would not be helpful to deploy Azure Container Registry as part of these templates, as it would simply result in an empty registry

## Template List
A range of templates are provided covering several scenarios 

#### [:hammer: Azure Container Instance with MongoDB Container](aci-mongo/)

#### [:hammer: Azure Container Instance with Cosmos DB](aci-cosmos/)  

#### :hammer: Azure Web App for Containers with MongoDB Container
(Note. Requires creating!) 

#### [:hammer: Azure Web App for Containers with Cosmos DB](web-app-containers/)

#### :hammer: Azure Web App (Windows) with Cosmos DB
(Note. Requires creating!) 