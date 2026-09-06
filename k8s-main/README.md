# k8s
Kustomize manifests for the app. base/ defines the shared resources; overlay/dev and overlay/prod layer environment-specific pieces on top.

# Structure

```bash
base/
├── namespace.yaml        # `siddharth` namespace
├── limitrange.yaml       # default/min/max CPU, memory, PVC size for the namespace
├── configmap.yaml        # non-secret backend config (AWS_REGION, S3_BUCKET_NAME)
├── gateway.yaml          # Envoy GatewayClass + Gateway + HTTPRoute (/api → backend, / → frontend)
├── backend/              # Deployment + Service + HPA (CPU/memory, 1-5 replicas)
├── frontend/             # Deployment + Service + HPA
└── database/             # MongoDB StatefulSet + Service + VerticalPodAutoscaler

overlay/
├── dev/          # base + a local secrets.yaml (not committed)
└── prod/         # base + CronJob, ServiceAccount, EBS StorageClass, SecretProviderClass + a patch pinning the Mongo PVC's storageClassName to ebs-gp3
```

# What each overlay adds
dev — the minimal path: base resources plus your own secrets.yaml (gitignored — see below). No backup job, no EBS-specific storage class; suitable for kind/minikube or a scratch cluster.

prod — what's actually running on EKS:
- EBSstorageClass.yaml — ebs-gp3 StorageClass (WaitForFirstConsumer, Retain)
- secretProvider.yaml — SecretProviderClass pulling google-photo-secrets from AWS Secrets Manager via Pod Identity, synced into a native google-photo-secrets Kubernetes Secret
- serviceAccount.yaml — service accounts referenced by the Pod Identity associations in infra-main
- cronJob.yaml — daily (02:00) MongoDB backup to S3, using mongo-backup-sa
                
# Prerequisites
Before applying, the cluster needs (see SMThapa/fluxCD for a working bootstrap of all of these):
- Envoy Gateway controller + the Gateway API CRDs
- AWS EBS CSI driver (installed as an EKS add-on in infra-main)
-  Secrets Store CSI driver + the AWS provider for it
- The IAM roles/Pod Identity associations from infra-main already applied
- VPA CRDs/controller if you want the database VPA to do anything

# Usage
**Dev:**
```bash
# create overlay/dev/secrets.yaml first — a plain Kubernetes Secret manifest
# with MONGO_URI, mongo-root-username, mongo-root-password, etc.
kubectl apply -k k8s-main/overlay/dev
```
**Prod:**
```bash
kubectl apply -k k8s-main/overlay/prod
```

In practice, overlay/prod isn't applied manually — ArgoCD watches this path directly (see the root README's Delivery lifecycle) and reconciles it continuously with selfHeal and prune enabled.
