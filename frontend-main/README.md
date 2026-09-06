
# frontend-main

React SPA for the photo library UI — login, upload, browse, delete.

# Stack

React 19, Vite, axios, react-router-dom, react-toastify, Sass. Served in production via Nginx.

# API calls

All requests go to relative paths (/api/auth/..., /api/media/...) — there's no configurable API base URL. In-cluster, Envoy Gateway routes /api to the backend service and / to this app, so both are served from the same origin and no CORS/base-URL config is needed. Running the frontend against a backend on a different origin (e.g. plain local dev without the gateway) needs a Vite dev proxy or a temporary change to the axios calls in src/api/.


## Local development

```bash
npm install
npm run dev    
```
    
## Docker

Multi-stage build: node:22-alpine to build with Vite, then the static dist/ output served by nginx:alpine. Nginx is configured for client-side routing (try_files ... /index.html, see nginx.conf) so React Router routes resolve correctly on refresh. Runs on port 80.

```bash
docker build -t frontend-main .
docker run -p 8080:80 frontend-main:v1
```

## CI

.github/workflows/frontend-ci.yml (triggers on changes under frontend-main/): SonarQube scan + quality gate → Docker build → Trivy image scan (fails on CRITICAL/HIGH) → push to Docker Hub. See the root README's Delivery lifecycle for the full picture.




