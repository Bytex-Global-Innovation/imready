'use strict';

const express = require('express');
const adminRoutes = require('@container/admin/adminRoutes');

const router = express.Router();

router.use('/auth/admin', adminRoutes);

module.exports = router;
