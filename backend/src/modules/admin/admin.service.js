'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('@modules/admin/admin.model');
const { ACCESS_MAX_AGE_MS } = require('@modules/auth/admin.cookies');

const ADMIN_ISSUER = process.env.JWT_ISSUER || 'imready-admin';

function unauthorized() {
  const err = new Error('Invalid email or password');
  err.statusCode = 401;
  return err;
}

function accessExpiresIn() {
  return process.env.JWT_ADMIN_ACCESS_EXPIRES_IN || '15m';
}

function signAccessToken(admin) {
  return jwt.sign(
    {
      id: String(admin.id),
      email: admin.email,
      role: 'admin',
      typ: 'access',
    },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: accessExpiresIn(),
      issuer: ADMIN_ISSUER,
    },
  );
}

async function login(email, password) {
  const admin = await Admin.findOne({
    where: { email: String(email).trim().toLowerCase() },
  });

  if (!admin || !admin.isActive) {
    throw unauthorized();
  }

  const passwordOk = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordOk) {
    throw unauthorized();
  }

  const accessToken = signAccessToken(admin);
  const expiresAt = new Date(Date.now() + ACCESS_MAX_AGE_MS).toISOString();

  return {
    accessToken,
    expiresAt,
    expiresIn: Math.floor(ACCESS_MAX_AGE_MS / 1000),
    admin: {
      id: String(admin.id),
      email: admin.email,
    },
  };
}

async function getMe(adminId) {
  const admin = await Admin.findByPk(adminId);
  if (!admin || !admin.isActive) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }

  return {
    admin: {
      id: String(admin.id),
      email: admin.email,
    },
  };
}

module.exports = { login, getMe, ACCESS_MAX_AGE_MS };
