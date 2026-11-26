'use strict';

const express = require('express');
const landingController = require('@modules/landing/landing.controller');
const {
  shareProblemSchema,
  validateBody,
} = require('@modules/landing/landing.validator');
const { createRateLimiter } = require('@middleware/rate-limit.middleware');

const router = express.Router();

const shareProblemLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many submissions. Please try again in 15 minutes.',
});

router.post(
  '/share-problem',
  shareProblemLimiter,
  validateBody(shareProblemSchema),
  landingController.createShareProblem,
);

module.exports = router;
