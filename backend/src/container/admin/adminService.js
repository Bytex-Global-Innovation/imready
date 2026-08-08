'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('@container/admin/adminModel');

function unauthorized() {
  const err = new Error('Invalid email or password');
  err.statusCode = 401;
  return err;
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

  const token = jwt.sign(
    { id: String(admin.id), email: admin.email, role: 'admin' },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      issuer: process.env.JWT_ISSUER || 'imready-admin',
    },
  );

  return { token };
}

module.exports = { login };
