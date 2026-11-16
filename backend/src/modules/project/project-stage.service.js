'use strict';

const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  setupCoreAssociations,
  StudentAccount,
  IndustryProject,
  ProjectTeam,
  ProjectTeamMember,
  ProjectStageProgress,
  ProjectSubmission,
  ProjectOwnerFeedback,
} = require('@modules/project/project.associations');

setupCoreAssociations();

const STAGES = [
  'WORKSPACE',
  'READY',
  'DO',
  'SUBMIT',
  'REVIEW',
  'OWNER_FEEDBACK',
  'OUTCOME',
  'PROFILE',
];

const DEFAULT_VALUED = [
  'Strong user understanding',
  'Evidence-based approach',
  'Clear improvement in Iteration 2',
  'Well structured final demo',
];

const DEFAULT_IMPROVE = [
  'Consider edge cases',
  'Test with a slightly larger user group',
  'Explore long-term engagement metrics',
];

function badRequest(message, code) {
  const err = new Error(message);
  err.statusCode = 400;
  if (code) err.code = code;
  return err;
}

function notFound(message) {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

function forbidden(message, code) {
  const err = new Error(message);
  err.statusCode = 403;
  if (code) err.code = code;
  return err;
}

function stageRank(stage) {
  const idx = STAGES.indexOf(stage);
  return idx < 0 ? 0 : idx;
}

function maxStage(a, b) {
  return stageRank(a) >= stageRank(b) ? a : b;
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => String(v || '').trim())
    .filter(Boolean)
    .slice(0, 20);
}

function asIdArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((v) => String(v)).filter(Boolean))];
}

async function findProjectBySlug(slug) {
  const project = await IndustryProject.findOne({
    where: {
      deletedAt: null,
      [Op.or]: [{ slug: String(slug) }, { id: Number(slug) || 0 }],
    },
  });
  if (!project) throw notFound('Project not found');
  return project;
}

async function findAcceptedMembership(studentId, projectId) {
  return ProjectTeamMember.findOne({
    where: { studentId, status: 'ACCEPTED' },
    include: [
      {
        model: ProjectTeam,
        as: 'team',
        required: true,
        where: { projectId, status: 'ACTIVE' },
      },
    ],
  });
}

async function requireActiveTeamForStudent(slug, studentId) {
  const project = await findProjectBySlug(slug);
  const membership = await findAcceptedMembership(studentId, project.id);
  if (!membership) {
    throw forbidden(
      'Join an active project team before continuing Stage 2',
      'ACTIVE_TEAM_REQUIRED',
    );
  }
  const team = await ProjectTeam.findByPk(membership.teamId, {
    include: [
      {
        model: IndustryProject,
        as: 'project',
        attributes: ['id', 'slug', 'title', 'companyName', 'teamSize', 'isFree'],
      },
      {
        model: ProjectTeamMember,
        as: 'members',
        include: [
          {
            model: StudentAccount,
            as: 'student',
            attributes: ['id', 'fullName', 'email', 'collegeName', 'domain'],
          },
        ],
      },
    ],
  });
  if (!team || team.status !== 'ACTIVE') {
    throw forbidden('Team must be ACTIVE', 'ACTIVE_TEAM_REQUIRED');
  }
  return { project, team };
}

function serializeProgress(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    teamId: String(row.teamId),
    projectId: String(row.projectId),
    currentStage: row.currentStage,
    checkpoints: row.checkpoints && typeof row.checkpoints === 'object' ? row.checkpoints : {},
    updatedByStudentId:
      row.updatedByStudentId != null ? String(row.updatedByStudentId) : null,
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
  };
}

function serializeSubmission(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    teamId: String(row.teamId),
    projectId: String(row.projectId),
    submissionCode: row.submissionCode || null,
    summary: row.summary || '',
    demoVideoUrl: row.demoVideoUrl || '',
    payload: row.payload && typeof row.payload === 'object' ? row.payload : {},
    status: row.status,
    submittedByStudentId:
      row.submittedByStudentId != null ? String(row.submittedByStudentId) : null,
    submittedAt: row.submittedAt ? new Date(row.submittedAt).toISOString() : null,
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
  };
}

