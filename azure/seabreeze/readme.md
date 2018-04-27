# Contents
- **mongo-nanoserver1709.Dockerfile** - Custom Docker build file for MongoDB on Windows Nano Server 1709, taken from [here](https://github.com/StefanScherer/dockerfiles-windows/issues/322#issuecomment-383283780)
- **smilr.json** - Smilr deployment with Linux containers, with images pulled from Dockerhub
- **smilr-win.json** - Smilr deployment with Windows containers 1709, with images pulled from ACR
- **smilr-win-volume.json** - As above but with volume mount on Mongo, which doesn't work so forget about it


# Setup
```
rg="Temp.seabreeze"
loc="eastus"

az group create -g $rg -l $loc
```

# Deploy Seabreeze Template
```
az sbz deployment create --verbose --template-file smilr.json -g $rg
```

# Get Network Info
```
az sbz network show -n smilrNetwork -g $rg -o table
```

# Get Logs for Containers
```
az sbz codepackage logs -g $rg --app-name smilrApp --service-name smilrApiService --replica-name 0 --name smilrApiContainer
az sbz codepackage logs -g $rg --app-name smilrApp --service-name smilrFrontendService --replica-name 0 --name smilrFrontendContainer
```

# Nuke The Lot
```
az group delete -g $rg --no-wait
```
