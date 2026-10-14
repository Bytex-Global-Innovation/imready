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
};