function serializeFeedback(row, { includeDraft = false } = {}) {
  if (!row) return null;
  if (!includeDraft && row.status !== 'SUBMITTED') return null;
  return {
    id: String(row.id),
    teamId: String(row.teamId),
    projectId: String(row.projectId),
    submissionId: row.submissionId != null ? String(row.submissionId) : null,
    workedWell: row.workedWell || '',
    improved: row.improved || '',
    valuable: row.valuable || '',
    overall: row.overall || '',
    studentQuote:
      row.studentQuote ||
      'Your second iteration showed significant improvement. Excellent user research and clear evidence of impact.',
    rating: Number(row.rating) || 5,
    continuation: row.continuation,
    valuedPoints: asStringArray(row.valuedPoints),
    improvePoints: asStringArray(row.improvePoints),
    selectedStudentIds: asIdArray(row.selectedStudentIds),
    status: row.status,
    submittedAt: row.submittedAt ? new Date(row.submittedAt).toISOString() : null,
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
  };
}

function deriveOutcome(feedback, team) {
  if (!feedback || feedback.status !== 'SUBMITTED') {
    return {
      available: false,
      outcomeType: null,
      continuation: null,
      selectedStudentIds: [],
      paidContinuation: false,
      stage3Eligible: false,
    };
  }

  const acceptedIds = (team.members || [])
    .filter((m) => m.status === 'ACCEPTED')
    .map((m) => String(m.studentId));

  let selectedStudentIds = [];
  let outcomeType = 'COMPLETE_NO_CONTINUE';
  let paidContinuation = false;
  let stage3Eligible = false;

  if (feedback.continuation === 'entire_team') {
    selectedStudentIds = acceptedIds;
    outcomeType = 'SELECTED_TEAM';
    paidContinuation = true;
    stage3Eligible = true;
  } else if (feedback.continuation === 'selected_students') {
    const picked = asIdArray(feedback.selectedStudentIds).filter((id) =>
      acceptedIds.includes(id),
    );
    selectedStudentIds = picked.length ? picked : [String(team.leadStudentId)];
    outcomeType = 'SELECTED_INDIVIDUAL';
    paidContinuation = selectedStudentIds.length > 0;
    stage3Eligible = paidContinuation;
  }

  return {
    available: true,
    outcomeType,
    continuation: feedback.continuation,
    selectedStudentIds,
    paidContinuation,
    stage3Eligible,
    overall: feedback.overall || '',
    rating: Number(feedback.rating) || 5,
  };
}

async function ensureProgress(teamId, projectId, studentId) {
  let row = await ProjectStageProgress.findOne({ where: { teamId } });
  if (row) return row;
  return ProjectStageProgress.create({
    uuid: crypto.randomUUID(),
    teamId,
    projectId,
    currentStage: 'WORKSPACE',
    checkpoints: { ready: {}, doProof: {} },
    updatedByStudentId: studentId || null,
  });
}

async function ensureSubmission(teamId, projectId) {
  let row = await ProjectSubmission.findOne({ where: { teamId } });
  if (row) return row;
  return ProjectSubmission.create({
    uuid: crypto.randomUUID(),
    teamId,
    projectId,
    status: 'DRAFT',
    payload: {},
  });
}

async function getStageBundleForStudent(slug, studentId) {
  const { project, team } = await requireActiveTeamForStudent(slug, studentId);
  const [progress, submission, feedback] = await Promise.all([
    ensureProgress(team.id, project.id, studentId),
    ProjectSubmission.findOne({ where: { teamId: team.id } }),
    ProjectOwnerFeedback.findOne({ where: { teamId: team.id } }),
  ]);

  const feedbackPublic = serializeFeedback(feedback);
  return {
    project: {
      id: String(project.id),
      slug: project.slug,
      title: project.title,
      companyName: project.companyName || '',
    },
    teamId: String(team.id),
    progress: serializeProgress(progress),
    submission: serializeSubmission(submission),
    ownerFeedback: feedbackPublic,
    outcome: deriveOutcome(feedback, team),
  };
}

