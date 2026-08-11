'use strict';

const express = require('express');
const assessmentController = require('@modules/assessment/assessment.controller');
const {
  validateBody,
  createQuestionSchema,
  createAssessmentSchema,
  bulkDeleteResultsSchema,
  personalScoreSchema,
} = require('@modules/assessment/assessment.validator');
const { requireAdmin } = require('@modules/auth/admin.guard');
const { uploadExcel } = require('@middleware/upload-excel.middleware');

const router = express.Router();

router.use(requireAdmin);

router.get('/questions', assessmentController.listQuestions);
router.post(
  '/questions',
  validateBody(createQuestionSchema),
  assessmentController.createQuestion,
);

router.get('/results', assessmentController.listResults);
router.get('/results/export', assessmentController.exportResults);
router.post(
  '/results/bulk-delete',
  validateBody(bulkDeleteResultsSchema),
  assessmentController.bulkDeleteResults,
);
router.get('/results/:submissionId', assessmentController.getResult);
router.delete('/results/:submissionId', assessmentController.deleteResult);
router.patch(
  '/results/:submissionId/answers/:answerId',
  validateBody(personalScoreSchema),
  assessmentController.setPersonalScore,
);
router.post(
  '/results/:submissionId/full-evaluate',
  assessmentController.fullEvaluate,
);

router.get('/bulk/sample', assessmentController.downloadBulkSample);
router.post(
  '/bulk/upload',
  uploadExcel('file'),
  assessmentController.bulkUpload,
);

router.get('/', assessmentController.listAssessments);
router.post(
  '/',
  validateBody(createAssessmentSchema),
  assessmentController.createAssessment,
);
router.put(
  '/:id',
  validateBody(createAssessmentSchema),
  assessmentController.updateAssessment,
);
router.get('/:id', assessmentController.getAssessment);
router.delete('/:id', assessmentController.deleteAssessment);

module.exports = router;
