# IMReady — Codebase Deployment Audit

**Date:** 2026-03-12  
**Target domain:** `imready.in`  
**Shared VPS:** Hetzner `65.108.57.156` (co-hosted with `bytex.global` — must not be modified by this project’s automation)

This document is based on inspection of the repository at audit time. Server-side ByteX configuration was **not** inspected from this environment; items marked **VERIFY ON SERVER** require read-only checks on the VPS before binding ports or editing Nginx.

---

## 1. Architecture summary

IMReady is a **multi-service monorepo**:

| Service | Stack | Role |
|--------|--------|------|
| `frontend/` | Next.js 16 (App Router), React 19, Tailwind 4 | Student-facing web app |
| `admin/` | Next.js 16 (App Router) | Admin dashboard |
| `backend/` | Node.js 20, Express 5, Sequelize 6 | REST API under `/api/v1` |
| `mysql` | MySQL 8.0 (Docker) | Application database |

**Not** a single Next.js full-stack app: all business logic and auth live in the Express backend. Both Next apps are static/SSR clients that call the API with cookies (`credentials: "include"`).

Compose project name in repo: **`imready`** (`docker-compose.yml`).

---

## 2. Application entry points

| Component | Entry | Production command |
|-----------|--------|-------------------|
| Backend | `backend/src/server.js` | `node src/server.js` (port `PORT`, default 4000) |
| Frontend | Next standalone `server.js` | `node server.js` (port 3000 in container) |
| Admin | Next standalone `server.js` | `node server.js` (port 3000 in container) |
| Migrations | Sequelize CLI | `docker compose --profile tools run --rm migrate` |

**Health:** `GET /api/v1/health` on backend (service probes + full API catalog with response times). Next apps use HTTP GET on `/` for Docker `HEALTHCHECK`.

**Graceful shutdown:** `server.js` handles `SIGINT` / `SIGTERM` (closes HTTP server and Sequelize).

**Migrations on startup:** **No** — migrations are explicit via the `migrate` service profile only.

---

## 3. Required environment variables (names only)

### Root / Docker Compose (`.env` at repo root for compose)

