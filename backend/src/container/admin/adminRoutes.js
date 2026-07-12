'use strict';

const express = require('express');
const adminController = require('@container/admin/adminController');
const { validateBody, loginSchema } = require('@container/admin/adminValidator');

const router = express.Router();

router.post('/login', validateBody(loginSchema), adminController.login);

module.exports = router;
