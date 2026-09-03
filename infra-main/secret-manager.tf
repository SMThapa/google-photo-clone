# --- IAM Policy ---
resource "aws_iam_policy" "mongodb_secrets_access" {
  name        = "mongodb-secrets-access"
  description = "Allows reading the google-photo-secrets secret from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "VisualEditor0"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        # wildcard suffix since Secrets Manager appends a random 6-char suffix to the ARN
        Resource = "arn:aws:secretsmanager:us-east-1:359013545510:secret:google-photo-secrets*"
      }
    ]
  })
}

# --- IAM Role (trusted by EKS Pod Identity, not IRSA/OIDC) ---
resource "aws_iam_role" "mongodb_secrets_role" {
  name = "eks-mongodb-secrets-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "pods.eks.amazonaws.com"
        }
        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
      }
    ]
  })
}

# --- Attach policy to role ---
resource "aws_iam_role_policy_attachment" "mongodb_secrets_attach" {
  role       = aws_iam_role.mongodb_secrets_role.name
  policy_arn = aws_iam_policy.mongodb_secrets_access.arn
}

# --- Pod Identity Association: links the role to a specific K8s ServiceAccount ---
resource "aws_eks_pod_identity_association" "mongodb_secrets" {
  cluster_name    = module.eks.cluster_name
  namespace       = "siddharth"
  service_account = "mongodb-secrets-sa"
  role_arn        = aws_iam_role.mongodb_secrets_role.arn
}