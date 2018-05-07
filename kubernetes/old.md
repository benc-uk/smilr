
## Deploy MongoDB
Deploy the MongoDB pod to Kubernetes with the following: 
```
kubectl create -f mongodb.all.yaml
```
This will run as a single pod, and the be exposed only inside the cluster (with ClusterIP), the default hostname to access it from within the cluster is `mongodb-svc`. This is the name of the ClusterIP service we created, as Kubernetes provides internal DNS for all services

> :exclamation::speech_balloon: **Note.** Currently Mongo is configured as a StatefulSet, however it is not replication aware so you can only have a single replica running. This simplifies things significantly for most demos. Replicating Mongo across multiple pods is outside of the scope of this doc.

## Deploy Smilr Microservice - Data API 
Then deploy the data-api containers to Kubernetes with: 
```
kubectl create -f data-api.deploy.yaml
```
Check the pods all start using the dashboard or with `kubectl get pods`  
There should be four pods created and running

Then deploy the data-api loadbalanced public IP and endpoint to Kubernetes with: 
```
kubectl create -f data-api.svc.yaml
```
Check the status with `kubectl get svc`, and wait for the **EXTERNAL-IP** to get assigned to **data-api-endpoint**, this will take about 5-10 minutes so be patient. It is advised in a demo to create this ahead of time and not delete it. 

Make of note of this IP as will need it in the next step


## Deploy Smilr Microservice - Frontend
Edit [**frontend.deploy.yaml**](frontend.deploy.yaml) and change the value of `API_ENDPOINT`. If you used external DNS, then set it to the domain name you configured in **data-api.deploy.yaml**. If not using DNS, then your need the external IP of **data-api-endpoint** you fetched in the previous step, this means you need to wait for that to deploy.

:exclamation::speech_balloon: **Note.** Don't forget the URL scheme and trailing **/api** path, so `API_ENDPOINT` will take the form `http://{dns-or-ip}/api`

Then deploy the frontend containers to Kubernetes with: 
```
kubectl create -f frontend.deploy.yaml
```

Then deploy the frontend loadbalanced public IP and endpoint to Kubernetes with: 
```
kubectl create -f frontend.svc.yaml
```
Again wait for and validate that **frontend-endpoint** has an external IP and or DNS (same process and delay as the **data-api-endpoint**), then access this in your browser :)








- The deployment files are split into separate `.deploy` and `.svc` files. This allows us to modify and deploy them separately. In many cases you might want to re-deploy the pods (in the `.deploy` file) but leave the load-balancer in place (in the `.svc` file).