async function updateProgressForStudent(slug, studentId, body) {
  const { project, team } = await requireActiveTeamForStudent(slug, studentId);
  const progress = await ensureProgress(team.id, project.id, studentId);

  const nextCheckpoints = {
    ...(progress.checkpoints && typeof progress.checkpoints === 'object'
      ? progress.checkpoints
      : {}),
  };
  if (body.checkpoints && typeof body.checkpoints === 'object') {
    if (body.checkpoints.ready && typeof body.checkpoints.ready === 'object') {
      nextCheckpoints.ready = {
        ...(nextCheckpoints.ready || {}),
        ...body.checkpoints.ready,
      };
    }
    if (body.checkpoints.doProof && typeof body.checkpoints.doProof === 'object') {
      nextCheckpoints.doProof = {
        ...(nextCheckpoints.doProof || {}),
        ...body.checkpoints.doProof,
      };
    }
  }

  let nextStage = progress.currentStage;
  if (body.currentStage && STAGES.includes(body.currentStage)) {
    // Students may advance up to SUBMIT/REVIEW; later stages come from admin feedback.
    const allowedStudentMax = 'REVIEW';
    if (stageRank(body.currentStage) <= stageRank(allowedStudentMax)) {
      nextStage = maxStage(progress.currentStage, body.currentStage);
    }
  }

  progress.checkpoints = nextCheckpoints;
  progress.currentStage = nextStage;
  progress.updatedByStudentId = studentId;
  await progress.save();

  return serializeProgress(progress);
}

async function submitProjectForStudent(slug, studentId, body) {
  const { project, team } = await requireActiveTeamForStudent(slug, studentId);
  const progress = await ensureProgress(team.id, project.id, studentId);
  const submission = await ensureSubmission(team.id, project.id);

  const now = new Date();
  const code =
    submission.submissionCode ||
    `IMR-STG2-${String(team.id).padStart(4, '0')}-${now.getFullYear()}`;

  submission.summary = body.summary != null ? String(body.summary) : submission.summary;
  submission.demoVideoUrl =
    body.demoVideoUrl != null ? String(body.demoVideoUrl) : submission.demoVideoUrl;
  submission.payload = {
    ...(submission.payload && typeof submission.payload === 'object'
      ? submission.payload
      : {}),
    ...(body.payload && typeof body.payload === 'object' ? body.payload : {}),
  };
  submission.submissionCode = code;
  submission.submittedByStudentId = studentId;
  submission.status = 'SUBMITTED';
  submission.submittedAt = now;
  await submission.save();

  progress.currentStage = maxStage(progress.currentStage, 'REVIEW');
  progress.updatedByStudentId = studentId;
  await progress.save();

  return {
    progress: serializeProgress(progress),
    submission: serializeSubmission(submission),
  };
}

async function getOwnerFeedbackForStudent(slug, studentId) {
  const { project, team } = await requireActiveTeamForStudent(slug, studentId);
  const feedback = await ProjectOwnerFeedback.findOne({ where: { teamId: team.id } });
  return {
    project: {
      id: String(project.id),
      slug: project.slug,
      title: project.title,
      companyName: project.companyName || '',
    },
    teamId: String(team.id),
    ownerFeedback: serializeFeedback(feedback),
    outcome: deriveOutcome(feedback, team),
  };
}

async function getOutcomeForStudent(slug, studentId) {
  const bundle = await getOwnerFeedbackForStudent(slug, studentId);
  if (bundle.ownerFeedback) {
    const progress = await ProjectStageProgress.findOne({
      where: { teamId: bundle.teamId },
    });
    if (progress) {
      progress.currentStage = maxStage(progress.currentStage, 'OUTCOME');
      await progress.save();
    }
  }
  return bundle;
}

function serializeAdminMember(member, leadStudentId) {
  const student = member.student;
  return {
    id: String(member.id),
    studentId: String(member.studentId),
    studentName: student?.fullName || 'Student',
    studentEmail: student?.email || '',
    collegeName: student?.collegeName || '',
    domain: student?.domain || '',
    status: member.status,
    isLead: String(member.studentId) === String(leadStudentId),
  };
}

