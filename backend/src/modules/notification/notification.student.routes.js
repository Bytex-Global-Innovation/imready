'use strict';

const express = require('express');
const teamController = require('@modules/project/project-team.controller');
const { requireVerifiedStudent } = require('@modules/auth/student.guard');

const router = express.Router();

router.use(requireVerifiedStudent);
router.get('/', teamController.listNotifications);
router.post('/:memberId/accept', teamController.acceptInvite);
router.post('/:memberId/reject', teamController.rejectInvite);

module.exports = router;
