# Service Fabric Mesh Experiments

- These are templates to deploy Smilr using the "Resource model"
- The 'old' folder contains some older templates tried out with a very early preview of SF Mesh

## smilr-linux.json
Due to limitations in SF Mesh and the lack of layer-7 ingress support at this time, this template requires you to deploy it **twice** so we can get the public IP address of our SF Network assigned to our frontend as an environmental variable 

First deployment make sure the `API_ENDPOINT` has a static value in it. This is how the template is provided with a `_remove_this_` prefix before the `[` which prevents the template from evaluating the expression.  
On second deployment remove the `_remove_this_` part from the value so that it starts `[concat` and the expression will be evaluated 

## smilr-linux-vol.json
> Note: Won't work!

This templates binds a storage volume from an Azure Files share to the Mongo container, to give persistence to the data.  
UPDATE: This will never work as SF Mesh uses Azure files which in turn are SMB based and MongoDB being a database can not run over a file share like SMB, it falls over at start. See issue https://github.com/Azure/service-fabric-mesh-preview/issues/281 