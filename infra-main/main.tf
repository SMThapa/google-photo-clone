module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "my-vpc"
  cidr = "10.0.0.0/16"

  #eks requires atleast 2 az's
  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  # private subnets gets outbound access to the internet 
  enable_nat_gateway = true

  # uses single nat instead of one per private_subnet
  single_nat_gateway = false

  enable_vpn_gateway = false

  # each private_subnet gets this tag, which helps kubernetes to look
  # and attach the internal load balancer  
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }
  # each public_subnets gets this tag, which helps kubernetes to look 
  # and attach the internet facing load balancer
  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }

  tags = {
    Terraform   = "true"
    Environment = "dev"
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "my-cluster"
  cluster_version = "1.35"

  cluster_addons = {
    coredns                = {}                        # each service and pod gets dns name
    eks-pod-identity-agent = { before_compute = true } # handles pod-level AWS IAM auth (newer alternative to IRSA)
    kube-proxy             = {}                        # maintains iptables/ipvs rules so Services route traffic to the right Pods
    vpc-cni                = { before_compute = true } # assigns real VPC IPs to Pods so they're directly routable within the VPC
    aws-ebs-csi-driver     = {}                        # provisions EBS volumes and attaches them to the node when a PVC is created
  }

  # meaning the Kubernetes API is reachable from 0.0.0.0/0 
  cluster_endpoint_public_access           = true
  enable_cluster_creator_admin_permissions = true

  create_kms_key = true # is required when using cluster_encryption_config
  # encrypts the secrets file
  cluster_encryption_config = {
    resources = ["secrets"]
  }

  #This allows you to use IAM Roles for Service Accounts (IRSA), granting specific AWS IAM permissions directly to your Kubernetes pods.
  # enable_irsa = true
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    worker_node = {
      ami_type       = "AL2023_x86_64_STANDARD"
      instance_types = ["m5.xlarge"]

      min_size     = 1
      max_size     = 4
      desired_size = 1

      # allows EBS CSI driver to make AWS API calls
      iam_role_additional_policies = {
        AmazonEBSCSIDriverPolicy = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
      }

    }
  }

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}