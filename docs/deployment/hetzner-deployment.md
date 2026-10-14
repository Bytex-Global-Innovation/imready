# IMReady — Hetzner VPS deployment (shared with ByteX)

Deploy **IMReady** on the existing Hetzner VPS (`65.108.57.156`) alongside **ByteX** (`bytex.global`) without stopping or reconfiguring ByteX.

**Domains:** `imready.in`, `admin.imready.in`, `api.imready.in`

This guide does **not** execute production commands automatically. Run each step deliberately on the server.

---

## 1. Prerequisites

- SSH access to the VPS
- Git clone of IMReady in a **dedicated directory** (example: `/opt/imready`)
- Docker and Docker Compose v2 installed (likely already present for ByteX)
- Nginx + Certbot on the host (VERIFY — adjust if the server uses another proxy)
- DNS control for `imready.in`
- AWS SES verified sender (or SMTP fallback)

---

## 2. Audit summary

See [codebase-audit.md](./codebase-audit.md) for full detail.

- **Stack:** Next.js student app + Next.js admin + Express API + MySQL 8
- **Compose project:** `imready`
- **Prod file:** `docker-compose.prod.yml` (localhost-only ports, no public MySQL)

---

## 3. Safe inspection on the VPS (read-only)

Run these **before** choosing ports or editing Nginx. They do not modify ByteX.

```bash
# What is listening on the host?
sudo ss -tlnp

# Docker containers (note ByteX names — do not stop them)
docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'

# Networks
docker network ls

# Disk and memory
df -h
free -h
```

Confirm **13000**, **13001**, and **14000** are free on `127.0.0.1`. If not, set `IMREADY_*_PORT` in `.env` to unused ports and update Nginx upstreams accordingly.

---

## 4. Directory layout on the server

```bash
sudo mkdir -p /opt/imready
sudo mkdir -p /srv/imready/uploads/foundation-evidence
sudo mkdir -p /srv/imready/mysql
sudo chown -R "$USER":"$USER" /opt/imready /srv/imready
```

Recommended ownership for uploads (backend runs as UID `node` in container, typically **1000**):

```bash
sudo chown -R 1000:1000 /srv/imready/uploads
```

**Targets:** IMReady only — not ByteX paths.

---

## 5. Clone and configure environment

```bash
cd /opt/imready
git clone <your-repo-url> .
cp .env.example .env
```

Edit `.env` for production (placeholders — generate real secrets locally):

| Variable | Production example |
|----------|-------------------|
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | `https://imready.in,https://admin.imready.in` |
| `FRONTEND_URL` | `https://imready.in` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.imready.in/api/v1` |
| `IMREADY_FRONTEND_PORT` | `13000` |
| `IMREADY_ADMIN_PORT` | `13001` |
| `IMREADY_BACKEND_PORT` | `14000` |
| `IMREADY_UPLOADS_DIR` | `/srv/imready/uploads` |
| `IMREADY_MYSQL_DATA_DIR` | `/srv/imready/mysql` |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Unique IMReady values |
| `JWT_SECRET` | New random string ≥ 32 characters |
| `MAIL_PROVIDER` | `ses` |
| `AWS_REGION`, `SES_FROM`, IAM keys | Per AWS SES setup |

Do **not** copy ByteX database credentials or JWT secrets.

Generate a JWT secret (example):

```bash
openssl rand -hex 32
```

---

## 6. DNS

Create **A records** pointing to `65.108.57.156`:

- `imready.in` (and optionally `www.imready.in`)
- `admin.imready.in`
- `api.imready.in`

Wait for propagation before Certbot (`dig +short imready.in`).

---

## 7. Validate Compose locally on the server

```bash
cd /opt/imready
docker compose -f docker-compose.prod.yml config
```

Fix any errors before building.

**Build note:** `docker compose ... build` is CPU/RAM intensive. Prefer off-peak hours or build on CI and pull images if you adopt a registry later.

```bash
docker compose -f docker-compose.prod.yml build
```

This builds **only** the `imready` project when run from `/opt/imready`.

---

## 8. Start database and run migrations

Start MySQL first (optional pattern):

```bash
docker compose -f docker-compose.prod.yml up -d mysql
docker compose -f docker-compose.prod.yml ps
```

Run migrations **once** (explicit, not on every replica):

```bash
docker compose -f docker-compose.prod.yml --profile tools run --rm migrate
```

---

## 9. Start the full stack

```bash
docker compose -f docker-compose.prod.yml up -d
```

**Safe:** targets only compose file `docker-compose.prod.yml` in the current directory.

**Unsafe (never run from wrong directory):** `docker compose down` without `-f` and without confirming project name.

Check health:

```bash
curl -sS http://127.0.0.1:14000/api/v1/health
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:13000/
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:13001/
```

---

## 10. Nginx reverse proxy

1. Copy `docs/deployment/nginx/imready.in.conf` to the server (e.g. `/etc/nginx/sites-available/imready.in.conf`).
2. Adjust upstream ports if you changed `IMREADY_*_PORT`.
3. Test configuration:

```bash
sudo nginx -t
```

4. Enable site (Debian/Ubuntu example):

```bash
sudo ln -s /etc/nginx/sites-available/imready.in.conf /etc/nginx/sites-enabled/
sudo nginx -t
```

5. **Reload only after `nginx -t` succeeds:**

```bash
sudo systemctl reload nginx
```

Do **not** remove or overwrite ByteX vhost files.

---

## 11. HTTPS (Certbot)

After HTTP vhosts work and DNS resolves:

```bash
sudo certbot --nginx -d imready.in -d www.imready.in -d admin.imready.in -d api.imready.in
```

Certbot modifies **IMReady** server blocks; verify ByteX still has valid certificates for `bytex.global`.

---

## 12. Smoke tests

- Open `https://imready.in` — student app
- Open `https://admin.imready.in` — admin login
- Sign up / verify email (SES)
- Upload foundation evidence (PDF) as student
- Admin → Foundation Progress → view/download evidence
- Confirm `https://bytex.global` still works

