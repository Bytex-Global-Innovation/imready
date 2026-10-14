# syntax=docker/dockerfile:1.7

# ---------------------------------------------------------------------------
# base: shared settings for every stage below
# NOTE: NODE_ENV is intentionally NOT set here — `npm ci` honors NODE_ENV
# and would silently skip devDependencies (breaking the deps-full/migrator
# stage below) if it were set to "production" at this shared layer.
# ---------------------------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /app

# ---------------------------------------------------------------------------
# deps: production-only dependencies, cached independently from source code
# so `npm ci` only re-runs when package*.json actually change.
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------------------------------------------------------------------------
# deps-full: adds devDependencies (sequelize-cli) — only used by the
# `migrator` stage so the runtime image can stay slim.
# ---------------------------------------------------------------------------
FROM base AS deps-full
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# runner: the image that actually serves API traffic
# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production

# --chown sets ownership as part of the copy itself (fast, single pass)
# instead of a separate recursive `chown -R`, which is very slow over a
# large node_modules tree.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

# Ensure the upload directories exist and are writable by the non-root user
# even before the named volume is mounted over /app/uploads.
RUN mkdir -p uploads/projects/images uploads/projects/resources \
    && chown -R node:node uploads

USER node

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=5 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4000/api/v1/health || exit 1

CMD ["node", "src/server.js"]

# ---------------------------------------------------------------------------
# migrator: one-off image for running Sequelize migrations
# (docker compose --profile tools run --rm migrate)
# ---------------------------------------------------------------------------
FROM base AS migrator

COPY --from=deps-full /app/node_modules ./node_modules
COPY . .
USER node

# Invoke the locally installed binary directly — `npx sequelize-cli` would
# otherwise re-resolve/download the package from the registry on every run.
ENTRYPOINT ["node_modules/.bin/sequelize-cli"]
CMD ["db:migrate"]
