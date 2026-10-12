'use strict';

const express = require('express');
const healthController = require('@modules/health/health.controller');

const router = express.Router();

router.get('/', healthController.getHealth);

module.exports = router;
