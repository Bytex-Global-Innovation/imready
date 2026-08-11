'use strict';

const ACCESS_COOKIE = 'imready_admin_access';
const ACCESS_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes — admin auto-logout

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
  };
}

function setAdminAccessCookie(res, accessToken) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions(),
    maxAge: ACCESS_MAX_AGE_MS,
  });
}

function clearAdminAccessCookie(res) {
  res.clearCookie(ACCESS_COOKIE, baseCookieOptions());
}

function readAdminAccessToken(req) {
  const fromCookie = req.cookies?.[ACCESS_COOKIE];
  if (fromCookie) return String(fromCookie);

  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

module.exports = {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE_MS,
  setAdminAccessCookie,
  clearAdminAccessCookie,
  readAdminAccessToken,
};
