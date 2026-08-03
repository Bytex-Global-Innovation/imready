'use strict';

require('module-alias/register');
require('dotenv').config();

const app = require('@src/app');
const sequelize = require('@connections/sequelize');
const { ensureAdminFromEnv } = require('@container/admin/adminBootstrap');

const port = Number(process.env.PORT) || 4000;
const nodeEnv = process.env.NODE_ENV || 'development';

async function start() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.trim().length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters');
  }

  await sequelize.authenticate();
  await ensureAdminFromEnv();

  const server = app.listen(port, () => {
    console.log(`IMReady API on :${port} (${nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} — shutting down`);
    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});

