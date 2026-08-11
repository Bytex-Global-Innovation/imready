'use strict';

const express = require('express');
const studentController = require('@modules/student/student.controller');
const {
  validateBody,
  signupSchema,
  loginSchema,
  emailOnlySchema,
  verifyEmailSchema,
  resetPasswordSchema,
} = require('@modules/student/student.validator');
const { requireVerifiedStudent } = require('@modules/auth/student.guard');
const {
  loginLimiter,
  sensitiveActionLimiter,
  refreshLimiter,
} = require('@middleware/rate-limit.middleware');

const router = express.Router();

router.post('/signup', sensitiveActionLimiter, validateBody(signupSchema), studentController.signup);
router.post('/login', loginLimiter, validateBody(loginSchema), studentController.login);
router.post(
  '/verify-email',
  validateBody(verifyEmailSchema),
  studentController.verifyEmail,
);
router.get('/verify-email', studentController.verifyEmail);
router.post('/refresh', refreshLimiter, studentController.refresh);
router.post('/logout', studentController.logout);
router.post(
  '/resend-verification',
  sensitiveActionLimiter,
  validateBody(emailOnlySchema),
  studentController.resendVerification,
);
router.post(
  '/forgot-password',
  sensitiveActionLimiter,
  validateBody(emailOnlySchema),
  studentController.forgotPassword,
);
router.post(
  '/reset-password',
  sensitiveActionLimiter,
  validateBody(resetPasswordSchema),
  studentController.resetPassword,
);
router.get('/me', requireVerifiedStudent, studentController.me);

module.exports = router;
