#
# This builds the two Docker images and pushes them to ACR
#

# Change this to the name of your Azure container registry
$azureContainerReg = "bcdemo"

iex "docker build .. -f ../Dockerfile.data-api -t $azureContainerReg.azurecr.io/microsvc/data-api"
iex "docker build .. -f ../Dockerfile.frontend -t $azureContainerReg.azurecr.io/microsvc/frontend"

#iex "az acr login -n $azureContainerReg -u $azureContainerReg"

iex "docker push $azureContainerReg.azurecr.io/microsvc/data-api"
iex "docker push $azureContainerReg.azurecr.io/microsvc/frontend"