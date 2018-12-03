printf "\n### Removing MongoDB\n"
kubectl delete -f mongodb.yaml

printf "\n### Removing Data API microservice\n"
kubectl delete -f data-api.yaml

printf "\n### Removing Frontend microservice\n"
kubectl delete -f frontend.yaml

printf "\n### Removing HTTPS ingress\n"
kubectl delete -f ingress-https.yaml

printf "\n"
kubectl get all