# Dev image for the frontend.
FROM node:22-bookworm-slim

WORKDIR /app

# Install from manifests only so this layer caches until deps change.
# Source arrives via bind mount at runtime.
COPY package.json package-lock.json ./
RUN npm ci

EXPOSE 5173
# --host makes Vite listen on 0.0.0.0 so the port is reachable from the host.
CMD ["npm", "run", "dev", "--", "--host"]
