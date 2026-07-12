'use strict';

require('module-alias/register');

const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('@config/config');

const MIGRATIONS_DIR = __dirname;

async function ensureMigrationsTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name       VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_schema_migrations_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function getApplied(conn) {
  const [rows] = await conn.query(
    'SELECT name FROM schema_migrations ORDER BY name ASC',
  );
  return new Set(rows.map((row) => row.name));
}

async function getMigrationFiles() {
  const entries = await fs.readdir(MIGRATIONS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort();
}

async function seedAdmin(conn) {
  const [rows] = await conn.query(
    'SELECT id FROM admins WHERE email = ? LIMIT 1',
    [config.adminSeed.email],
  );

  if (rows.length > 0) {
    console.log(`Admin seed skipped — ${config.adminSeed.email} already exists.`);
    return;
  }

  await conn.query(
    'INSERT INTO admins (email, password_hash, is_active) VALUES (?, ?, 1)',
    [config.adminSeed.email, config.adminSeed.passwordHash],
  );
  console.log(`Admin seeded: ${config.adminSeed.email}`);
}

async function run() {
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true,
  });

  try {
    await ensureMigrationsTable(conn);
    const applied = await getApplied(conn);
    const files = await getMigrationFiles();
    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
      console.log('No pending migrations.');
    } else {
      for (const file of pending) {
        const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
        await conn.beginTransaction();
        try {
          await conn.query(sql);
          await conn.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
          await conn.commit();
          console.log(`Applied: ${file}`);
        } catch (err) {
          await conn.rollback();
          throw err;
        }
      }
      console.log(`Finished. Applied ${pending.length} migration(s).`);
    }

    await seedAdmin(conn);
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