- `FRONTEND_PORT`, `ADMIN_PORT`, `BACKEND_PORT`, `DB_PORT` (dev compose only; prod should avoid publishing MySQL)
- `IMREADY_FRONTEND_PORT`, `IMREADY_ADMIN_PORT`, `IMREADY_BACKEND_PORT` (production compose — localhost bind)
- `IMREADY_UPLOADS_DIR`, `IMREADY_MYSQL_DATA_DIR` (optional host paths for bind mounts)
- `MYSQL_ROOT_PASSWORD`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_CONNECTION_LIMIT`
- `NODE_ENV`, `PORT` (backend internal)
- `CORS_ORIGINS`, `FRONTEND_URL`
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_ISSUER`, `JWT_STUDENT_ISSUER`, `JWT_STUDENT_ACCESS_EXPIRES_IN`, `JWT_ADMIN_ACCESS_EXPIRES_IN`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `MAIL_PROVIDER`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SES_FROM`, `MAIL_FROM`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (if `MAIL_PROVIDER=smtp`)
- `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_USE_MOCK`
- `NEXT_PUBLIC_PREMIUM_AMOUNT`, `NEXT_PUBLIC_PREMIUM_UPI_ID`, `NEXT_PUBLIC_PREMIUM_PAYEE_NAME` (frontend build-time)

Backend-only when running without compose file merging: `DB_HOST`, `DB_PORT`.

---

## 4. Database and migration strategy

- **ORM:** Sequelize (`backend/src/connections/sequelize.js`).
- **Migrations:** `backend/migrations/*.js` (17 files at audit time).
- **Config:** `backend/config/config.js` (uses `DB_*` env vars).
- **Bootstrap:** Admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on backend start (`admin.bootstrap.js`).

**Production rules:**

1. Dedicated database name and user for IMReady only (e.g. `imready` / `imready_app`) — never ByteX credentials.
2. Run migrations once per release:  
   `docker compose -f docker-compose.prod.yml --profile tools run --rm migrate`
3. Do not expose MySQL port `3306` on the host in production compose.
4. Persist MySQL data via named volume or host bind under `/srv/imready/mysql` (see `docker-compose.prod.yml`).

---

## 5. PDF / document evidence — upload and retrieval

### Student upload flow

1. Student (verified) `POST /api/v1/foundation/missions/:missionId/evidence` (`multipart/form-data`, field `evidence`).
2. Middleware: `backend/src/middleware/upload-foundation-evidence.middleware.js`
   - Allowed: `.pdf`, `.doc`, `.docx`; max 10 MB.
   - Storage: `uploads/foundation-evidence/<timestamp>-<random>.<ext>` under process cwd.
3. Service stores metadata in `foundation_mission_records.evidence_file_path` (e.g. `/uploads/foundation-evidence/...`).

### Persistence in Docker

- Dev compose: named volume `backend-uploads` → `/app/uploads`.
- Prod compose: bind mount `${IMREADY_UPLOADS_DIR}` → `/app/uploads` (recommended: `/srv/imready/uploads` on VPS).

### Retrieval

- Backend serves files at **`GET /uploads/...`** via `express.static` (`app.js`) — **not** under Next.js `public/`.
- Admin preview/download resolves URLs with `resolveMediaUrl()` → API origin + `filePath`.
- **Authorization:** Upload routes require `requireVerifiedStudent`. **Static `/uploads` has no per-file auth** — access control is URL secrecy + CORS; treat as a known security consideration (see §7).

### Other uploads

- Project assets: `uploads/projects/`
- Premium payment screenshots: `uploads/premium-payments/`

Same volume mount covers all backend uploads.

---

## 6. Build and startup requirements

- **Node:** 20 (Dockerfiles use `node:20-alpine`).
- **Package manager:** npm (`package-lock.json` in each app).
- **Next.js:** `output: "standalone"` in `frontend/next.config.ts` and `admin/next.config.ts`; Docker copies `.next/standalone` + static assets.
- **Build args (must be set at image build):** `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_USE_MOCK` (admin).
- **Backend image:** multi-stage; non-root `node` user; includes `wget` for healthcheck (Alpine).

**Build memory:** Next.js production builds are the heaviest step; prefer building on CI or a machine with ≥4 GB RAM, not necessarily on a small VPS during peak traffic.

---

## 7. Security concerns

| Area | Finding |
|------|---------|
| Secrets in git | `.env` is gitignored; ensure no secrets in history (separate remediation if leaked). |
| Public `/uploads` | Evidence and screenshots are served without session checks; mitigate with nginx rules or signed URLs in a future hardening pass. |
| CORS | Allowlist via `CORS_ORIGINS`; must include production student + admin origins. |
| Cookies | `secure` in production (`NODE_ENV=production`). |
| Rate limiting | Present on auth routes (`rate-limit.middleware.js`). |
| MySQL exposure | Dev compose publishes `DB_PORT`; prod compose must not. |
| Helmet | Enabled; CSP disabled; `frameguard` false (admin PDF preview). |
| File upload | Extension/MIME checks; random filenames; path stored as DB-relative URL. |

---

## 8. Existing deployment-related files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Local / full-stack dev (published ports, named volumes) |
| `docker-compose.prod.yml` | Production-oriented (localhost ports, bind mounts) |
| `backend/Dockerfile`, `frontend/Dockerfile`, `admin/Dockerfile` | Multi-stage production images |
| `backend/.dockerignore`, `frontend/.dockerignore`, `admin/.dockerignore` | Exclude `.env`, `uploads`, `node_modules` |
| `.env.example` | Compose + backend env template |
| `docs/deployment/hetzner-deployment.md` | Operator runbook |
| `docs/deployment/deployment-checklist.md` | Pre/post deploy checklist |
| `docs/deployment/nginx/` | Sample vhosts for `imready.in` |

---

## 9. Identified blockers / risks

1. **Port collision on VPS** — Default dev ports 3000/3001/4000/3306 may already be used by ByteX or others. **VERIFY ON SERVER** before deploy; prod compose defaults to `127.0.0.1:13000`, `13001`, `14000`.
2. **Nginx / Certbot layout unknown** — Sample configs provided; must be included without editing ByteX vhosts.
3. **`NEXT_PUBLIC_API_BASE_URL`** must be built into frontend/admin images (e.g. `https://api.imready.in/api/v1`).
4. **DNS** — `imready.in`, `admin.imready.in`, `api.imready.in` (recommended) must point to VPS before TLS.
5. **Next.js `images.remotePatterns`** — Production API host for `/uploads/**` should be allowed (see `frontend/next.config.ts` update for `api.imready.in`).
6. **SES** — Email verification requires verified `SES_FROM` and IAM credentials in production `.env`.

---

## 10. Assumptions requiring verification

- [ ] ByteX uses Docker and which compose project name / networks (**VERIFY ON SERVER**: `docker ps`, `docker network ls`).
- [ ] Host Nginx is the edge proxy on ports 80/443 (**VERIFY ON SERVER**: `ss -tlnp`, `nginx -t`).
- [ ] Free disk/RAM for an extra MySQL + 3 Node containers (**VERIFY ON SERVER**: `df -h`, `free -h`, `docker stats`).
- [ ] Ports `13000`, `13001`, `14000` are free on localhost (**VERIFY ON SERVER**: `ss -tlnp | grep -E '13000|13001|14000'`).
- [ ] Whether admin should live on subdomain `admin.imready.in` vs path-based routing (this plan uses **subdomains**).

---

## Suggested production URL layout

| URL | Upstream |
|-----|----------|
| `https://imready.in` | `http://127.0.0.1:13000` (frontend) |
| `https://admin.imready.in` | `http://127.0.0.1:13001` (admin) |
| `https://api.imready.in` | `http://127.0.0.1:14000` (backend API + `/uploads`) |

ByteX `bytex.global` remains unchanged on its existing vhost(s).
