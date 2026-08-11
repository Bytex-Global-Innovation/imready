'use strict';

const express = require('express');
const assessmentController = require('@modules/assessment/assessment.controller');
const {
  validateBody,
  submitAssessmentSchema,
} = require('@modules/assessment/assessment.validator');
const { requireVerifiedStudent } = require('@modules/auth/student.guard');

const router = express.Router();

router.get('/active', assessmentController.getActiveAssessment);
router.post(
  '/:id/submit',
  requireVerifiedStudent,
  validateBody(submitAssessmentSchema),
  assessmentController.submitAssessment,
);

module.exports = router;
