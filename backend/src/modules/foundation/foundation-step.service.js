'use strict';

const crypto = require('crypto');
const FoundationProblemStatement = require('@modules/foundation/foundation-problem-statement.model');
const FoundationMissionConfig = require('@modules/foundation/foundation-mission-config.model');
const StudentAccount = require('@modules/student/student.model');
const FoundationMissionRecord = require('@modules/foundation/foundation-mission-record.model');
const { TOTAL_MISSIONS, MISSION_LABELS } = require('@modules/foundation/foundation.constants');

const MISSION_FRAMEWORK_LETTERS = ['R', 'E', 'A', 'D', 'Y'];
const { buildDefaultMissionConfig } = require('@modules/foundation/foundation-step.defaults');

function badRequest(message, code) {
  const err = new Error(message);
  err.statusCode = 400;
  if (code) err.code = code;
  return err;
}

function notFound(message) {
  const err = new Error(message || 'Not found');
  err.statusCode = 404;
  return err;
}

function serializeProblem(row) {
  return {
    id: String(row.id),
    uuid: row.uuid,
    statementText: row.statementText,
    isActive: Boolean(row.isActive),
    sortOrder: Number(row.sortOrder) || 0,
  };
}

function serializeMissionConfig(row) {
  return {
    id: String(row.id),
    missionId: Number(row.missionId),
    tipAdvisorLabel: row.tipAdvisorLabel,
    tipQuote: row.tipQuote,
    analyzeContextText: row.analyzeContextText || null,
    patternTagOptions: row.patternTagOptions || null,
    whyLayerLabels: row.whyLayerLabels || null,
    questions: Array.isArray(row.questions) ? row.questions : [],
    evidenceConfig: row.evidenceConfig || null,
  };
}

async function ensureMissionConfigsForProblem(problemRow) {
  const existing = await FoundationMissionConfig.findAll({
    where: { problemStatementId: problemRow.id },
  });
  if (existing.length >= TOTAL_MISSIONS) return;

  const existingIds = new Set(existing.map((r) => r.missionId));
  for (let missionId = 1; missionId <= TOTAL_MISSIONS; missionId += 1) {
    if (existingIds.has(missionId)) continue;
    const defaults = buildDefaultMissionConfig(problemRow.statementText, missionId);
    await FoundationMissionConfig.create({
      problemStatementId: problemRow.id,
      missionId,
      tipAdvisorLabel: defaults.tipAdvisorLabel,
      tipQuote: defaults.tipQuote,
      analyzeContextText: defaults.analyzeContextText,
      patternTagOptions: defaults.patternTagOptions,
      whyLayerLabels: defaults.whyLayerLabels,
      questions: defaults.questions,
      evidenceConfig: defaults.evidenceConfig,
    });
  }
}

async function listProblemStatements({ activeOnly = false } = {}) {
  const where = {};
  if (activeOnly) where.isActive = true;
  const rows = await FoundationProblemStatement.findAll({
    where,
    order: [['sortOrder', 'ASC'], ['id', 'ASC']],
  });
  return { problemStatements: rows.map(serializeProblem) };
}

async function getProblemWithMissions(problemId) {
  const row = await FoundationProblemStatement.findByPk(problemId);
  if (!row) throw notFound('Problem statement not found');
  await ensureMissionConfigsForProblem(row);
  const missions = await FoundationMissionConfig.findAll({
    where: { problemStatementId: row.id },
    order: [['missionId', 'ASC']],
  });
  return {
    problem: serializeProblem(row),
    missions: missions.map(serializeMissionConfig),
  };
}

