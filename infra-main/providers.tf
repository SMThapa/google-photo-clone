terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket  = "sidilian-s3-terraform-statefile"
    key     = "google-photo-clone/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true

    # Modern native S3 locking (Terraform 1.10+)
    use_lockfile = true
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}
