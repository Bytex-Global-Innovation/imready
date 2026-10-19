'use strict';

const foundationService = require('@modules/foundation/foundation.service');
const foundationStepService = require('@modules/foundation/foundation-step.service');

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

async function listProblemStatements(req, res, next) {
  try {
    const result = await foundationStepService.listProblemStatements({ activeOnly: true });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listAdminProblemStatements(req, res, next) {
  try {
    const result = await foundationStepService.listProblemStatements({ activeOnly: false });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getAdminProblemStatement(req, res, next) {
  try {
    const result = await foundationStepService.getProblemWithMissions(req.params.problemId);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function createAdminProblemStatement(req, res, next) {
  try {
    const result = await foundationStepService.createProblemStatement(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function updateAdminProblemStatement(req, res, next) {
  try {
    const result = await foundationStepService.updateProblemStatement(req.params.problemId, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function deleteAdminProblemStatement(req, res, next) {
  try {
    const result = await foundationStepService.deleteProblemStatement(req.params.problemId);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function updateAdminMissionConfig(req, res, next) {
  try {
    const missionId = Number(req.params.missionId);
    const result = await foundationStepService.updateMissionConfig(
      req.params.problemId,
      missionId,
      req.body,
    );
    return res.status(200).json({ mission: result });
  } catch (err) {
    return next(err);
  }
}

async function getJourneyContent(req, res, next) {
  try {
    const result = await foundationStepService.getStudentJourneyContent(req.studentRecord.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function selectProblemStatement(req, res, next) {
  try {
    const rawId = req.body.problemStatementId;
    const problemStatementId = Number(rawId);
    const result = await foundationStepService.selectProblemStatementForStudent(
      req.studentRecord.id,
      problemStatementId,
    );
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
  listProblemStatements,
  listAdminProblemStatements,
  getAdminProblemStatement,
  createAdminProblemStatement,
  updateAdminProblemStatement,
  deleteAdminProblemStatement,
  updateAdminMissionConfig,
  getJourneyContent,
  selectProblemStatement,
};
