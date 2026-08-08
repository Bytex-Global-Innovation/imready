'use strict';

const express = require('express');
const studentController = require('@container/student/studentController');
const {
  validateBody,
  signupSchema,
} = require('@container/student/studentValidator');
const { requireAdmin } = require('@middleware/requireAdmin');

const publicRouter = express.Router();
const adminRouter = express.Router();

publicRouter.post('/signup', validateBody(signupSchema), studentController.signup);

adminRouter.use(requireAdmin);
adminRouter.get('/', studentController.listStudents);

module.exports = { publicRouter, adminRouter };
