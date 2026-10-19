'use strict';

const express = require('express');
const foundationController = require('@modules/foundation/foundation.controller');
const {
  validateBody,
  saveDraftSchema,
  completeMissionSchema,
  selectProblemSchema,
} = require('@modules/foundation/foundation.validator');
const { requireVerifiedStudent } = require('@modules/auth/student.guard');
const { uploadFoundationEvidence } = require('@middleware/upload-foundation-evidence.middleware');

const router = express.Router();

router.use(requireVerifiedStudent);

router.get('/progress', foundationController.getProgress);
router.get('/problem-statements', foundationController.listProblemStatements);
router.get('/journey-content', foundationController.getJourneyContent);
router.post(
  '/problem-statement',
  validateBody(selectProblemSchema),
  foundationController.selectProblemStatement,
);
router.post(
  '/missions/:missionId/evidence',
  uploadFoundationEvidence('evidence'),
  foundationController.uploadEvidence,
);
router.put(
  '/missions/:missionId/draft',
  validateBody(saveDraftSchema),
  foundationController.saveDraft,
);
router.post(
  '/missions/:missionId/complete',
  validateBody(completeMissionSchema),
  foundationController.completeMission,
);

module.exports = router;
