'use strict';

const express = require('express');
const assessmentController = require('@container/assessment/assessmentController');
const {
  validateBody,
  createQuestionSchema,
  createAssessmentSchema,
  submitAssessmentSchema,
  personalScoreSchema,
  bulkDeleteResultsSchema,
} = require('@container/assessment/assessmentValidator');
const { requireAdmin } = require('@middleware/requireAdmin');
const { uploadExcel } = require('@middleware/uploadExcel');

const adminRouter = express.Router();
const publicRouter = express.Router();

adminRouter.use(requireAdmin);

adminRouter.get('/questions', assessmentController.listQuestions);
adminRouter.post(
  '/questions',
  validateBody(createQuestionSchema),
  assessmentController.createQuestion,
);

adminRouter.get('/results', assessmentController.listResults);
adminRouter.get('/results/export', assessmentController.exportResults);
adminRouter.post(
  '/results/bulk-delete',
  validateBody(bulkDeleteResultsSchema),
  assessmentController.bulkDeleteResults,
);
adminRouter.get('/results/:submissionId', assessmentController.getResult);
adminRouter.delete('/results/:submissionId', assessmentController.deleteResult);
adminRouter.patch(
  '/results/:submissionId/answers/:answerId',
  validateBody(personalScoreSchema),
  assessmentController.setPersonalScore,
);
adminRouter.post(
  '/results/:submissionId/full-evaluate',
  assessmentController.fullEvaluate,
);

adminRouter.get('/bulk/sample', assessmentController.downloadBulkSample);
adminRouter.post(
  '/bulk/upload',
  uploadExcel('file'),
  assessmentController.bulkUpload,
);

adminRouter.get('/', assessmentController.listAssessments);
adminRouter.post(
  '/',
  validateBody(createAssessmentSchema),
  assessmentController.createAssessment,
);
adminRouter.put(
  '/:id',
  validateBody(createAssessmentSchema),
  assessmentController.updateAssessment,
);
adminRouter.get('/:id', assessmentController.getAssessment);
adminRouter.delete('/:id', assessmentController.deleteAssessment);

publicRouter.get('/active', assessmentController.getActiveAssessment);
publicRouter.post(
  '/:id/submit',
  validateBody(submitAssessmentSchema),
  assessmentController.submitAssessment,
);

module.exports = { adminRouter, publicRouter };
