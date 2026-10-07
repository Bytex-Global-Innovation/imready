'use strict';

const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const StudentAccount = require('@modules/student/student.model');
const FoundationMissionRecord = require('@modules/foundation/foundation-mission-record.model');
const {
  TOTAL_MISSIONS,
  MISSION_XP_REWARDS,
  MISSION_LABELS,
} = require('@modules/foundation/foundation.constants');

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

function deleteEvidenceFile(filePath) {
  if (!filePath) return;
  try {
    const relative = String(filePath).replace(/^\/+/, '');
    const fullPath = path.join(process.cwd(), relative);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch {
    // ignore cleanup failures
  }
}

function normalizeEvidence(evidence) {
  if (!evidence) {
    return { fileName: null, fileType: null, filePath: null };
  }
  const fileName = evidence.fileName ? String(evidence.fileName).trim() : null;
  const fileType = evidence.fileType ? String(evidence.fileType).trim() : null;
  const filePath = evidence.filePath ? String(evidence.filePath).trim() : null;
  if (!fileName && !filePath) {
    return { fileName: null, fileType: null, filePath: null };
  }
  return {
    fileName: fileName || null,
    fileType: fileType || null,
    filePath: filePath || null,
  };
}

function serializeEvidence(record) {
  if (!record?.evidenceFileName && !record?.evidenceFilePath) return null;
  return {
    fileName: record.evidenceFileName,
    fileType: record.evidenceFileType,
    filePath: record.evidenceFilePath,
    fileUrl: record.evidenceFilePath,
    previewDataUrl: null,
  };
}

function serializeMissionRecord(record) {
  if (!record) {
    return {
      missionId: null,
      answers: {},
      evidence: null,
      completed: false,
      completedAt: null,
      xpEarned: 0,
      updatedAt: null,
    };
  }

  return {
    missionId: record.missionId,
    answers: record.answers || {},
    evidence: serializeEvidence(record),
    completed: Boolean(record.completed),
    completedAt: record.completedAt,
    xpEarned: Number(record.xpEarned) || 0,
    updatedAt: record.updatedAt,
  };
}

function buildProgressPayload(records, student) {
  const missions = {};
  let totalXp = 0;
  let completedCount = 0;

  for (let missionId = 1; missionId <= TOTAL_MISSIONS; missionId += 1) {
    const row = records.find((r) => r.missionId === missionId);
    const serialized = serializeMissionRecord(row);
    missions[missionId] = {
      answers: serialized.answers,
      evidence: serialized.evidence,
      completed: serialized.completed,
      completedAt: serialized.completedAt ? new Date(serialized.completedAt).getTime() : null,
      xpEarned: serialized.xpEarned,
      updatedAt: serialized.updatedAt ? new Date(serialized.updatedAt).getTime() : Date.now(),
    };
    if (serialized.completed) {
      completedCount += 1;
      totalXp += serialized.xpEarned;
    }
  }

  const foundationComplete = Boolean(student?.foundationCompletedAt)
    || completedCount >= TOTAL_MISSIONS;

  return {
    missions,
    totalXp,
    completedCount,
    totalMissions: TOTAL_MISSIONS,
    foundationComplete,
    foundationCompletedAt: student?.foundationCompletedAt || null,
    projectsUnlocked: foundationComplete,
  };
}

async function loadStudentRecords(studentId) {
  return FoundationMissionRecord.findAll({
    where: { studentId },
    order: [['missionId', 'ASC']],
  });
}

function isMissionUnlocked(records, missionId) {
  if (missionId <= 1) return true;
  const previous = records.find((r) => r.missionId === missionId - 1);
  return Boolean(previous?.completed);
}

async function getStudentProgress(studentId) {
  const student = await StudentAccount.findByPk(studentId, {
    attributes: ['id', 'foundationCompletedAt'],
  });
  if (!student) throw notFound('Student not found');

  const records = await loadStudentRecords(studentId);
  return buildProgressPayload(records, student);
}

async function upsertMissionRecord(studentId, missionId, payload, { complete = false } = {}) {
  if (!Number.isInteger(missionId) || missionId < 1 || missionId > TOTAL_MISSIONS) {
    throw badRequest('Invalid mission id');
  }

  const student = await StudentAccount.findByPk(studentId);
  if (!student) throw notFound('Student not found');

  const records = await loadStudentRecords(studentId);
  if (!isMissionUnlocked(records, missionId)) {
    throw badRequest('Complete the previous mission first', 'MISSION_LOCKED');
  }

  const evidence = normalizeEvidence(payload.evidence);
  const answers = payload.answers && typeof payload.answers === 'object' ? payload.answers : {};
  const existing = records.find((r) => r.missionId === missionId);
  const wasAlreadyComplete = Boolean(existing?.completed);
  const xpEarned = MISSION_XP_REWARDS[missionId] || 0;

  if (existing?.evidenceFilePath && existing.evidenceFilePath !== evidence.filePath) {
    deleteEvidenceFile(existing.evidenceFilePath);
  }

  let record;
  if (existing) {
    existing.answers = answers;
    existing.evidenceFileName = evidence.fileName;
    existing.evidenceFileType = evidence.fileType;
    existing.evidenceFilePath = evidence.filePath;
    if (complete && !wasAlreadyComplete) {
      existing.completed = true;
      existing.completedAt = new Date();
      existing.xpEarned = xpEarned;
    }
    await existing.save();
    record = existing;
  } else {
    record = await FoundationMissionRecord.create({
      studentId,
      missionId,
      answers,
      evidenceFileName: evidence.fileName,
      evidenceFileType: evidence.fileType,
      evidenceFilePath: evidence.filePath,
      completed: complete,
      completedAt: complete ? new Date() : null,
      xpEarned: complete ? xpEarned : 0,
    });
  }

  if (complete && missionId === TOTAL_MISSIONS && !student.foundationCompletedAt) {
    student.foundationCompletedAt = new Date();
    await student.save();
  }

  const updatedRecords = await loadStudentRecords(studentId);
  const refreshedStudent = await StudentAccount.findByPk(studentId, {
    attributes: ['id', 'foundationCompletedAt', 'subscriptionStatus'],
  });

  const progress = buildProgressPayload(updatedRecords, refreshedStudent);
  const projectsUnlocked =
    progress.foundationComplete
    || refreshedStudent.subscriptionStatus === 'PREMIUM';

  return {
    mission: serializeMissionRecord(record),
    progress,
    projectsUnlocked,
    xpAwarded: complete && !wasAlreadyComplete ? xpEarned : 0,
  };
}

async function uploadMissionEvidence(studentId, missionId, file) {
  if (!file) throw badRequest('Please upload an evidence document');
  if (!Number.isInteger(missionId) || missionId < 1 || missionId > TOTAL_MISSIONS) {
    throw badRequest('Invalid mission id');
  }

  const records = await loadStudentRecords(studentId);
  if (!isMissionUnlocked(records, missionId)) {
    deleteEvidenceFile(`/uploads/foundation-evidence/${file.filename}`);
    throw badRequest('Complete the previous mission first', 'MISSION_LOCKED');
  }

  const filePath = `/uploads/foundation-evidence/${file.filename}`;
  const evidence = {
    fileName: file.originalname || file.filename,
    fileType: file.mimetype || null,
    filePath,
  };

  const existing = records.find((r) => r.missionId === missionId);
  if (existing?.evidenceFilePath && existing.evidenceFilePath !== filePath) {
    deleteEvidenceFile(existing.evidenceFilePath);
  }

  let record;
  if (existing) {
    existing.evidenceFileName = evidence.fileName;
    existing.evidenceFileType = evidence.fileType;
    existing.evidenceFilePath = evidence.filePath;
    await existing.save();
    record = existing;
  } else {
    record = await FoundationMissionRecord.create({
      studentId,
      missionId,
      answers: {},
      evidenceFileName: evidence.fileName,
      evidenceFileType: evidence.fileType,
      evidenceFilePath: evidence.filePath,
      completed: false,
      completedAt: null,
      xpEarned: 0,
    });
  }

  const student = await StudentAccount.findByPk(studentId, {
    attributes: ['id', 'foundationCompletedAt', 'subscriptionStatus'],
  });
  const updatedRecords = await loadStudentRecords(studentId);
  const progress = buildProgressPayload(updatedRecords, student);

  return {
    evidence: serializeEvidence(record),
    progress,
  };
}

async function saveDraft(studentId, missionId, payload) {
  return upsertMissionRecord(studentId, missionId, payload, { complete: false });
}

async function completeMission(studentId, missionId, payload) {
  return upsertMissionRecord(studentId, missionId, payload, { complete: true });
}

async function listAdminProgress({ page = 1, search = '', status = 'ALL' } = {}) {
  const limit = 20;
  const offset = (Math.max(1, page) - 1) * limit;
  const where = {};

  if (search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { collegeName: { [Op.like]: `%${search}%` } },
    ];
  }

  if (status === 'COMPLETE') {
    where.foundationCompletedAt = { [Op.ne]: null };
  } else if (status === 'IN_PROGRESS') {
    where.foundationCompletedAt = null;
    where[Op.and] = [
      StudentAccount.sequelize.literal(
        'EXISTS (SELECT 1 FROM foundation_mission_records AS fmr WHERE fmr.student_id = `StudentAccount`.`id`)',
      ),
    ];
  }

  const { rows, count } = await StudentAccount.findAndCountAll({
    where,
    attributes: [
      'id',
      'uuid',
      'fullName',
      'email',
      'collegeName',
      'foundationCompletedAt',
      'createdAt',
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  const studentIds = rows.map((row) => row.id);
  const missionRows = studentIds.length
    ? await FoundationMissionRecord.findAll({
        where: { studentId: { [Op.in]: studentIds } },
        attributes: ['studentId', 'missionId', 'completed', 'updatedAt', 'xpEarned'],
      })
    : [];

  const results = rows.map((student) => {
    const studentMissions = missionRows.filter((m) => m.studentId === student.id);
    const completedCount = studentMissions.filter((m) => m.completed).length;
    const totalXp = studentMissions
      .filter((m) => m.completed)
      .reduce((sum, m) => sum + (Number(m.xpEarned) || 0), 0);
    const lastUpdated = studentMissions.reduce((latest, m) => {
      const ts = m.updatedAt ? new Date(m.updatedAt).getTime() : 0;
      return Math.max(latest, ts);
    }, 0);

    let currentMission = 1;
    for (let id = 1; id <= TOTAL_MISSIONS; id += 1) {
      const row = studentMissions.find((m) => m.missionId === id);
      if (!row?.completed) {
        currentMission = id;
        break;
      }
      if (id === TOTAL_MISSIONS) currentMission = TOTAL_MISSIONS;
    }

    return {
      studentId: String(student.id),
      studentUuid: student.uuid,
      studentName: student.fullName,
      email: student.email,
      collegeName: student.collegeName,
      completedCount,
      totalMissions: TOTAL_MISSIONS,
      currentMission,
      totalXp,
      foundationComplete: Boolean(student.foundationCompletedAt) || completedCount >= TOTAL_MISSIONS,
      foundationCompletedAt: student.foundationCompletedAt,
      lastUpdatedAt: lastUpdated ? new Date(lastUpdated).toISOString() : null,
    };
  });

  return {
    results,
    page: Math.max(1, page),
    totalPages: Math.max(1, Math.ceil(count / limit)),
    total: count,
  };
}

async function getAdminStudentProgress(studentId) {
  const student = await StudentAccount.findByPk(studentId, {
    attributes: [
      'id',
      'uuid',
      'fullName',
      'email',
      'collegeName',
      'streamMajor',
      'graduationYear',
      'foundationCompletedAt',
      'createdAt',
    ],
  });
  if (!student) throw notFound('Student not found');

  const records = await loadStudentRecords(studentId);
  const progress = buildProgressPayload(records, student);

  const missions = Object.entries(progress.missions).map(([id, record]) => ({
    missionId: Number(id),
    label: MISSION_LABELS[Number(id)] || `Mission ${id}`,
    answers: record.answers,
    evidence: record.evidence,
    completed: record.completed,
    completedAt: record.completedAt,
    xpEarned: record.xpEarned,
    updatedAt: record.updatedAt,
  }));

  return {
    student: {
      id: String(student.id),
      uuid: student.uuid,
      studentName: student.fullName,
      email: student.email,
      collegeName: student.collegeName,
      streamMajor: student.streamMajor,
      graduationYear: student.graduationYear,
      foundationCompletedAt: student.foundationCompletedAt,
      createdAt: student.createdAt,
    },
    progress: {
      totalXp: progress.totalXp,
      completedCount: progress.completedCount,
      totalMissions: progress.totalMissions,
      foundationComplete: progress.foundationComplete,
      foundationCompletedAt: progress.foundationCompletedAt,
    },
    missions,
  };
}

async function isFoundationCompleteForStudent(student) {
  if (!student) return false;
  if (student.foundationCompletedAt) return true;

  const completedCount = await FoundationMissionRecord.count({
    where: { studentId: student.id, completed: true },
  });
  return completedCount >= TOTAL_MISSIONS;
}

module.exports = {
  getStudentProgress,
  uploadMissionEvidence,
  saveDraft,
  completeMission,
  listAdminProgress,
  getAdminStudentProgress,
  isFoundationCompleteForStudent,
  TOTAL_MISSIONS,
};
