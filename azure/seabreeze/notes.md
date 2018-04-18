# Setup
```
rg="Temp.seabreeze"
loc="eastus"
az group create -g $rg -l $loc
```

# Deploy Template
```
az sbz deployment create --template-file smilr.json -g $rg
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