function serializeAdminReviewRow(team, submission, feedback, progress) {
  const accepted = (team.members || []).filter((m) => m.status === 'ACCEPTED');
  return {
    teamId: String(team.id),
    teamName: team.name || 'Team',
    teamStatus: team.status,
    projectId: String(team.projectId),
    projectSlug: team.project?.slug || '',
    projectTitle: team.project?.title || '',
    projectCompanyName: team.project?.companyName || '',
    leadStudentId: String(team.leadStudentId),
    memberCount: accepted.length,
    members: accepted.map((m) => serializeAdminMember(m, team.leadStudentId)),
    submission: serializeSubmission(submission),
    ownerFeedback: serializeFeedback(feedback, { includeDraft: true }),
    progress: serializeProgress(progress),
    feedbackStatus: feedback?.status || 'NONE',
    submissionStatus: submission?.status || 'NONE',
    updatedAt:
      feedback?.updatedAt ||
      submission?.updatedAt ||
      progress?.updatedAt ||
      team.updatedAt ||
      null,
  };
}

async function listAdminReviews({ page = 1, pageSize = 20, status } = {}) {
  const offset = (Math.max(1, page) - 1) * pageSize;

  const submissionWhere = {};
  if (status === 'AWAITING_FEEDBACK') {
    submissionWhere.status = { [Op.in]: ['SUBMITTED', 'UNDER_REVIEW'] };
  } else if (status === 'FEEDBACK_READY') {
    submissionWhere.status = 'FEEDBACK_READY';
  } else if (status === 'SUBMITTED') {
    submissionWhere.status = { [Op.in]: ['SUBMITTED', 'UNDER_REVIEW', 'FEEDBACK_READY'] };
  }

  const { rows, count } = await ProjectTeam.findAndCountAll({
    where: { status: 'ACTIVE' },
    include: [
      {
        model: IndustryProject,
        as: 'project',
        attributes: ['id', 'slug', 'title', 'companyName'],
        required: true,
      },
      {
        model: ProjectTeamMember,
        as: 'members',
        include: [
          {
            model: StudentAccount,
            as: 'student',
            attributes: ['id', 'fullName', 'email', 'collegeName', 'domain'],
          },
        ],
      },
      {
        model: ProjectSubmission,
        as: 'submission',
        required: status === 'AWAITING_FEEDBACK' || status === 'FEEDBACK_READY' || status === 'SUBMITTED',
        where: Object.keys(submissionWhere).length ? submissionWhere : undefined,
      },
      { model: ProjectOwnerFeedback, as: 'ownerFeedback', required: false },
      { model: ProjectStageProgress, as: 'stageProgress', required: false },
    ],
    order: [['updatedAt', 'DESC']],
    limit: pageSize,
    offset,
    distinct: true,
  });

  return {
    reviews: rows.map((team) =>
      serializeAdminReviewRow(
        team,
        team.submission,
        team.ownerFeedback,
        team.stageProgress,
      ),
    ),
    total: count,
    page: Math.max(1, page),
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
  };
}

async function getAdminReviewPacket(teamId) {
  const team = await ProjectTeam.findByPk(teamId, {
    include: [
      {
        model: IndustryProject,
        as: 'project',
        attributes: [
          'id',
          'slug',
          'title',
          'companyName',
          'description',
          'overview',
          'teamSize',
        ],
      },
      {
        model: ProjectTeamMember,
        as: 'members',
        include: [
          {
            model: StudentAccount,
            as: 'student',
            attributes: ['id', 'fullName', 'email', 'collegeName', 'domain'],
          },
        ],
      },
      { model: ProjectSubmission, as: 'submission' },
      { model: ProjectOwnerFeedback, as: 'ownerFeedback' },
      { model: ProjectStageProgress, as: 'stageProgress' },
    ],
  });
  if (!team) throw notFound('Team not found');

  return {
    ...serializeAdminReviewRow(
      team,
      team.submission,
      team.ownerFeedback,
      team.stageProgress,
    ),
    projectOverview: team.project?.overview || team.project?.description || '',
  };
}

