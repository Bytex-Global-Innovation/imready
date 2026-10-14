'use strict';

require('module-alias/register');
require('dotenv').config();

const app = require('@src/app');
const config = require('@config');
const sequelize = require('@connections/sequelize');
const { ensureAdminFromEnv } = require('@modules/admin/admin.bootstrap');
const { verifyMailConfig } = require('@modules/shared/mail.service');
const {
  purgeExpiredUnverifiedStudents,
} = require('@modules/student/student.service');

async function start() {
  // Validate required secrets early
  void config.jwtSecret;

  await sequelize.authenticate();
  await ensureAdminFromEnv();
  await verifyMailConfig();
  await purgeExpiredUnverifiedStudents();

  // Periodically remove unverified first-time signups after the 1-hour window.
  const purgeTimer = setInterval(() => {
    purgeExpiredUnverifiedStudents().catch((err) => {
      console.error('[students] Failed to purge expired signups:', err.message);
    });
  }, 5 * 60 * 1000);
  if (typeof purgeTimer.unref === 'function') purgeTimer.unref();

  const server = app.listen(config.port, () => {
    console.log(`IMReady API on :${config.port}/api/v1 (${config.nodeEnv})`);
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
