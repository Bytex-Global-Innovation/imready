'use strict';

const jwt = require('jsonwebtoken');
const adminService = require('@modules/admin/admin.service');
const {
  setAdminAccessCookie,
  clearAdminAccessCookie,
  readAdminAccessToken,
  ACCESS_MAX_AGE_MS,
} = require('@modules/auth/admin.cookies');
const { ADMIN_ISSUER } = require('@modules/auth/admin.guard');

async function login(req, res, next) {
  try {
    const session = await adminService.login(req.body.email, req.body.password);
    setAdminAccessCookie(res, session.accessToken);
    return res.status(200).json({
      expiresAt: session.expiresAt,
      expiresIn: session.expiresIn,
      admin: session.admin,
    });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const result = await adminService.getMe(req.admin.id);
    let expiresAt = new Date(Date.now() + ACCESS_MAX_AGE_MS).toISOString();
    const token = readAdminAccessToken(req);
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, {
          algorithms: ['HS256'],
          issuer: ADMIN_ISSUER,
        });
        if (payload?.exp) {
          expiresAt = new Date(payload.exp * 1000).toISOString();
        }
      } catch {
        // ignore — requireAdmin already validated
      }
    }
    return res.status(200).json({ ...result, expiresAt });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    clearAdminAccessCookie(res);
    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    clearAdminAccessCookie(res);
    return next(err);
  }
}

module.exports = { login, me, logout };
