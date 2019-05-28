#!/bin/bash

if [ $# -eq 0 ]
  then
    echo "Error! Provide 'http' or 'https' to script"
    exit
fi

ingressType=$1

printf "\n### Deploying MongoDB\n"
kubectl apply -f mongodb.yaml

printf "\n### Deploying Data API microservice\n"
kubectl apply -f data-api.yaml

printf "\n### Deploying Frontend microservice\n"
kubectl apply -f frontend.yaml

printf "\n### Deploying $ingressType ingress\n"
kubectl apply -f ingress-$ingressType.yaml

printf "\n"
kubectl get all

fqdn=$(kubectl get ingress/smilr-ingress -o json | jq -r ".spec.rules[0].host")

printf "\n### Checking DNS\n"
nslookup $fqdn
printf "\nApp should be available at $ingressType://$fqdn/ \n\n"
