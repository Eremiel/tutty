# Deployment of the lab on Google Kubernetes Engine

The lab can be easily deployed on GKE. The main issues are:

- hosting the application container image privately in GKE
- keeping the cost of storage under control

## Container image in GKE

GKE provides a private docker registry that can be used to provision images. 

To compile and push the container use:
```
docker build -t fi-dft-lab -f Dockerfile.deploy .
docker tag fi-dft-lab:latest eu.gcr.io/fi-dft-lab/web:latest
docker push eu.gcr.io/fi-dft-lab/web:latest
```

This assumes that Docker has been configured for usage with `gcloud`. To configure docker with the Google Cloud credentials use:

```
gcloud container clusters get-credentials fi-dft-cluster --zone europe-west2-a
```

## Storage

The application requires two types of storage: 

1) Redis Database storage - ReadWriteOnce (small)
2) Home directory files storage - ReadWriteMany (not too small)

The Redis persistent storage can be easily realised using standard persitentVolumeClaims. Persistence of the home folder is more complicated, because it has to allow access from multiple pods for scalability. Google Cloud provides *Google FileStore* for NFS shares, but this is very expensive (> $200 per month for 1TB - minimum). A dedicated nfs server underpinned by a persistentVolumeClaim with ReadWriteOnce mode is a low-cost simple alternative for small-scale application. This approach has been taken here. This [blog](https://matthewpalmer.net/kubernetes-app-developer/articles/kubernetes-volumes-example-nfs-persistent-volume.html) has a good step-by-step guide for setting this up.

### Deployment

To deploy the storage solution:

- Then create the *NFS* deployment and note the nfs service IP address!
- Then create the *Redis* deployment
- Finally create the *Web* deployment after updating the nfs IP in `web.yaml`

```
kubectl apply -f nfs.yaml
kubectl apply -f redis.yaml
kubeclt apply -f web.yaml
```