async function upsertAdminOwnerFeedback(teamId, adminId, body, { submit = false } = {}) {
  const team = await ProjectTeam.findByPk(teamId, {
    include: [
      {
        model: ProjectTeamMember,
        as: 'members',
        where: { status: 'ACCEPTED' },
        required: false,
      },
      { model: ProjectSubmission, as: 'submission' },
      { model: ProjectOwnerFeedback, as: 'ownerFeedback' },
      { model: ProjectStageProgress, as: 'stageProgress' },
    ],
  });
  if (!team) throw notFound('Team not found');
  if (team.status !== 'ACTIVE') {
    throw badRequest('Only ACTIVE teams can receive owner feedback');
  }

  const acceptedIds = (team.members || []).map((m) => String(m.studentId));
  const continuation = body.continuation || 'entire_team';
  let selectedStudentIds = asIdArray(body.selectedStudentIds);

  if (continuation === 'selected_students') {
    selectedStudentIds = selectedStudentIds.filter((id) => acceptedIds.includes(id));
    if (submit && selectedStudentIds.length === 0) {
      throw badRequest('Select at least one student for continuation');
    }
  } else if (continuation === 'entire_team') {
    selectedStudentIds = acceptedIds;
  } else {
    selectedStudentIds = [];
  }

  const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
  const workedWell = String(body.workedWell || '').trim();
  const improved = String(body.improved || '').trim();
  const valuable = String(body.valuable || '').trim();
  const overall = String(body.overall || '').trim();

  if (submit) {
    if (!workedWell || !improved || !valuable || !overall) {
      throw badRequest('All four feedback fields are required before submit');
    }
  }

  let feedback = team.ownerFeedback;
  if (!feedback) {
    feedback = await ProjectOwnerFeedback.create({
      uuid: crypto.randomUUID(),
      teamId: team.id,
      projectId: team.projectId,
      submissionId: team.submission?.id || null,
      adminId: adminId || null,
      workedWell,
      improved,
      valuable,
      overall,
      studentQuote: body.studentQuote || null,
      rating,
      continuation,
      valuedPoints: asStringArray(body.valuedPoints).length
        ? asStringArray(body.valuedPoints)
        : DEFAULT_VALUED,
      improvePoints: asStringArray(body.improvePoints).length
        ? asStringArray(body.improvePoints)
        : DEFAULT_IMPROVE,
      selectedStudentIds,
      status: 'DRAFT',
    });
  } else {
    feedback.workedWell = workedWell;
    feedback.improved = improved;
    feedback.valuable = valuable;
    feedback.overall = overall;
    if (body.studentQuote != null) feedback.studentQuote = String(body.studentQuote);
    feedback.rating = rating;
    feedback.continuation = continuation;
    feedback.valuedPoints = asStringArray(body.valuedPoints).length
      ? asStringArray(body.valuedPoints)
      : feedback.valuedPoints || DEFAULT_VALUED;
    feedback.improvePoints = asStringArray(body.improvePoints).length
      ? asStringArray(body.improvePoints)
      : feedback.improvePoints || DEFAULT_IMPROVE;
    feedback.selectedStudentIds = selectedStudentIds;
    feedback.adminId = adminId || feedback.adminId;
    if (team.submission?.id) feedback.submissionId = team.submission.id;
  }

  if (submit) {
    feedback.status = 'SUBMITTED';
    feedback.submittedAt = new Date();
  } else {
    feedback.status = feedback.status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT';
  }
  await feedback.save();

  if (submit) {
    if (team.submission) {
      team.submission.status = 'FEEDBACK_READY';
      await team.submission.save();
    }
    let progress = team.stageProgress;
    if (!progress) {
      progress = await ensureProgress(team.id, team.projectId, null);
    }
    progress.currentStage = maxStage(progress.currentStage, 'OWNER_FEEDBACK');
    await progress.save();
  }

  const refreshed = await getAdminReviewPacket(teamId);
  return refreshed;
}

module.exports = {
  STAGES,
  getStageBundleForStudent,
  updateProgressForStudent,
  submitProjectForStudent,
  getOwnerFeedbackForStudent,
  getOutcomeForStudent,
  listAdminReviews,
  getAdminReviewPacket,
  upsertAdminOwnerFeedback,
};
