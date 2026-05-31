# Dev image for the frontend workspace.
# Build context is the repo root (workspace deps are hoisted there).
FROM node:22-bookworm-slim

WORKDIR /app

# Install the whole workspace from manifests only; cached until a manifest or
# the lockfile changes. Source arrives via bind mount at runtime.
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm install

EXPOSE 5173
# --host makes Vite listen on 0.0.0.0 so the port is reachable from the host.
CMD ["npm", "run", "dev", "-w", "frontend", "--", "--host"]
