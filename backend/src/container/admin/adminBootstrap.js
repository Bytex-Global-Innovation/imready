'use strict';

const bcrypt = require('bcryptjs');
const Admin = require('@container/admin/adminModel');

/**
 * Ensures a single active admin exists, using credentials from .env.
 * Updates password hash when ADMIN_PASSWORD changes.
 */
async function ensureAdminFromEnv() {
  const email = String(process.env.ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  if (String(password).length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  }

  const passwordHash = await bcrypt.hash(String(password), 12);
  const existing = await Admin.findOne({ where: { email } });

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.isActive = true;
    await existing.save();
    return existing;
  }

  // Prefer a single bootstrap admin: update the first row if email changed in .env.
  const first = await Admin.findOne({ order: [['id', 'ASC']] });
  if (first) {
    first.email = email;
    first.passwordHash = passwordHash;
    first.isActive = true;
    await first.save();
    return first;
  }

  return Admin.create({
    email,
    passwordHash,
    isActive: true,
  });
}

module.exports = { ensureAdminFromEnv };
