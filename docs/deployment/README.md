# IMReady deployment documentation

| Document | Purpose |
|----------|---------|
| [codebase-audit.md](./codebase-audit.md) | Repository architecture, env vars, uploads, security |
| [hetzner-deployment.md](./hetzner-deployment.md) | Step-by-step VPS deploy for `imready.in` (shared with ByteX) |
| [deployment-checklist.md](./deployment-checklist.md) | Pre/post deploy checklist |
| [nginx/imready.in.conf](./nginx/imready.in.conf) | Sample Nginx vhosts (add separately; do not edit ByteX) |

**Production Compose file:** `docker-compose.prod.yml` at repo root.

**Validation (local):**

```bash
./scripts/validate-deployment.sh
# or
docker compose -f docker-compose.prod.yml config
```
