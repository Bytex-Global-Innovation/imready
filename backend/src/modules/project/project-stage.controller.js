'use strict';

const stageService = require('@modules/project/project-stage.service');

async function getStudentStageBundle(req, res, next) {
  try {
    const result = await stageService.getStageBundleForStudent(
      req.params.slug,
      req.student.id,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function updateStudentProgress(req, res, next) {
  try {
    const progress = await stageService.updateProgressForStudent(
      req.params.slug,
      req.student.id,
      req.body,
    );
    return res.status(200).json({ progress });
  } catch (err) {
    return next(err);
  }
}

async function submitStudentProject(req, res, next) {
  try {
    const result = await stageService.submitProjectForStudent(
      req.params.slug,
      req.student.id,
      req.body,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getStudentOwnerFeedback(req, res, next) {
  try {
    const result = await stageService.getOwnerFeedbackForStudent(
      req.params.slug,
      req.student.id,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getStudentOutcome(req, res, next) {
  try {
    const result = await stageService.getOutcomeForStudent(
      req.params.slug,
      req.student.id,
      );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listAdminReviews(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const status = req.query.status ? String(req.query.status) : undefined;
    const result = await stageService.listAdminReviews({ page, status });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getAdminReviewPacket(req, res, next) {
  try {
    const result = await stageService.getAdminReviewPacket(req.params.teamId);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function saveAdminOwnerFeedback(req, res, next) {
  try {
    const result = await stageService.upsertAdminOwnerFeedback(
      req.params.teamId,
      req.admin?.id,
      req.body,
      { submit: false },
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function submitAdminOwnerFeedback(req, res, next) {
  try {
    const result = await stageService.upsertAdminOwnerFeedback(
      req.params.teamId,
      req.admin?.id,
      req.body,
      { submit: true },
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getStudentStageBundle,
  updateStudentProgress,
  submitStudentProject,
  getStudentOwnerFeedback,
  getStudentOutcome,
  listAdminReviews,
  getAdminReviewPacket,
  saveAdminOwnerFeedback,
  submitAdminOwnerFeedback,
};
