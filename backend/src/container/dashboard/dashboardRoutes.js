'use strict';

const express = require('express');
const { requireAdmin } = require('@middleware/requireAdmin');
const projectController = require('@container/project/projectController');

const router = express.Router();
router.use(requireAdmin);
router.get('/summary', projectController.getDashboardSummary);

module.exports = router;
