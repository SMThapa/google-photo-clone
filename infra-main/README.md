
# Infra
Terraform for the VPC and EKS cluster this app runs on, plus the IAM roles/policies used for EKS Pod Identity.

# What this provisions
- VPC (terraform-aws-modules/vpc/aws ~> 5.0) — 10.0.0.0/16, 2 AZs (us-east-1a/us-east-1b), public + private subnets, single NAT gateway per AZ (single_nat_gateway = false), subnet tags for K8s internal/external load balancer discovery.
- EKS cluster (terraform-aws-modules/eks/aws ~> 20.0) — version 1.35, one managed node group (m7i-flex.large, 2–4 nodes), public API endpoint, cluster secrets encryption via a dedicated KMS key.
    - **Add ons:** coredns, kube-proxy, vpc-cni, aws-ebs-csi-driver, eks-pod-identity-agent
- **IAM for Pod Identity** (s3.tf, secret-manager.tf) — two scoped roles, each trusted only by pods.eks.amazonaws.com and bound to a specific namespace + service account via aws_eks_pod_identity_association:
    - mongo-backup-role → read/write on the Mongo backup S3 bucket, bound to mongo-backup-sa
    - mongodb-secrets-role → read on the google-photo-secrets Secrets Manager secret, bound to mongodb-secrets-sa

State is stored remotely in S3 (sidilian-s3-terraform-statefile-all, key google-photo-clone/terraform.tfstate) with native S3 locking (use_lockfile = true, requires Terraform ≥ 1.10).

# Prerequisites
- Terraform ≥ 1.10.5
- AWS credentials with permission to create VPC/EKS/IAM resources
- An existing S3 bucket for state (see providers.tf) and the two S3 buckets referenced in s3.tf/secret-manager.tf (Mongo backups, Secrets Manager secret) already created

# Usage
```bash
cd infra-main
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```
To tear down:
```bash
terraform destroy
```

# CI
.github/workflows/terraform-ci.yml runs on any push touching infra-main/**:
- terraform fmt -check -recursive + terraform validate
- Trivy IaC scan (results uploaded to the repo's Security tab as SARIF; currently non-blocking — exit-code: '0')
- terraform plan, uploaded as a workflow artifact
- apply and destroy only run via manual workflow_dispatch with an explicit action input, never automatically on push.