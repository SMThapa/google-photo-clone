
# Full-stack app delivered via GitOps (Flux + ArgoCD) to AWS EKS

This is a Google Photos–style app: users log in, upload images (stored in S3, metadata in MongoDB), and view/delete their library. The interesting part isn't the app itself — it's the delivery pipeline around it: every push is scanned, built, image-scanned, and shipped to a Kubernetes cluster that bootstraps its own platform layer and reconciles itself continuously.


## Architecture

![App Screenshot](https://github.com/SMThapa/google-photo-clone/blob/master/images/work-flow.png)

## Stack at a glance

| Layer          | 	Tech                                                         |
| ----------------- | ------------------------------------------------------------------ |
| **Frontend:**  | React 19, Vite, Nginx (container) |
| **Backend:**| Node 22, Express 5, Mongoose, JWT auth, prom-client |
| **Database:** | MongoDB 7.0 (StatefulSet, EBS gp3) |
| **Object storage:**  | AWS S3 (presigned uploads) |
| **Infra:** |	Terraform (VPC + EKS modules), AWS EKS 1.35 |
| **Delivery:**| 	GitHub Actions → Docker Hub → FluxCD → ArgoCD |
| **Networking:**| 	Envoy Gateway (Kubernetes Gateway API)|
|**Secrets:**| 	AWS Secrets Manager + Secrets Store CSI Driver + EKS Pod Identity|
|**Observability:**| 	Prometheus, VPA (recommendation + auto modes)|
## Repo layout

```bash
├── backend-main/    # Express API — auth, media upload/list/delete
├── frontend-main/   # React SPA
├── infra-main/      # Terraform: VPC + EKS
├── k8s-main/        # Kustomize manifests (base + dev/prod overlays)
└── .github/workflows/  # CI: SonarQube, Trivy, Docker build/push, Terraform plan/apply
```

Cluster bootstrapping (Flux + the platform-level Helm releases: ArgoCD, Envoy Gateway, Prometheus, VPA, metrics-server, Secrets Store CSI driver) lives in a separate repo: https://github.com/SMThapa/fluxCD.
## Delivery lifecycle

**Application CI (backend-ci.yml, frontend-ci.yml — path-filtered, only the changed app builds)**
- SonarQube static analysis + quality gate
- Docker image build (Buildx, layer caching via GHA cache)
- Trivy image scan — fails the pipeline on CRITICAL/HIGH CVEs
- Image pushed to Docker Hub as :latest and :<short-sha> — only after the scan passes

**Infra CI (terraform-ci.yml)**
- terraform fmt -check + terraform validate
- Trivy IaC scan → SARIF uploaded to the repo's Security tab
- terraform plan, uploaded as a build artifact
- apply / destroy are manual, gated behind workflow_dispatch — never auto-applied on push

**ICluster bootstrap (SMThapa/fluxCD)**
- Flux reconciles the flux-system GitRepository and installs the platform layer as HelmReleases: ArgoCD, Envoy Gateway, metrics-server, VPA, Prometheus, AWS Secrets Manager CSI provider
- Once ArgoCD's CRDs exist (dependsOn: infrastructure), Flux applies an ArgoCD Application pointing at this repo's k8s-main/overlay/prod

**Application delivery (ArgoCD)**
- ArgoCD watches k8s-main/overlay/prod on master with automated: { prune: true, selfHeal: true }
- Any drift between the cluster and the manifests in this repo is corrected automatically; deleted resources are pruned

Net effect: **Flux owns the platform, ArgoCD owns the app** — a push to master in either this repo or the fluxCD repo eventually reflects in the running cluster with no manual kubectl apply.


