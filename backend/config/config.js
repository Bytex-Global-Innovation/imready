'use strict';

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

function required(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

const NODE_ENV = process.env.NODE_ENV || 'development';

const config = {
  nodeEnv: NODE_ENV,
  isProd: NODE_ENV === 'production',
  port: Number(process.env.PORT) || 4000,

  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    issuer: process.env.JWT_ISSUER || 'imready-admin',
  },

  adminSeed: {
    email: required('ADMIN_EMAIL').toLowerCase(),
    passwordHash: required('ADMIN_PASSWORD_HASH'),
  },

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    username: required('DB_USER'),
    password: process.env.DB_PASSWORD || '',
    database: required('DB_NAME'),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  },
};

if (config.jwt.secret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

module.exports = config;
