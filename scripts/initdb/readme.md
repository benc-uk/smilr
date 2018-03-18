# InitDB Script

> # TODO - !!! UPDATE FOR MONGO CHANGES !!!

In order to create the Cosmos DB database (**smilrDb**) and the collection (**alldata**) this helper script is provided. This is a Node.js script, and takes two positional parameters, the Cosmos endpoint and the Cosmos key, example to run this script:
```
node initdb.js https://foo.documents.azure.com 1234567890BLAHBLAH
```
It will create the database **smilrDb** if it doesn't exist, and the partitioned collection **alldata**. It will then populate the database with the demo data held in [seed-data.json](scripts/initdb/seed-data.json). You can modify this starting data as you wish, or remove to start with an empty database

### Environment Variables Config
The script also supports the use of environment variables for config rather than passing paramters on the command line. Exactly same variables as the data-api (`COSMOS_ENDPOINT` & `COSMOS_KEY`) are used. These can be set as normal from the OS or also set in a special `.env` config file, exactly the same as the data-api. This file doesn't exist and will need to be created in your initdb/ directory, e.g.

**.env**
```
COSMOS_ENDPOINT=https://localhost:8081
COSMOS_KEY=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
```

# Running InitDB when using Kubernetes

When running Smilr in Kubernetes we don't expose MongoDB externally outside the cluster as it is only accessed from pods in the cluster (the data-api). In order to run the initdb script against MongoDB you will need to use a forwarded port. This creates a tunnel into the cluster between localhost and a port on a pod

Run the following two commands, then run the script against localhost e.g. `node initdb.js mongodb://localhost`. 

> :exclamation::speech_balloon: **Tip:** The `kubectl port-forward` command will not exit, it will stay running to keep the tunnel open, so it is best to run this in another terminal or window

```
mongopodname=`kubectl get pods -l app=mongodb-replicaset -o jsonpath='{.items[0].metadata.name}'`
kubectl port-forward $mongopodname 27017:27017 
```
