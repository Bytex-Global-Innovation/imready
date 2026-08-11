'use strict';

const express = require('express');
const adminController = require('@modules/admin/admin.controller');
const { validateBody, loginSchema } = require('@modules/admin/admin.validator');
const { requireAdmin } = require('@modules/auth/admin.guard');
const { loginLimiter } = require('@middleware/rate-limit.middleware');

const router = express.Router();

router.post('/login', loginLimiter, validateBody(loginSchema), adminController.login);
router.post('/logout', adminController.logout);
router.get('/me', requireAdmin, adminController.me);

module.exports = router;
