printf "\n### Deploying MongoDB\n"
kubectl apply -f mongodb.yaml

printf "\n### Deploying Data API microservice\n"
kubectl apply -f data-api.yaml

printf "\n### Deploying Frontend microservice\n"
kubectl apply -f frontend.yaml

printf "\n### Deploying HTTPS ingress\n"
kubectl apply -f ingress-https.yaml

printf "\n"
kubectl get all

printf "\n### Checking DNS\n"
nslookup smilr.7e28d40aaab5415089e6.northeurope.aksapp.io