async function createProblemStatement(payload) {
  const statementText = String(payload.statementText || '').trim();
  if (!statementText) throw badRequest('Statement text is required');

  const row = await FoundationProblemStatement.create({
    uuid: crypto.randomUUID(),
    statementText,
    isActive: payload.isActive !== false,
    sortOrder: Number(payload.sortOrder) || 0,
  });

  for (let missionId = 1; missionId <= TOTAL_MISSIONS; missionId += 1) {
    const defaults = buildDefaultMissionConfig(statementText, missionId);
    await FoundationMissionConfig.create({
      problemStatementId: row.id,
      missionId,
      tipAdvisorLabel: defaults.tipAdvisorLabel,
      tipQuote: defaults.tipQuote,
      analyzeContextText: defaults.analyzeContextText,
      patternTagOptions: defaults.patternTagOptions,
      whyLayerLabels: defaults.whyLayerLabels,
      questions: defaults.questions,
      evidenceConfig: defaults.evidenceConfig,
    });
  }

  return getProblemWithMissions(row.id);
}

async function updateProblemStatement(problemId, payload) {
  const row = await FoundationProblemStatement.findByPk(problemId);
  if (!row) throw notFound('Problem statement not found');

  if (payload.statementText != null) {
    const statementText = String(payload.statementText).trim();
    if (!statementText) throw badRequest('Statement text is required');
    row.statementText = statementText;
  }
  if (payload.isActive != null) row.isActive = Boolean(payload.isActive);
  if (payload.sortOrder != null) row.sortOrder = Number(payload.sortOrder) || 0;
  await row.save();

  return getProblemWithMissions(row.id);
}

async function deleteProblemStatement(problemId) {
  const row = await FoundationProblemStatement.findByPk(problemId);
  if (!row) throw notFound('Problem statement not found');

  const inUse = await StudentAccount.count({
    where: { foundationProblemStatementId: row.id },
  });
  if (inUse > 0) {
    throw badRequest('Cannot delete: students have already selected this problem statement');
  }

  await FoundationMissionConfig.destroy({ where: { problemStatementId: row.id } });
  await row.destroy();
  return { message: 'Problem statement deleted' };
}

async function updateMissionConfig(problemId, missionId, payload) {
  const problem = await FoundationProblemStatement.findByPk(problemId);
  if (!problem) throw notFound('Problem statement not found');
  if (!Number.isInteger(missionId) || missionId < 1 || missionId > TOTAL_MISSIONS) {
    throw badRequest('Invalid mission id');
  }

  await ensureMissionConfigsForProblem(problem);
  const row = await FoundationMissionConfig.findOne({
    where: { problemStatementId: problemId, missionId },
  });
  if (!row) throw notFound('Mission config not found');

  if (payload.tipAdvisorLabel != null) {
    row.tipAdvisorLabel = String(payload.tipAdvisorLabel).trim() || 'Advisor';
  }
  if (payload.tipQuote != null) row.tipQuote = String(payload.tipQuote);
  if (payload.analyzeContextText != null) {
    row.analyzeContextText = payload.analyzeContextText
      ? String(payload.analyzeContextText)
      : null;
  }
  if (payload.patternTagOptions != null) {
    row.patternTagOptions = Array.isArray(payload.patternTagOptions)
      ? payload.patternTagOptions.map((t) => String(t).trim()).filter(Boolean)
      : null;
  }
  if (payload.whyLayerLabels != null) {
    row.whyLayerLabels = Array.isArray(payload.whyLayerLabels) ? payload.whyLayerLabels : null;
  }
  if (payload.questions != null) {
    if (!Array.isArray(payload.questions)) throw badRequest('questions must be an array');
    row.questions = payload.questions;
  }
  if (payload.evidenceConfig != null) {
    row.evidenceConfig = payload.evidenceConfig && typeof payload.evidenceConfig === 'object'
      ? payload.evidenceConfig
      : null;
  }
  await row.save();

  return serializeMissionConfig(row);
}

