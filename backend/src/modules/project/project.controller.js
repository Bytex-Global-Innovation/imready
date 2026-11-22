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
    // Free project details:
    // - Before Foundation: only the featured (newest) unpaid project is readable as preview.
    // - After Foundation: all unpaid project details are readable.
    // Applying still requires Foundation completion + admin PASS (enforced in applyToProject).
    if (access === 'free') {
      const student = req.studentRecord;
      if (!student) {
        return res.status(401).json({
          message: 'Sign in to view unpaid project details',
          code: 'UNAUTHORIZED',
        });
      }
      const foundationService = require('@modules/foundation/foundation.service');
      const foundationComplete =
        await foundationService.isFoundationCompleteForStudent(student);
      if (!foundationComplete) {
        const featured = await projectService.getFeaturedFreeProject();
        const slug = String(req.params.slug || '');
        const isFeatured =
          featured &&
          (featured.slug === slug ||
            String(featured.id) === slug ||
            String(featured.id) === String(Number(slug) || ''));
        if (!isFeatured) {
          return res.status(403).json({
            message:
              'Complete the Foundation stage to unlock all industry projects. A featured preview is available on the Industry Projects tab.',
            code: 'FOUNDATION_INCOMPLETE',
          });
        }
      }
    }
    const result = await projectService.getPublicProjectBySlug(req.params.slug, access);
    if (req.studentRecord) {
      const viewer = await projectService.getStudentParticipation(
        req.params.slug,
        req.studentRecord,
      );
      return res.status(200).json({ ...result, viewer });
    }
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getMyProjectStatus(req, res, next) {
  try {
    const result = await projectService.getStudentParticipation(
      req.params.slug,
      req.studentRecord,
    );
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
  getMyProjectStatus,
  applyToProject,
  getDashboardSummary,
  listAdminApplications,
  getAdminApplication,
};
