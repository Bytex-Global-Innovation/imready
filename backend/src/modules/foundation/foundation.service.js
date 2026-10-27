'use strict';

const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const StudentAccount = require('@modules/student/student.model');
const FoundationMissionRecord = require('@modules/foundation/foundation-mission-record.model');
const FoundationProblemStatement = require('@modules/foundation/foundation-problem-statement.model');
const {
  TOTAL_MISSIONS,
  MISSION_XP_REWARDS,
  MISSION_LABELS,
} = require('@modules/foundation/foundation.constants');
const { validatePresentationVideoUrl } = require('@modules/foundation/presentation-video-url');

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

function serializeSelectedProblem(problem) {
  if (!problem) return null;
  return {
    id: String(problem.id),
    uuid: problem.uuid,
    statementText: problem.statementText,
  };
}

function buildProgressPayload(records, student, selectedProblem = null) {
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
    selectedProblemStatement: serializeSelectedProblem(selectedProblem),
    foundationProblemStatementId: student?.foundationProblemStatementId
      ? String(student.foundationProblemStatementId)
      : null,
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

async function loadSelectedProblem(student) {
  if (!student?.foundationProblemStatementId) return null;
  const problem = await FoundationProblemStatement.findByPk(student.foundationProblemStatementId);
  if (!problem || !problem.isActive) return null;
  return problem;
}

async function getStudentProgress(studentId) {
  const student = await StudentAccount.findByPk(studentId, {
    attributes: ['id', 'foundationCompletedAt', 'foundationProblemStatementId'],
  });
  if (!student) throw notFound('Student not found');

  const selectedProblem = await loadSelectedProblem(student);
  const records = await loadStudentRecords(studentId);
  return buildProgressPayload(records, student, selectedProblem);
}

async function upsertMissionRecord(studentId, missionId, payload, { complete = false } = {}) {
  if (!Number.isInteger(missionId) || missionId < 1 || missionId > TOTAL_MISSIONS) {
    throw badRequest('Invalid mission id');
  }

  const student = await StudentAccount.findByPk(studentId);
  if (!student) throw notFound('Student not found');
  if (!student.foundationProblemStatementId) {
    throw badRequest(
      'Select a foundation problem statement before working on missions',
      'PROBLEM_REQUIRED',
    );
  }

  const records = await loadStudentRecords(studentId);
  if (!isMissionUnlocked(records, missionId)) {
    throw badRequest('Complete the previous mission first', 'MISSION_LOCKED');
  }

  let evidence = normalizeEvidence(payload.evidence);
  const answers = payload.answers && typeof payload.answers === 'object' ? { ...payload.answers } : {};
  const existing = records.find((r) => r.missionId === missionId);
  const wasAlreadyComplete = Boolean(existing?.completed);
  const xpEarned = MISSION_XP_REWARDS[missionId] || 0;

  if (missionId === 4) {
    const videoRaw = answers.presentationVideoUrl;
    if (complete || (videoRaw && String(videoRaw).trim())) {
      const check = validatePresentationVideoUrl(videoRaw);
      if (!check.ok) {
        throw badRequest(check.message, 'INVALID_VIDEO_URL');
      }
      answers.presentationVideoUrl = check.normalized;
    } else if (complete) {
      throw badRequest('Presentation video link is required', 'INVALID_VIDEO_URL');
    }
    if (existing?.evidenceFilePath) {
      deleteEvidenceFile(existing.evidenceFilePath);
    }
    evidence = { fileName: null, fileType: null, filePath: null };
  } else if (missionId === 5) {
    const videoRaw = answers.presentationVideoUrl;
    if (complete || (videoRaw && String(videoRaw).trim())) {
      const check = validatePresentationVideoUrl(videoRaw);
      if (!check.ok) {
        throw badRequest(check.message, 'INVALID_VIDEO_URL');
      }
      answers.presentationVideoUrl = check.normalized;
    } else if (complete) {
      throw badRequest('Impact video link is required', 'INVALID_VIDEO_URL');
    }
  } else if (existing?.evidenceFilePath && existing.evidenceFilePath !== evidence.filePath) {
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
    attributes: ['id', 'foundationCompletedAt', 'subscriptionStatus', 'foundationProblemStatementId'],
  });
  const selectedProblem = await loadSelectedProblem(refreshedStudent);

  const progress = buildProgressPayload(updatedRecords, refreshedStudent, selectedProblem);
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
  if (missionId === 4) {
    if (file?.filename) {
      deleteEvidenceFile(`/uploads/foundation-evidence/${file.filename}`);
    }
    throw badRequest(
      'Mission 4 requires a YouTube or Google Drive video link instead of a file upload',
      'VIDEO_LINK_REQUIRED',
    );
  }

  const student = await StudentAccount.findByPk(studentId, {
    attributes: ['id', 'foundationCompletedAt', 'subscriptionStatus', 'foundationProblemStatementId'],
  });
  if (!student) throw notFound('Student not found');
  if (!student.foundationProblemStatementId) {
    deleteEvidenceFile(`/uploads/foundation-evidence/${file.filename}`);
    throw badRequest(
      'Select a foundation problem statement before working on missions',
      'PROBLEM_REQUIRED',
    );
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

  const selectedProblem = await loadSelectedProblem(student);
  const updatedRecords = await loadStudentRecords(studentId);
  const progress = buildProgressPayload(updatedRecords, student, selectedProblem);

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

async function getAdminProgressSummary() {
  const sequelize = StudentAccount.sequelize;
  const [[row]] = await sequelize.query(
    `SELECT
      COUNT(*) AS totalStudents,
      COALESCE(SUM(CASE WHEN completed_missions >= :totalMissions THEN 1 ELSE 0 END), 0) AS completedAll,
      COALESCE(SUM(CASE WHEN completed_missions >= 3 THEN 1 ELSE 0 END), 0) AS completedAtLeast3
    FROM (
      SELECT s.id,
        COALESCE(SUM(CASE WHEN fmr.completed = 1 THEN 1 ELSE 0 END), 0) AS completed_missions
      FROM student_accounts s
      LEFT JOIN foundation_mission_records fmr ON fmr.student_id = s.id
      GROUP BY s.id
    ) mission_stats`,
    {
      replacements: { totalMissions: TOTAL_MISSIONS },
    },
  );

  return {
    totalStudents: Number(row?.totalStudents) || 0,
    completedAll: Number(row?.completedAll) || 0,
    completedAtLeast3: Number(row?.completedAtLeast3) || 0,
  };
}

async function listAdminProgress({ page = 1, search = '', status = 'ALL' } = {}) {
  const limit = 20;
  const offset = (Math.max(1, page) - 1) * limit;
  const where = {};
  const andClauses = [];

  if (search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { collegeName: { [Op.like]: `%${search}%` } },
    ];
  }

  const completedCountSql = `(
    SELECT COUNT(*) FROM foundation_mission_records AS fmr
    WHERE fmr.student_id = \`StudentAccount\`.\`id\` AND fmr.completed = 1
  )`;

  if (status === 'COMPLETE') {
    andClauses.push(StudentAccount.sequelize.literal(`${completedCountSql} >= ${TOTAL_MISSIONS}`));
  } else if (status === 'AT_LEAST_3') {
    andClauses.push(StudentAccount.sequelize.literal(`${completedCountSql} >= 3`));
  } else if (status === 'NOT_STARTED') {
    andClauses.push(StudentAccount.sequelize.literal(`${completedCountSql} = 0`));
  } else if (status === 'IN_PROGRESS') {
    andClauses.push(StudentAccount.sequelize.literal(`${completedCountSql} > 0`));
    andClauses.push(StudentAccount.sequelize.literal(`${completedCountSql} < ${TOTAL_MISSIONS}`));
  }

  if (andClauses.length) {
    where[Op.and] = andClauses;
  }

  const summary = await getAdminProgressSummary();

  const { rows, count } = await StudentAccount.findAndCountAll({
    where,
    attributes: [
      'id',
      'uuid',
      'fullName',
      'email',
      'collegeName',
      'foundationCompletedAt',
      'foundationProblemStatementId',
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

  const problemIds = [
    ...new Set(
      rows
        .map((row) => row.foundationProblemStatementId)
        .filter((id) => id != null),
    ),
  ];
  const problemRows = problemIds.length
    ? await FoundationProblemStatement.findAll({
        where: { id: { [Op.in]: problemIds } },
        attributes: ['id', 'statementText'],
      })
    : [];
  const problemTextById = new Map(
    problemRows.map((p) => [String(p.id), p.statementText]),
  );

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

    const problemStatementText = student.foundationProblemStatementId
      ? problemTextById.get(String(student.foundationProblemStatementId)) || null
      : null;

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
      problemStatementText,
      foundationProblemStatementId: student.foundationProblemStatementId
        ? String(student.foundationProblemStatementId)
        : null,
    };
  });

  return {
    results,
    summary,
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
      'foundationProblemStatementId',
      'createdAt',
    ],
  });
  if (!student) throw notFound('Student not found');

  const records = await loadStudentRecords(studentId);
  const selectedProblem = await loadSelectedProblem(student);
  const progress = buildProgressPayload(records, student, selectedProblem);

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
      selectedProblemStatement: progress.selectedProblemStatement,
      foundationProblemStatementId: progress.foundationProblemStatementId,
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
