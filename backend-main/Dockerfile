# ---- Build stage ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# ---- Production stage ----
FROM node:22-alpine

WORKDIR /app

# Patch OS-level packages
RUN apk update && apk upgrade --no-cache

ENV NODE_ENV=production

# Copy only the pruned production node_modules + app code
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app .

# Remove npm/npx CLI and yarn — not needed at runtime, removes the
# brace-expansion / ip-address / tar findings bundled inside npm's own tooling
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm /usr/local/bin/npx \
    /opt/yarn-v*

EXPOSE 5000

CMD ["node", "server.js"]