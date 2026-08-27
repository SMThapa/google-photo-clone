FROM node:22-alpine

WORKDIR /app

# Patch known OS-level vulnerabilities, upgrade npm's bundled CLI,
# and install production dependencies — all in one layer
ARG CACHEBUST=1
COPY package*.json ./
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache --upgrade libcrypto3 libssl3 && \
    npm install -g npm@latest && \
    npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["npm", "start"]