# Enabling HTTPS with cert-manager
This section briefly describes how to set up HTTPS for Smilr, using cert-manager and certificates issued by Let's Encrypt  
The information and configs are based on information taken from the Azure docs https://docs.microsoft.com/en-us/azure/aks/ingress-tls 

## Important!
Do not skip this part!
- Change the email address in `issuer.yaml`, you can use any valid email address, just not mine!
- Change the DNS names and domains sections of `certs.yaml` to match your domain

## Steps

1. Install cert-manager
```
helm install stable/cert-manager -n certmgr \
  --set ingressShim.defaultIssuerName=letsencrypt-staging \
  --set ingressShim.defaultIssuerKind=ClusterIssuer \
  --set rbac.create=false \
  --set serviceAccount.create=false
```

2. Install the cert issuer  
`kubectl apply -f issuer.yaml`

3. Install cert(s) for Smilr  
`kubectl apply -f certs.yaml`

4. Deploy Smilr using ingress using the configs found in [kubernetes/advanced](../advanced/) and use the `ingress.https.yaml`

5. The certificate might take a little while to validate and be issued the first time

## Notes
The cert-manager can be removed (`helm delete --purge certmgr`) after the cert has been issued and stored in Kubernetes, but you will need to restart it once the cert is up for renewal (90 days)