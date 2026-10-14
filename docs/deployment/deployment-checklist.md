# IMReady — Hetzner deployment safety checklist

Use this before and after deploying IMReady on the shared VPS (`65.108.57.156`) alongside ByteX (`bytex.global`).

## Pre-deployment (read-only on server)

- [ ] Existing ByteX deployment identified (`docker ps`, note container names and ports)
- [ ] Current Docker services and networks documented (`docker network ls`)
- [ ] Existing Nginx (or other) reverse proxy configuration understood (`nginx -t`, list `sites-enabled` — **do not edit ByteX files yet**)
- [ ] Available server resources checked (`free -h`, `df -h`, `docker stats` if running)
- [ ] Ports `13000`, `13001`, `14000` free on localhost (`ss -tlnp`)
- [ ] Port `3306` not required on host for IMReady (MySQL stays internal)

## Project configuration

- [ ] Deploy directory chosen (e.g. `/opt/imready`) — separate from ByteX
- [ ] New project uses Compose project name `imready` (`docker-compose.prod.yml`)
- [ ] New containers do not use ByteX network or volumes
- [ ] Separate MySQL database and credentials configured (`DB_NAME`, `DB_USER`, `DB_PASSWORD`)
- [ ] `MYSQL_ROOT_PASSWORD` unique to IMReady
- [ ] Persistent PDF/uploads path configured (`IMREADY_UPLOADS_DIR=/srv/imready/uploads`)
- [ ] MySQL data path configured (`IMREADY_MYSQL_DATA_DIR=/srv/imready/mysql`)
- [ ] Existing upload compatibility checked (paths under `/app/uploads` in container)
- [ ] Production `.env` created from `.env.example` (not committed)
- [ ] `JWT_SECRET` ≥ 32 chars, unique to IMReady
- [ ] `CORS_ORIGINS` includes `https://imready.in` and `https://admin.imready.in`
- [ ] `FRONTEND_URL=https://imready.in`
- [ ] `NEXT_PUBLIC_API_BASE_URL=https://api.imready.in/api/v1` (rebuild frontend + admin after change)
- [ ] AWS SES (or SMTP) configured for verification emails
- [ ] Secrets excluded from Git and Docker images

## DNS and TLS

- [ ] DNS A records: `imready.in`, `admin.imready.in`, `api.imready.in` → VPS IP
- [ ] New Nginx vhost file added (see `docs/deployment/nginx/imready.in.conf`)
- [ ] `nginx -t` passes **before** `systemctl reload nginx`
- [ ] HTTPS certificates issued (Certbot) for IMReady domains only
- [ ] ByteX vhosts unchanged and still serving `bytex.global`

## Deploy execution

- [ ] Migrations run explicitly (`docker compose -f docker-compose.prod.yml --profile tools run --rm migrate`)
- [ ] Stack started with **only** `docker-compose.prod.yml` in IMReady directory
- [ ] No `docker compose down` run in ByteX directory
- [ ] No `docker system prune --volumes`

## Verification

- [ ] `curl -sf http://127.0.0.1:14000/api/v1/health` returns `success: true`
- [ ] Student site loads at `https://imready.in`
- [ ] Admin loads at `https://admin.imready.in`
- [ ] API reachable at `https://api.imready.in/api/v1/...`
- [ ] Student signup / verification email (or SES sandbox test)
- [ ] Foundation evidence upload + admin preview/download
- [ ] Database backup procedure tested once
- [ ] Uploads directory backup documented

## Post-deploy

- [ ] Rollback procedure documented and understood
- [ ] ByteX remains operational (`bytex.global` smoke test)
- [ ] Resource usage acceptable (`docker stats`, disk space)
