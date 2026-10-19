'use strict';

const express = require('express');
const foundationController = require('@modules/foundation/foundation.controller');
const {
  validateBody,
  problemStatementSchema,
  updateProblemStatementSchema,
  missionConfigSchema,
} = require('@modules/foundation/foundation.validator');
const { requireAdmin } = require('@modules/auth/admin.guard');

const router = express.Router();

router.use(requireAdmin);

router.get('/progress', foundationController.listAdminProgress);
router.get('/progress/:studentId', foundationController.getAdminStudentProgress);

router.get('/step/problems', foundationController.listAdminProblemStatements);
router.post(
  '/step/problems',
  validateBody(problemStatementSchema),
  foundationController.createAdminProblemStatement,
);
router.get('/step/problems/:problemId', foundationController.getAdminProblemStatement);
router.put(
  '/step/problems/:problemId',
  validateBody(updateProblemStatementSchema),
  foundationController.updateAdminProblemStatement,
);
router.delete('/step/problems/:problemId', foundationController.deleteAdminProblemStatement);
router.put(
  '/step/problems/:problemId/missions/:missionId',
  validateBody(missionConfigSchema),
  foundationController.updateAdminMissionConfig,
);

module.exports = router;
