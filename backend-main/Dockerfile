FROM node:22-alpine

WORKDIR /app

# Patch known OS-level vulnerabilities (libssl3/libcrypto3, etc.)
# Cache-busting arg forces this to actually re-run and fetch fresh
# package data instead of reusing a stale cached layer
ARG CACHEBUST=1
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache --upgrade libcrypto3 libssl3

# Upgrade npm's own bundled CLI to pull in patched versions of its
# internal dependencies (tar, sigstore, brace-expansion, etc.)
RUN npm install -g npm@latest

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["npm", "start"]