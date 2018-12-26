# Azure Templates

### :warning: Templates need validating against new Vue.js version

These ARM templates allow you to deploy the complete app to Azure, all deployment scenarios are container based

## Template List
A range of templates are provided covering several scenarios 

#### [:hammer: Quick Start with Azure Container Instance](aci-quickstart/) (Note. ACR not required)

The rest of the templates all use Azure Container Registry (ACR) instance populated with the Smilr images is a pre-req before deploying. Please refer to the 
:page_with_curl: **[Containers & Docker Guide](../../docs/containers.md)** 
for how to build the images and push to ACR.  

:speech_balloon: **Note.** It would not be helpful to deploy Azure Container Registry as part of these templates, as it would simply result in an empty registry

#### [:hammer: Azure Container Instance with MongoDB Container](aci-mongo/)

#### [:hammer: Azure Container Instance with Cosmos DB](aci-cosmos/)  

#### [:hammer: Azure Web App for Containers with Cosmos DB](web-app-containers/)
