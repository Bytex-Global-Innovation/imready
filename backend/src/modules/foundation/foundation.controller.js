'use strict';

const foundationService = require('@modules/foundation/foundation.service');

async function getProgress(req, res, next) {
  try {
    const progress = await foundationService.getStudentProgress(req.studentRecord.id);
    return res.status(200).json(progress);
  } catch (err) {
    return next(err);
  }
}

async function uploadEvidence(req, res, next) {
  try {
    const missionId = Number(req.params.missionId);
    const result = await foundationService.uploadMissionEvidence(
      req.studentRecord.id,
      missionId,
      req.file,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function saveDraft(req, res, next) {
  try {
    const missionId = Number(req.params.missionId);
    const result = await foundationService.saveDraft(
      req.studentRecord.id,
      missionId,
      req.body,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function completeMission(req, res, next) {
  try {
    const missionId = Number(req.params.missionId);
    const result = await foundationService.completeMission(
      req.studentRecord.id,
      missionId,
      req.body,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listAdminProgress(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || 'ALL').trim().toUpperCase();
    const result = await foundationService.listAdminProgress({ page, search, status });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getAdminStudentProgress(req, res, next) {
  try {
    const result = await foundationService.getAdminStudentProgress(req.params.studentId);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getProgress,
  uploadEvidence,
  saveDraft,
  completeMission,
  listAdminProgress,
  getAdminStudentProgress,
};
