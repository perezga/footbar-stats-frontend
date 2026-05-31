# Footbar Stats — Frontend

Web UI for [Footbar Stats](https://github.com/perezga/footbar-stats-backend), a personal app for viewing your stats from the [Footbar API](https://developers.footbar.com/docs/reference/). It renders your profile, session history, per-session detail (including a pitch map), and trends/records.

**Stack:** [Vite](https://vite.dev/) · React 18 · TypeScript · [Tailwind CSS](https://tailwindcss.com/) · [TanStack Query](https://tanstack.com/query) · [Recharts](https://recharts.org/) · [Leaflet](https://leafletjs.com/)

---

## Prerequisites

- Node 22+
- The [backend](https://github.com/perezga/footbar-stats-backend) running on `https://localhost:4000`

## Setup

```bash
npm install
npm run dev
```

The dev server starts on <http://localhost:5173>.

### How it talks to the backend

The Vite dev server proxies API calls to the backend so the browser only ever talks to one origin (avoiding CORS and keeping the session cookie first-party):

- `/api/*` and `/auth/*` → proxied to the backend
- Target defaults to `https://localhost:4000`, overridable via the `VITE_PROXY_TARGET` env var (used in Docker to point at the `backend` container)

The backend uses a self-signed cert in dev, so the proxy is configured with `secure: false`. Make sure the backend is running before you sign in.

### First run

Open <http://localhost:5173>, click **Connect Footbar**, grant consent, and you're in.

## Run with Docker

The frontend and backend each have their own compose file and communicate over a shared external network:

```bash
docker network create footbar-net   # once, shared with the backend
docker compose up --build
```

This sets `VITE_PROXY_TARGET=https://backend:4000` so the dev-proxy reaches the backend container by its network alias. The backend must be up on the same `footbar-net` network. Source is bind-mounted, so Vite HMR works the same as a native run.

## Pages

| Route | Page | What it shows |
|---|---|---|
| `/` | Dashboard | Profile summary + headline stats |
| `/sessions` | Sessions | Your session history list |
| `/sessions/:id` | Session detail | Per-session metrics + Leaflet pitch map |
| `/settings` | Settings | Account / data controls |

## Project structure

```
src/
  main.tsx           App entry
  App.tsx            Router + layout
  pages/             Dashboard, Sessions, SessionDetail, Settings
  components/        Shared UI
  api/
    client.ts        fetch wrapper (credentials: 'include')
    hooks.ts         TanStack Query hooks
    types.ts         API response types
  lib/units.ts       Unit formatting helpers
  index.css          Tailwind entry
index.html
vite.config.ts       Dev server + proxy config
tailwind.config.ts
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server (HMR) |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Type-check without emitting |
