'use strict';

const express = require('express');
const studentController = require('@modules/student/student.controller');
const { requireAdmin } = require('@modules/auth/admin.guard');

const router = express.Router();

router.use(requireAdmin);
router.get('/', studentController.listStudents);

module.exports = router;
