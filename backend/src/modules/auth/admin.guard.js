'use strict';

const jwt = require('jsonwebtoken');
const { readAdminAccessToken } = require('@modules/auth/admin.cookies');

const ADMIN_ISSUER = process.env.JWT_ISSUER || 'imready-admin';

function requireAdmin(req, res, next) {
  const token = readAdminAccessToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized', code: 'NO_ACCESS_TOKEN' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: ADMIN_ISSUER,
    });

    if (!payload || payload.role !== 'admin' || payload.typ !== 'access') {
      return res.status(401).json({ message: 'Unauthorized', code: 'INVALID_ACCESS_TOKEN' });
    }

    req.admin = {
      id: String(payload.id),
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch (err) {
    const code =
      err?.name === 'TokenExpiredError' ? 'ACCESS_TOKEN_EXPIRED' : 'INVALID_ACCESS_TOKEN';
    return res.status(401).json({ message: 'Unauthorized', code });
  }
}

module.exports = { requireAdmin, ADMIN_ISSUER };
