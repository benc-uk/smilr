# Enabling HTTPS with cert-manager

## Important!
Do not skip this part!
- Change the email address in `issuer.yaml`
- Change the DNS names and domains sections of `certs.yaml`

## Steps

1. Install cert-manager
```
helm install stable/cert-manager -n certmgr \
  --set ingressShim.defaultIssuerName=letsencrypt-staging \
  --set ingressShim.defaultIssuerKind=ClusterIssuer \
  --set rbac.create=false \
  --set serviceAccount.create=false
```

2. Install Issuer  
`kubectl apply -f issuer.yaml`

3. Install cert(s) for Smilr  
`kubectl apply -f certs.yaml`

4. Deploy Smilr using ingress using the configs found in [kubernetes/advanced](../advanced/) and use the `ingress.https.yaml`

## Notes
The cert-manager can be removed (`helm delete --purge certmgr`) after the cert has been issued and stored in Kubernetes, but you will need to restart it once the cert is up for renewal (90 days)