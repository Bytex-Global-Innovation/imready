'use strict';

/**
 * API v1 router — mounts domain modules only.
 * Add new features as modules under src/modules/, then wire them here.
 */
const express = require('express');
const adminAuthRoutes = require('@modules/admin/admin.auth.routes');
const assessmentAdminRoutes = require('@modules/assessment/assessment.admin.routes');
const assessmentStudentRoutes = require('@modules/assessment/assessment.student.routes');
const studentAuthRoutes = require('@modules/student/student.auth.routes');
const studentAdminRoutes = require('@modules/student/student.admin.routes');
const projectAdminRoutes = require('@modules/project/project.admin.routes');
const projectStudentRoutes = require('@modules/project/project.student.routes');
const dashboardAdminRoutes = require('@modules/dashboard/dashboard.admin.routes');
const foundationStudentRoutes = require('@modules/foundation/foundation.student.routes');
const foundationAdminRoutes = require('@modules/foundation/foundation.admin.routes');
const healthRoutes = require('@modules/health/health.routes');
const targetDomainAdminRoutes = require('@modules/target-domain/target-domain.admin.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth/admin', adminAuthRoutes);
router.use('/auth/students', studentAuthRoutes);
router.use('/admin/students', studentAdminRoutes);
router.use('/admin/projects', projectAdminRoutes);
router.use('/admin/dashboard', dashboardAdminRoutes);
router.use('/admin/assessments', assessmentAdminRoutes);
router.use('/admin/foundation', foundationAdminRoutes);
router.use('/admin/target-domains', targetDomainAdminRoutes);
router.use('/assessments', assessmentStudentRoutes);
router.use('/foundation', foundationStudentRoutes);
router.use('/projects', projectStudentRoutes);

module.exports = router;
