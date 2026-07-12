'use strict';

require('module-alias/register');

const app = require('@src/app');
const config = require('@config/config');
const sequelize = require('@connections/sequelize');

async function start() {
  await sequelize.authenticate();

  const server = app.listen(config.port, () => {
    console.log(`IMReady API on :${config.port} (${config.nodeEnv})`);
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
