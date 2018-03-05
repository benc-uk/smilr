# Azure Templates

These ARM templates allow you to deploy the complete app to Azure.

Most templates use containers, so a Azure Container Registry instance populated with the Smilr images is a pre-req before deploying. Please refer to [these instructions](/docs/containers.md) for how to deploy ACR, build and push your images to it. 

:exclamation::speech_balloon: **Note.** It would not be helpful to deploy Azure Container Registry as part of these templates, as it would simply result in an empty registry!

## [Template 1 - Azure Container Instance](aci-cosmos/)

## [Template 2 - Azure Web App for Containers (Linux App Service)](web-app-containers/)