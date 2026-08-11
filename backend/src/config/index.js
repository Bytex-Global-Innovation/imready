'use strict';

function requiredEnv(name, { minLength } = {}) {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`${name} must be set`);
  }
  if (minLength && value.length < minLength) {
    throw new Error(`${name} must be at least ${minLength} characters`);
  }
  return value;
}

const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  get jwtSecret() {
    return requiredEnv('JWT_SECRET', { minLength: 32 });
  },
};

module.exports = config;
