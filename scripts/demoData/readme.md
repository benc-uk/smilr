# Demo Data Script

This helper script loads the database with some sample demo data. The data loaded is held in [`source-data.json`](source-data.json) which can be modified as you wish.

## Running
Make sure you are working from the **scripts/demoData** and simply run:
```
node demoData.js
```
The default is to connect to the MonogDB running at localhost, to connect to a different server, pass in the connection string as the first parameter, e.g.
```
node demoData.js mongodb://user:pass@mongohost:port
``` 

By default the load process will not drop the collections and leave existing data, however passing a `1` as a second parameter will cause the script to drop the `events` and `feedback` collections, e.g. 
```
node demoData.js mongodb://localhost 1
```

## Environment Variables

The script also supports the use of environment variables for config rather than passing parameters on the command line, and will also pick up a `.env` file if present. The supported variables are:
 - `MONGO_CONNSTR` - Set to a valid MongoDB connection string, if omitted then **mongodb://localhost** is used
 - `WIPE_DB` - Set to `1` if you want to remove existing data, default is 0 (keep data)


# Running demoData when using Kubernetes

When running Smilr in Kubernetes we don't expose MongoDB externally outside the cluster as it is only accessed from pods in the cluster (i.e. only the data-api). In order to run the demoData script against MongoDB you will need to use a forwarded port. This creates a TCP tunnel into the cluster between localhost and a listening port on one of the pods

Run the following two commands, then run the script against localhost e.g. `node demoData.js mongodb://localhost`. 

```
podname=`kubectl get pods -l app=mongodb-replicaset -o jsonpath='{.items[0].metadata.name}'`

kubectl port-forward $podname 27017:27017 
```

> :exclamation::speech_balloon: **Tip:** The `kubectl port-forward` command will not exit, it will stay running to keep the tunnel open, so it is best to run this in another terminal or window
