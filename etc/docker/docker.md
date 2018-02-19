# Docker Containers

This covers the basic building of the app as Docker images and and pushing into Azure Container Registry.

There are two Docker images; one for the frontend server which serves the Angular app out to users, and another image for the data API service

NOTE. These commands **should be run in PowerShell** rather than WSL bash. It is possible to get the docker command working in WSL with the Docker engine on Windows 10 but that's outside of the scope of this exercise

### Set variables 

Run the following in PowerShell to set names we will be using in the commands.  
Note the ACR name needs to be unique and must not contain dashes or dots
```
$acrName = "smilracr"
$resGroup = "Demo.Smilr"
```

# Create Azure Container Registry
It is assumed you will be placing the app images in Azure Container Registry (ACR) rather than Dockerhub. Create an ACR instance as follows

### Create ACR
```
az acr create -n $acrName -g $resGroup --admin-enabled --sku Standard
```
Then get the password, this will save the password to a variable `acrPwd`
```
az acr credential show -n $acrName -g $resGroup
$acrPwd = az acr credential show -n $acrName -g $resGroup --query "passwords[0].value" -o tsv
```

If you want to get the password 
```
az acr credential show -n $acrName -g $resGroup
```
---

# Building Docker Images

To build the images simply run `docker build`. If you are planning on testing & running in Docker locally rather than in Kubernetes you can tag the images anything you like and omit the ACR prefix. These commands must be run from the root of this project. 

Here we've used `smilr` as the repository in the image tag, but you can pick anything you like.

```
docker build . -f data-api.Dockerfile -t "$acrName.azurecr.io/smilr/data-api"
docker build . -f frontend.Dockerfile -t "$acrName.azurecr.io/smilr/frontend"
```

Assuming you want your images in ACR, you will need to login with the following command. When prompted enter the password you fetched from your ACR instance
```
docker login "$acrName.azurecr.io" -u $acrName -p $acrPwd
```

Then push the images with the following, standard docker push command
```
docker push "$acrName.azurecr.io/microsvc/data-api"
docker push "$acrName.azurecr.io/microsvc/frontend"
```
