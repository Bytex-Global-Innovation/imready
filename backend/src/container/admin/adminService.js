'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('@config/config');
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
    config.jwt.secret,
    {
      algorithm: 'HS256',
      expiresIn: config.jwt.expiresIn,
      issuer: config.jwt.issuer,
    },
  );

  return { token };
}

module.exports = { login };
