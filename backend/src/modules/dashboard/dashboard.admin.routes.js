'use strict';

const express = require('express');
const { requireAdmin } = require('@modules/auth/admin.guard');
const projectController = require('@modules/project/project.controller');

const router = express.Router();
router.use(requireAdmin);
router.get('/summary', projectController.getDashboardSummary);

module.exports = router;
