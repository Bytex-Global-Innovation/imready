'use strict';

const express = require('express');
const studentController = require('@modules/student/student.controller');
const { requireAdmin } = require('@modules/auth/admin.guard');
const {
  validateBody,
  updateStudentSchema,
} = require('@modules/student/student.validator');

const router = express.Router();

router.use(requireAdmin);
router.get('/', studentController.listStudents);
router.patch(
  '/:id',
  validateBody(updateStudentSchema),
  studentController.updateStudent,
);
router.post('/:id/approve-premium', studentController.approvePremium);
router.post('/:id/undo-premium', studentController.undoPremium);
router.post('/:id/reject-premium', studentController.rejectPremium);

module.exports = router;
