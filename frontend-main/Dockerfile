# # Build stage
# FROM node:22-alpine AS builder

# WORKDIR /app

# # Install dependencies
# COPY package*.json ./
# RUN npm ci

# # Copy source code
# COPY . .

# # Build application
# RUN npm run build

# # Production stage
# FROM nginx:alpine

# # Patch known OS vulnerabilities in the base image
# RUN apk update && apk upgrade --no-cache

# # Copy built files
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Copy custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Expose nginx port
# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Cache-busting arg forces apk update/upgrade to re-run on every build,
# instead of reusing a stale cached layer with outdated package data
ARG CACHEBUST=1

# Patch known OS vulnerabilities in the base image, and explicitly
# upgrade the packages flagged by CVE-2026-14456
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache --upgrade libcrypto3 libssl3

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]