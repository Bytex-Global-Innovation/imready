'use strict';

const ACCESS_COOKIE = 'imready_student_access';
const REFRESH_COOKIE = 'imready_student_refresh';

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes
const REMEMBER_REFRESH_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

function setAuthCookies(res, { accessToken, refreshToken, rememberMe, refreshExpiresAt }) {
  const base = baseCookieOptions();

  res.cookie(ACCESS_COOKIE, accessToken, {
    ...base,
    maxAge: ACCESS_MAX_AGE_MS,
  });

  const refreshOptions = { ...base };
  if (rememberMe) {
    const remainingMs = refreshExpiresAt
      ? Math.max(0, new Date(refreshExpiresAt).getTime() - Date.now())
      : REMEMBER_REFRESH_MS;
    refreshOptions.maxAge = remainingMs;
  }
  // Without rememberMe: session cookie (cleared when the browser closes).
  res.cookie(REFRESH_COOKIE, refreshToken, refreshOptions);
}

function clearAuthCookies(res) {
  const base = baseCookieOptions();
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, base);
}

function readAccessToken(req) {
  const fromCookie = req.cookies?.[ACCESS_COOKIE];
  if (fromCookie) return String(fromCookie);

  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

function readRefreshToken(req) {
  const fromCookie = req.cookies?.[REFRESH_COOKIE];
  return fromCookie ? String(fromCookie) : null;
}

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_MAX_AGE_MS,
  REMEMBER_REFRESH_MS,
  setAuthCookies,
  clearAuthCookies,
  readAccessToken,
  readRefreshToken,
};
