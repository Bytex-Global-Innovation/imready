'use strict';

const express = require('express');
const foundationController = require('@modules/foundation/foundation.controller');
const { requireAdmin } = require('@modules/auth/admin.guard');

const router = express.Router();

router.use(requireAdmin);

router.get('/progress', foundationController.listAdminProgress);
router.get('/progress/:studentId', foundationController.getAdminStudentProgress);

module.exports = router;