---

## 13. Logs and troubleshooting

```bash
cd /opt/imready
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml ps
```

| Symptom | Check |
|---------|--------|
| 502 from Nginx | Upstream ports, `docker compose ps`, health |
| CORS errors | `CORS_ORIGINS` matches browser origin |
| Cookies not set | HTTPS, `NODE_ENV=production`, API on `api.imready.in` |
| Upload fails | `client_max_body_size` on API vhost, disk space on `/srv/imready/uploads` |
| Email fails | SES identity, sandbox recipients, `MAIL_PROVIDER` |

---

## 14. Backups

### MySQL

```bash
docker compose -f docker-compose.prod.yml exec mysql \
  mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" "${DB_NAME}" \
  > imready-db-$(date +%F).sql
```

Store dumps off-server. Test restore on a non-production instance before relying on backups.

### Uploads (PDF evidence)

```bash
sudo tar -czf imready-uploads-$(date +%F).tar.gz -C /srv/imready uploads
```

---

## 15. Rollback (IMReady only)

1. Stop IMReady stack **using the prod compose file only:**

```bash
cd /opt/imready
docker compose -f docker-compose.prod.yml stop
```

2. Remove Nginx site symlink for IMReady (optional, to take domains offline):

```bash
sudo rm /etc/nginx/sites-enabled/imready.in.conf
sudo nginx -t && sudo systemctl reload nginx
```

3. **Do not** delete `/srv/imready/uploads` or `/srv/imready/mysql` unless intentionally decommissioning.

4. To return to a previous release: `git checkout <tag>`, rebuild, `up -d`, re-run migrations if needed.

ByteX is unaffected if you never ran compose commands in its directory.

---

## 16. Resource monitoring

```bash
docker stats --no-stream
df -h /srv/imready
```

Signs of insufficient capacity: OOM kills, swap thrashing, MySQL restarts, slow Next builds. Mitigate by building images elsewhere or reducing concurrent services — **do not** stop ByteX without owner approval.

---

## 17. Steps requiring approval / possible impact

| Action | Risk |
|--------|------|
| `systemctl reload nginx` | Low if `nginx -t` passes and only IMReady vhosts added |
| Certbot on shared Nginx | Low if domains are distinct; verify ByteX certs after |
| Binding host ports | None public if using `127.0.0.1` in prod compose |
| Publishing MySQL `3306` | **Avoid** — conflicts and security risk |
| `docker compose down -v` on IMReady | **Destructive** — deletes named data if volumes removed |

---

## 18. Verify ByteX unaffected

After IMReady deploy:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://bytex.global
docker ps | grep -i bytex   # expect ByteX containers still Up
```

No changes should be required in ByteX’s compose project or `.env`.
