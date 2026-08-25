data "aws_s3_bucket" "mongo_backup" {
  bucket = "sidilian-google-photo-mongo-backup"
}

resource "aws_iam_role" "mongo_backup_role" {
  name = "mongo-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "pods.eks.amazonaws.com" }
      Action    = ["sts:AssumeRole", "sts:TagSession"] # <-- two actions required
    }]
  })
}
resource "aws_iam_policy" "mongo_backup_policy" {
  name = "mongo-backup-s3-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ]
      Resource = [
        data.aws_s3_bucket.mongo_backup.arn,
        "${data.aws_s3_bucket.mongo_backup.arn}/*"
      ]
    }]
  })
}
resource "aws_iam_role_policy_attachment" "mongo_backup" {
  role       = aws_iam_role.mongo_backup_role.name
  policy_arn = aws_iam_policy.mongo_backup_policy.arn
}
resource "aws_eks_pod_identity_association" "mongo_backup" {
  cluster_name    = module.eks.cluster_name
  namespace       = "siddharth"
  service_account = "mongo-backup-sa"
  role_arn        = aws_iam_role.mongo_backup_role.arn
}

