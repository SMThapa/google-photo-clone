
# backend-main
Express API for auth and media storage. Images go to S3; metadata goes to MongoDB.

# Stack
Node 22, Express 5, Mongoose, bcryptjs, jsonwebtoken, multer, @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner, prom-client (Prometheus metrics).

# API

| Method | Route              | Description                          |
|--------|--------------------|--------------------------------------|
| POST   | `/api/login`       | Authenticate, returns a JWT          |
| POST   | `/api/media/upload`| Multipart upload, up to 50 images per request |
| GET    | `/api/media`       | List all media                       |
| GET    | `/api/media/:id`   | Get a single media item              |
| DELETE | `/api/media`       | Delete media                         |


# Environment variables
| Variable	| Purpose |
|------------| ---------------|
|AWS_REGION	|AWS region for S3|
|S3_BUCKET_NAME	|Bucket for uploaded media|
|MONGO_URI	|MongoDB connection string|
|AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY|	S3 credentials (local dev only — in-cluster this is handled by EKS Pod Identity instead, see ../infra-main)|

In-cluster, these are injected from a ConfigMap (AWS_REGION, S3_BUCKET_NAME) and a Secret synced from AWS Secrets Manager (everything else) — see ../k8s-main/base/backend/deployment.yaml.

# Local development
```bash
npm install
npm run dev   # node --watch server.js
```
Requires a .env (or exported env vars) with the variables above, and a reachable MongoDB instance.

# Docker
Multi-stage build (node:22-alpine), production dependencies only (npm ci --omit=dev), OS packages patched at build time, npm/npx/yarn stripped from the final image. Runs on port 5000.
```bash
docker build -t backend-main .
docker run -p 5000:5000 --env-file .env backend-main:v1
```

# CI
.github/workflows/backend-ci.yml (triggers on changes under backend-main/): SonarQube scan + quality gate → Docker build → Trivy image scan (fails on CRITICAL/HIGH) → push to Docker Hub. See the root README's Delivery lifecycle for the full picture.

# Metrics
metrics.js exposes Prometheus metrics via prom-client, scraped by the in-cluster Prometheus instance (bootstrapped in https://github.com/SMThapa/fluxCD).