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

The frontend is fully self-contained — its own default network, no shared network setup:

```bash
docker compose up --build
```

It sets `VITE_PROXY_TARGET=https://host.docker.internal:4000` so the dev-proxy reaches the backend through the host's published port (an `extra_hosts: host.docker.internal:host-gateway` entry makes this work on Linux too). The only requirement is that the backend is up with port `4000` published — the two services don't share a Docker network. Source is bind-mounted, so Vite HMR works the same as a native run.

### LAN access (reach the app from another machine by IP)

The Vite dev server already listens on `0.0.0.0` (`--host`), so no frontend change
is needed — just open the firewall for port `5173` and browse to
`http://<SERVER_IP>:5173` from the other machine. The backend, however, needs a
few changes for the OAuth flow to work by IP — see **LAN access** in the
[backend README](https://github.com/perezga/footbar-stats-backend#lan-access-reach-the-app-from-another-machine-by-ip).

## Pages

| Route | Page | What it shows |
|---|---|---|
| `/login` | Login | Connect-Footbar sign-in |
| `/` | Profile | Profile summary + headline stats |
| `/sessions` | Sessions | Session history list (with match-type filter) |
| `/sessions/:id` | SessionDetail | Per-session metrics + Leaflet pitch map |
| `/stats` | Stats | Trends and personal records |

## Project structure

```
src/
  main.tsx           App entry
  App.tsx            Router + layout
  pages/             Login, Profile, Sessions, SessionDetail, Stats
  components/        Layout, StatTile, TrendChart, RecordsCard,
                     PaceZones, MatchTypeFilter, SessionMap (Leaflet)
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