async function getStudentJourneyContent(studentId) {
  const student = await StudentAccount.findByPk(studentId, {
    attributes: ['id', 'foundationProblemStatementId'],
  });
  if (!student) throw notFound('Student not found');

  const problemId = student.foundationProblemStatementId;
  if (!problemId) {
    return {
      selectedProblemStatement: null,
      missions: {},
    };
  }

  const problem = await FoundationProblemStatement.findByPk(problemId);
  if (!problem || !problem.isActive) {
    return {
      selectedProblemStatement: null,
      missions: {},
    };
  }

  await ensureMissionConfigsForProblem(problem);
  const configs = await FoundationMissionConfig.findAll({
    where: { problemStatementId: problem.id },
    order: [['missionId', 'ASC']],
  });

  const missions = {};
  configs.forEach((row) => {
    missions[row.missionId] = serializeMissionConfig(row);
  });

  return {
    selectedProblemStatement: serializeProblem(problem),
    missions,
  };
}

async function selectProblemStatementForStudent(studentId, problemStatementId) {
  const student = await StudentAccount.findByPk(studentId);
  if (!student) throw notFound('Student not found');

  const normalizedId = Number(problemStatementId);
  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    throw badRequest('Invalid problem statement id');
  }

  const problem = await FoundationProblemStatement.findByPk(normalizedId);
  if (!problem || !problem.isActive) {
    throw badRequest('Invalid or inactive problem statement');
  }

  if (
    student.foundationProblemStatementId
    && Number(student.foundationProblemStatementId) === normalizedId
  ) {
    return getStudentJourneyContent(studentId);
  }

  if (
    student.foundationProblemStatementId
    && Number(student.foundationProblemStatementId) !== normalizedId
  ) {
    const started = await FoundationMissionRecord.count({ where: { studentId } });
    if (started > 0) {
      throw badRequest(
        'Problem statement cannot be changed after you have started the foundation journey',
        'PROBLEM_LOCKED',
      );
    }
  }

  student.foundationProblemStatementId = problem.id;
  await student.save();

  return getStudentJourneyContent(studentId);
}

async function resolveFrameworkProblemId(studentId) {
  const student = await StudentAccount.findByPk(studentId, {
    attributes: ['foundationProblemStatementId'],
  });
  if (student?.foundationProblemStatementId) {
    const selected = await FoundationProblemStatement.findByPk(student.foundationProblemStatementId);
    if (selected?.isActive) return selected.id;
  }
  const firstActive = await FoundationProblemStatement.findOne({
    where: { isActive: true },
    order: [['sortOrder', 'ASC'], ['id', 'ASC']],
  });
  return firstActive?.id ?? null;
}

function frameworkPartFromConfig(missionId, config) {
  const letter = MISSION_FRAMEWORK_LETTERS[missionId - 1] || '?';
  const title = MISSION_LABELS[missionId] || `Mission ${missionId}`;
  const questions = Array.isArray(config.questions) ? config.questions : [];
  const primary = questions[0];
  const subtitle =
    (primary && (primary.label || primary.question)) || title;
  const description =
    (config.tipQuote && String(config.tipQuote).trim())
    || (primary && primary.helper)
    || '';
  return {
    part: `Part ${missionId}`,
    letter,
    title,
    subtitle,
    description,
  };
}

async function getStageFrameworkPreview(studentId) {
  const problemId = await resolveFrameworkProblemId(studentId);
  if (!problemId) {
    return { parts: [] };
  }

  const problem = await FoundationProblemStatement.findByPk(problemId);
  if (!problem) return { parts: [] };

  await ensureMissionConfigsForProblem(problem);
  const configs = await FoundationMissionConfig.findAll({
    where: { problemStatementId: problem.id },
    order: [['missionId', 'ASC']],
  });

  const parts = [];
  for (let missionId = 1; missionId <= TOTAL_MISSIONS; missionId += 1) {
    const row = configs.find((c) => c.missionId === missionId);
    if (!row) continue;
    parts.push(frameworkPartFromConfig(missionId, serializeMissionConfig(row)));
  }

  return { parts };
}

module.exports = {
  listProblemStatements,
  getProblemWithMissions,
  createProblemStatement,
  updateProblemStatement,
  deleteProblemStatement,
  updateMissionConfig,
  getStudentJourneyContent,
  selectProblemStatementForStudent,
  getStageFrameworkPreview,
};
