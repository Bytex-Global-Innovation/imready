'use strict';

const projectService = require('@modules/project/project.service');

async function listAdminProjects(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const search = req.query.search ? String(req.query.search) : undefined;
    const result = await projectService.listAdminProjects({ page, search });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function createProject(req, res, next) {
  try {
    const result = await projectService.createProject(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getAdminProject(req, res, next) {
  try {
    const result = await projectService.getAdminProject(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const result = await projectService.updateProject(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    const result = await projectService.deleteProject(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listPublicProjects(req, res, next) {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const access = req.query.access ? String(req.query.access) : undefined;
    const result = await projectService.listPublicProjects({ category, access });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getPublicProject(req, res, next) {
  try {
    const access = req.query.access ? String(req.query.access) : undefined;
    // Free project detail pages require admin-passed foundation verification.
    if (access === 'free') {
      const student = req.studentRecord;
      if (!student) {
        return res.status(401).json({
          message: 'Sign in to view unpaid project details',
          code: 'UNAUTHORIZED',
        });
      }
      if (String(student.foundationVerificationStatus || 'NONE') !== 'PASSED') {
        const status = student.foundationVerificationStatus || 'NONE';
        const message =
          status === 'PENDING'
            ? 'Your Foundation submission is under review. Unpaid project details unlock after admin verification (usually 24–48 hours).'
            : status === 'FAILED'
              ? 'Your Foundation submission was not approved. You can browse unpaid projects but cannot open project details yet.'
              : 'Complete Foundation and wait for admin verification to view unpaid project details.';
        return res.status(403).json({
          message,
          code: 'FOUNDATION_VERIFICATION_REQUIRED',
          foundationVerificationStatus: status,
        });
      }
    }
    const result = await projectService.getPublicProjectBySlug(req.params.slug, access);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function applyToProject(req, res, next) {
  try {
    const student = req.studentRecord;
    const result = await projectService.applyToProject(req.params.slug, {
      studentId: student.id,
      studentName: student.fullName,
      studentEmail: student.email,
      motivation: req.body?.motivation,
      contributions: req.body?.contributions,
    });
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getDashboardSummary(req, res, next) {
  try {
    const result = await projectService.getDashboardSummary();
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listAdminApplications(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const status = req.query.status ? String(req.query.status) : undefined;
    const projectId = req.query.projectId ? String(req.query.projectId) : undefined;
    const result = await projectService.listAdminApplications({ page, status, projectId });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getAdminApplication(req, res, next) {
  try {
    const result = await projectService.getAdminApplication(req.params.applicationId);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listAdminProjects,
  createProject,
  getAdminProject,
  updateProject,
  deleteProject,
  listPublicProjects,
  getPublicProject,
  applyToProject,
  getDashboardSummary,
  listAdminApplications,
  getAdminApplication,
};
