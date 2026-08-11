'use strict';

const rateLimit = require('express-rate-limit');

/**
 * IP-based rate limiting for sensitive auth endpoints (login, signup, password
 * reset, resend-verification). Prevents brute-force / credential-stuffing and
 * email-bombing abuse. Standalone middleware — safe to attach per-route.
 */
function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 20, message } = {}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: message || 'Too many requests. Please try again later.' },
  });
}

// Strict: credential guessing (login).
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

// Moderate: account creation / email-based flows (signup, forgot-password, resend).
const sensitiveActionLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: 'Too many requests. Please try again in 15 minutes.',
});

// Lenient: token refresh is called automatically by the frontend on 401s.
const refreshLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many requests. Please try again later.',
});

module.exports = {
  createRateLimiter,
  loginLimiter,
  sensitiveActionLimiter,
  refreshLimiter,
};
