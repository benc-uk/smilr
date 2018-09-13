printf "\n### Removing MongoDB\n"
kubectl delete -f mongodb.all.yaml

printf "\n### Removing Data API microservice\n"
kubectl delete -f data-api.deploy.yaml
kubectl delete -f data-api.svc.yaml

printf "\n### Removing Frontend microservice\n"
kubectl delete -f frontend.deploy.yaml
kubectl delete -f frontend.svc.yaml

printf "\n### Removing HTTPS ingress\n"
kubectl delete -f ingress.https.yaml

printf "\n"
kubectl get all