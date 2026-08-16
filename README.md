# IMReady

Full-stack platform with three services:

| Service    | Path        | Stack                                   | Default port |
|------------|-------------|------------------------------------------|---------------|
| `backend`  | `./backend`  | Express 5 + Sequelize + MySQL           | 4000          |
| `admin`    | `./admin`    | Next.js 16 (App Router, TypeScript)     | 3001 (host) → 3000 (container) |
| `frontend` | `./frontend` | Next.js 16 (App Router, TypeScript)     | 3000          |

## Running everything with Docker

This repo ships an optimized, production-style Docker setup: multi-stage
builds, small Alpine runtime images, non-root users, layer caching, health
checks, and a persistent MySQL + uploads volume.

### 1. Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin) — Compose v2 syntax.

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at least `MYSQL_ROOT_PASSWORD`, `DB_PASSWORD`, `JWT_SECRET`
(32+ chars), and `ADMIN_PASSWORD`. Leave `NEXT_PUBLIC_API_BASE_URL` as
`http://localhost:4000/api/v1` for local use, or point it at your public API
URL for a real deployment.

> **Important:** `NEXT_PUBLIC_*` variables are baked into the `admin`/`frontend`
> JavaScript bundles at **build time**. If you change them, rebuild those
> images: `docker compose build admin frontend`.

### 3. Build and start

```bash
docker compose up -d --build
```

This starts, in order:

1. `mysql` — MySQL 8, data persisted in the `mysql-data` volume, waits until
   healthy before...
2. `backend` — Express API on `http://localhost:4000` (uploads persisted in
   the `backend-uploads` volume).
3. `admin` — on `http://localhost:3001`.
4. `frontend` — on `http://localhost:3000`.

### 4. Run database migrations

The migration runner is a separate, on-demand profile so it never restarts
in a loop or ships inside the API image:

```bash
docker compose --profile tools run --rm migrate
```

To undo the latest migration:

```bash
docker compose --profile tools run --rm migrate db:migrate:undo
```

### 5. Useful commands

```bash
docker compose ps                 # status of all services
docker compose logs -f backend    # tail backend logs
docker compose exec backend sh    # shell into the API container
docker compose down               # stop and remove containers (keeps volumes)
docker compose down -v            # also wipe the MySQL data + uploads volumes
```

### Rebuilding after code changes

```bash
docker compose up -d --build backend   # rebuild + restart just one service
```

## Architecture notes

- **Next.js apps** use `output: "standalone"` (see `admin/next.config.ts` and
  `frontend/next.config.ts`) so the runtime image only contains the traced
  `.next/standalone` output plus static assets — no `node_modules`, no
  source, no package manager.
- **Backend** uses a 4-stage Dockerfile: a `deps` stage installs
  production-only dependencies, a `deps-full` stage adds `sequelize-cli` for
  the `migrator` target, and the `runner` target (default) stays slim and
  runs as the non-root `node` user.
- All images run as non-root users and expose a `HEALTHCHECK`.
- `backend-uploads` and `mysql-data` are named Docker volumes so data
  survives `docker compose down` (but not `docker compose down -v`).

## Running services individually (without Docker)

Each app can still be run the normal Node.js way — see `backend/.env.example`,
`admin/.env.example`, and `frontend/.env.example` for the local (non-Docker)
environment variables, and run `npm install && npm run dev` inside each
folder.
