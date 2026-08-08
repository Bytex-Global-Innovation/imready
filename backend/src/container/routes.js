'use strict';

const express = require('express');
const adminRoutes = require('@container/admin/adminRoutes');
const {
  adminRouter: assessmentAdminRoutes,
  publicRouter: assessmentPublicRoutes,
} = require('@container/assessment/assessmentRoutes');
const {
  publicRouter: studentPublicRoutes,
  adminRouter: studentAdminRoutes,
} = require('@container/student/studentRoutes');
const {
  adminRouter: projectAdminRoutes,
  publicRouter: projectPublicRoutes,
} = require('@container/project/projectRoutes');
const dashboardRoutes = require('@container/dashboard/dashboardRoutes');

const router = express.Router();

router.use('/auth/admin', adminRoutes);
router.use('/auth/students', studentPublicRoutes);
router.use('/admin/students', studentAdminRoutes);
router.use('/admin/projects', projectAdminRoutes);
router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/assessments', assessmentAdminRoutes);
router.use('/assessments', assessmentPublicRoutes);
router.use('/projects', projectPublicRoutes);

module.exports = router;
