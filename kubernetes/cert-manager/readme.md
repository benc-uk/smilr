# Enabling HTTPS with cert-manager
This section briefly describes how to set up HTTPS for Smilr, using cert-manager and certificates issued by Let's Encrypt  
The information and configs are based on information taken from the Azure docs https://docs.microsoft.com/en-us/azure/aks/ingress-tls 

## Important!
Change the email address in the issuer.*.yaml files, you can use any valid email address, just not mine!

## Steps

1. Install cert-manager using Helm
```
helm install stable/cert-manager -n cm --namespace kube-system \
  --set ingressShim.defaultIssuerName=letsencrypt-staging \
  --set ingressShim.defaultIssuerKind=ClusterIssuer \
  --set rbac.create=false \
  --set serviceAccount.create=false
```

2. Install the cert issuers
```
kubectl apply -f issuer.staging.yaml
kubectl apply -f issuer.prod.yaml
```

4. Deploy Smilr using ingress using the configs found in [kubernetes/advanced](../advanced/) and use the `ingress.https.yaml`

5. The certificate might take a little while to validate and be issued the first time

## Notes
We deploy two issuers, one for Let's Encrypt staging and one for production. The rate limits on Let's Encrypt production are **extremely** restrictive, so only switch to the prod issuer when you are happy you won't be making many changes or requests