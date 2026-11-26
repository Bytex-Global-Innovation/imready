'use strict';

const express = require('express');
const landingController = require('@modules/landing/landing.controller');
const { requireAdmin } = require('@modules/auth/admin.guard');

const router = express.Router();

router.use(requireAdmin);
router.get('/clients', landingController.listShareProblems);
router.get('/clients/:id', landingController.getShareProblem);

module.exports = router;
