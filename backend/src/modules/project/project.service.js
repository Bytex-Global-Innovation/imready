'use strict';

const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  setupCoreAssociations,
  IndustryProject,
  ProjectApplication,
  StudentAccount,
} = require('@modules/project/project.associations');
const Assessment = require('@modules/assessment/assessment.model');
const ProjectCategory = require('@modules/project/project-category.model');

setupCoreAssociations();

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function notFound(message) {
  const err = new Error(message || 'Resource not found');
  err.statusCode = 404;
  return err;
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

function parseMoneyAmount(value, fieldLabel) {
  if (value == null || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    throw badRequest(`${fieldLabel} must be a non-negative number`);
  }
  if (num === 0) return null;
  return Math.round(num * 100) / 100;
}

function serializeMoneyColumn(raw) {
  if (raw == null || raw === '') return null;
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

function serializeProjectPrice(project) {
  if (project.isFree) return null;
  return serializeMoneyColumn(project.projectPriceAmount);
}

function toDateOnlyString(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return /^\d{4}-\d{2}-\d{2}/.test(trimmed) ? trimmed.slice(0, 10) : null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return null;
}

function startOfUtcDay(dateOnly) {
  const [y, m, d] = String(dateOnly).split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function addDaysToDateOnly(dateOnly, days) {
  const ms = startOfUtcDay(dateOnly) + Number(days) * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString().slice(0, 10);
}

function diffDaysRemaining(closesAtDateOnly, todayDateOnly) {
  const diffMs = startOfUtcDay(closesAtDateOnly) - startOfUtcDay(todayDateOnly);
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

function resolveApplicationWindow(project) {
  const today = todayDateOnly();
  const opensAt =
    toDateOnlyString(project.applyOpensAt) ||
    toDateOnlyString(project.createdAt) ||
    today;
  let closesAt = toDateOnlyString(project.applyClosesAt);
  const windowDays =
    project.applyWindowDays != null && Number(project.applyWindowDays) > 0
      ? Number(project.applyWindowDays)
      : null;

  if (!closesAt && windowDays) {
    closesAt = addDaysToDateOnly(opensAt, windowDays);
  }

  const notYetOpen = startOfUtcDay(today) < startOfUtcDay(opensAt);
  const isClosed = closesAt ? startOfUtcDay(today) > startOfUtcDay(closesAt) : false;
  const remainingDays = closesAt && !isClosed ? diffDaysRemaining(closesAt, today) : closesAt ? 0 : null;

  return {
    applyOpensAt: opensAt,
    applyClosesAt: closesAt,
    applyWindowDays: windowDays,
    remainingDays,
    applicationsOpen: !notYetOpen && !isClosed,
    applicationsClosed: isClosed,
    applicationsNotYetOpen: notYetOpen,
  };
}

function defaultWhatYouGain() {
  return [
    'Work on a real product problem',
    'Build industry-relevant skills',
    'Get verified proof of work',
    'Potential opportunity for paid continuation (Stage 3)',
  ];
}

function serializeAdminProject(project) {
  return {
    id: String(project.id),
    uuid: project.uuid,
    slug: project.slug,
    name: project.title,
    title: project.title,
    domain: project.category,
    category: project.category,
    badge: project.badge,
    isFree: Boolean(project.isFree),
    projectPriceAmount: serializeProjectPrice(project),
    description: project.description,
    imageSrc: project.imageSrc,
    imageAlt: project.imageAlt,
    requirements: project.requirements || [],
    techStack: project.techStack || [],
    estimatedTime: project.estimatedTime,
    level: project.level,
    overview: project.overview,
    briefRequirements: project.briefRequirements || [],
    deliverables: project.deliverables || [],
    evaluationCriteria: project.evaluationCriteria || [],
    resources: project.resources || [],
    companyName: project.companyName || '',
    whatYouGain: project.whatYouGain || [],
    cohortStarts: project.cohortStarts || '',
    mentorshipLabel: project.mentorshipLabel || 'Verified Industry Partner',
    teamFormationNote: project.teamFormationNote || '',
    applyOpensAt: toDateOnlyString(project.applyOpensAt),
    applyClosesAt: toDateOnlyString(project.applyClosesAt),
    applyWindowDays: project.applyWindowDays != null ? Number(project.applyWindowDays) : null,
    teamSize: project.teamSize,
    status: project.status,
  };
}

function formatTeamSizeLabel(teamSize) {
  const n = Number(teamSize) || 1;
  if (n <= 1) return '1 student';
  return `2–${n} students`;
}

function teamSizeBounds(teamSize) {
  const max = Math.max(1, Number(teamSize) || 1);
  const min = max <= 1 ? 1 : Math.min(2, max);
  return { teamSizeMin: min, teamSizeMax: max };
}

function serializeStudentProject(project) {
  const techStack = (project.techStack || []).map((label) =>
    typeof label === 'string' ? { label } : { label: label.label || String(label) },
  );
  const requirements = (project.requirements || [])
    .map((item) => (typeof item === 'string' ? item : item?.label || String(item)))
    .filter(Boolean);
  const techLabels = techStack.map((item) => item.label).filter(Boolean);
  // Prefer admin requirements on cards; fall back to tech stack.
  const tags = [...new Set([...(requirements.length ? requirements : techLabels)])];
  const gains = Array.isArray(project.whatYouGain) && project.whatYouGain.length
    ? project.whatYouGain
    : defaultWhatYouGain();
  const applicationWindow = resolveApplicationWindow(project);
  return {
    id: project.slug,
    dbId: String(project.id),
    category: project.category,
    badge: project.badge || '',
    isFree: Boolean(project.isFree),
    projectPriceAmount: serializeProjectPrice(project),
    title: project.title,
    companyName: project.companyName || project.mentorName || '',
    description: project.description,
    imageSrc: project.imageSrc,
    imageAlt: project.imageAlt || project.title,
    requirements,
    techStack,
    tags,
    estimatedTime: project.estimatedTime || '',
    teamSize: Number(project.teamSize) || 1,
    teamSizeLabel: formatTeamSizeLabel(project.teamSize),
    ...teamSizeBounds(project.teamSize),
    level: project.level,
    overview: project.overview,
    briefRequirements: project.briefRequirements || [],
    deliverables: project.deliverables || [],
    evaluationCriteria: project.evaluationCriteria || [],
    resources: project.resources || [],
    whatYouGain: gains,
    cohortStarts: project.cohortStarts || 'To be announced',
    mentorshipLabel: project.mentorshipLabel || 'Verified Industry Partner',
    teamFormationNote:
      project.teamFormationNote ||
      'Submit your interest to form or join an active team.',
    ...applicationWindow,
  };
}

async function ensureUniqueSlug(baseSlug, excludeId) {
  let slug = baseSlug || `project-${crypto.randomBytes(4).toString('hex')}`;
  let attempt = 0;
  while (attempt < 20) {
    const where = { slug };
    if (excludeId != null) where.id = { [Op.ne]: excludeId };
    const existing = await IndustryProject.findOne({ where });
    if (!existing) return slug;
    attempt += 1;
    slug = `${baseSlug}-${attempt + 1}`;
  }
  return `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
}

async function resolveCategorySlug(categoryInput) {
  const value = String(categoryInput || '').trim();
  if (!value) throw badRequest('Category is required');

  const category = await ProjectCategory.findOne({
    where: {
      isActive: true,
      [Op.or]: [{ slug: value }, { id: Number(value) || 0 }],
    },
  });
  if (!category) {
    throw badRequest('Selected project category was not found or is inactive');
  }
  return category;
}

async function createProject(payload) {
  const category = await resolveCategorySlug(payload.category);
  const baseSlug = slugify(payload.slug || payload.title);
  const slug = await ensureUniqueSlug(baseSlug);

  const deliverables = (payload.deliverables || []).map((item, index) => ({
    id: item.id || `d${index + 1}`,
    label: item.label,
  }));

  const project = await IndustryProject.create({
    uuid: crypto.randomUUID(),
    slug,
    title: payload.title,
    category: category.slug,
    badge: payload.badge || category.name.toUpperCase().slice(0, 32),
    isFree: Boolean(payload.isFree),
    completionPayoutAmount: null,
    projectPriceAmount: payload.isFree
      ? null
      : parseMoneyAmount(payload.projectPriceAmount, 'Project price'),
    description: payload.description,
    imageSrc: payload.imageSrc || '',
    imageAlt: payload.imageAlt || payload.title,
    requirements: payload.requirements || [],
    techStack: payload.techStack || [],
    estimatedTime: payload.estimatedTime || '',
    level: payload.level || 'Intermediate Level',
    overview: payload.overview,
    briefRequirements: payload.briefRequirements || [],
    deliverables,
    evaluationCriteria: payload.evaluationCriteria || [],
    resources: payload.resources || [],
    mentorName: '',
    companyName: payload.companyName || '',
    whatYouGain: payload.whatYouGain || defaultWhatYouGain(),
    cohortStarts: payload.cohortStarts || '',
    mentorshipLabel: payload.mentorshipLabel || 'Verified Industry Partner',
    teamFormationNote: payload.teamFormationNote || '',
    applyOpensAt: toDateOnlyString(payload.applyOpensAt) || todayDateOnly(),
    applyClosesAt: toDateOnlyString(payload.applyClosesAt),
    applyWindowDays:
      payload.applyWindowDays != null && Number(payload.applyWindowDays) > 0
        ? Number(payload.applyWindowDays)
        : null,
    teamSize: payload.teamSize || 1,
    status: payload.status || 'ACTIVE',
  });

  return serializeAdminProject(project);
}

async function updateProject(id, payload) {
  const project = await IndustryProject.findByPk(id);
  if (!project || project.deletedAt) throw notFound('Project not found');

  const category = await resolveCategorySlug(payload.category);
  const baseSlug = slugify(payload.slug || payload.title);
  const slug = await ensureUniqueSlug(baseSlug, project.id);

  const deliverables = (payload.deliverables || []).map((item, index) => ({
    id: item.id || `d${index + 1}`,
    label: item.label,
  }));

  Object.assign(project, {
    slug,
    title: payload.title,
    category: category.slug,
    badge: payload.badge || category.name.toUpperCase().slice(0, 32),
    isFree: Boolean(payload.isFree),
    completionPayoutAmount: null,
    projectPriceAmount: payload.isFree
      ? null
      : parseMoneyAmount(payload.projectPriceAmount, 'Project price'),
    description: payload.description,
    imageSrc: payload.imageSrc || '',
    imageAlt: payload.imageAlt || payload.title,
    requirements: payload.requirements || [],
    techStack: payload.techStack || [],
    estimatedTime: payload.estimatedTime || '',
    level: payload.level || 'Intermediate Level',
    overview: payload.overview,
    briefRequirements: payload.briefRequirements || [],
    deliverables,
    evaluationCriteria: payload.evaluationCriteria || [],
    resources: payload.resources || [],
    mentorName: '',
    companyName: payload.companyName || project.companyName || '',
    whatYouGain: payload.whatYouGain || project.whatYouGain || defaultWhatYouGain(),
    cohortStarts: payload.cohortStarts != null ? payload.cohortStarts : project.cohortStarts || '',
    mentorshipLabel:
      payload.mentorshipLabel || project.mentorshipLabel || 'Verified Industry Partner',
    teamFormationNote:
      payload.teamFormationNote != null
        ? payload.teamFormationNote
        : project.teamFormationNote || '',
    applyOpensAt:
      toDateOnlyString(payload.applyOpensAt) ||
      toDateOnlyString(project.applyOpensAt) ||
      todayDateOnly(),
    applyClosesAt:
      payload.applyClosesAt === null || payload.applyClosesAt === ''
        ? null
        : toDateOnlyString(payload.applyClosesAt) || toDateOnlyString(project.applyClosesAt),
    applyWindowDays:
      payload.applyWindowDays === null || payload.applyWindowDays === ''
        ? null
        : payload.applyWindowDays != null && Number(payload.applyWindowDays) > 0
          ? Number(payload.applyWindowDays)
          : project.applyWindowDays,
    teamSize: payload.teamSize || 1,
    status: payload.status || project.status,
  });

  await project.save();
  return serializeAdminProject(project);
}

async function listAdminProjects({ page = 1, pageSize = 10, search } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const where = { deletedAt: null };
  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    where[Op.or] = [
      { title: { [Op.like]: term } },
      { badge: { [Op.like]: term } },
    ];
  }

  const { rows, count } = await IndustryProject.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    limit: pageSize,
    offset: (safePage - 1) * pageSize,
  });

  return {
    projects: rows.map(serializeAdminProject),
    page: safePage,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
    total: count,
  };
}

async function getAdminProject(id) {
  const project = await IndustryProject.findByPk(id);
  if (!project || project.deletedAt) throw notFound('Project not found');
  return serializeAdminProject(project);
}

async function deleteProject(id) {
  const project = await IndustryProject.findByPk(id);
  if (!project || project.deletedAt) throw notFound('Project not found');
  project.status = 'ARCHIVED';
  await project.save();
  await project.destroy();
  return { id: String(id), deleted: true };
}

async function listPublicProjects({ category, access } = {}) {
  const where = { status: 'ACTIVE', deletedAt: null };
  if (access === 'free') where.isFree = true;
  if (access === 'premium') where.isFree = false;
  if (category && String(category).trim()) {
    where.category = String(category).trim();
  }

  const rows = await IndustryProject.findAll({
    where,
    order: [['id', 'DESC']],
  });

  return { projects: rows.map(serializeStudentProject) };
}

async function getPublicProjectBySlug(slug, access) {
  const accessWhere = access === 'free' ? { isFree: true } : access === 'premium' ? { isFree: false } : {};
  const project = await IndustryProject.findOne({
    where: { slug, status: 'ACTIVE', deletedAt: null, ...accessWhere },
  });
  if (!project) throw notFound('Project not found');
  return serializeStudentProject(project);
}

async function applyToProject(slugOrId, payload) {
  let project = await IndustryProject.findOne({
    where: {
      [Op.or]: [{ slug: slugOrId }, { id: Number(slugOrId) || 0 }],
      status: 'ACTIVE',
      deletedAt: null,
    },
  });
  if (!project) throw notFound('Project not found');

  const email = String(payload.studentEmail).trim().toLowerCase();
  const studentService = require('@modules/student/student.service');

  if (project.isFree) {
    const unpaidUnlocked = await studentService.hasUnpaidProjectsUnlocked(email);
    if (!unpaidUnlocked) {
      const student = await StudentAccount.findOne({
        where: { email },
        attributes: ['foundationVerificationStatus', 'foundationCompletedAt'],
      });
      const status = student?.foundationVerificationStatus || 'NONE';
      const err = new Error(
        status === 'PENDING'
          ? 'Your Foundation submission is under admin review. You can apply after verification (usually 24–48 hours).'
          : status === 'FAILED'
            ? 'Your Foundation submission was not approved, so you cannot apply to unpaid projects yet.'
            : 'Complete the Foundation stage and get admin verification to apply for unpaid projects.',
      );
      err.statusCode = 403;
      err.code =
        status === 'PENDING' || status === 'FAILED'
          ? 'FOUNDATION_VERIFICATION_REQUIRED'
          : 'FOUNDATION_INCOMPLETE';
      throw err;
    }
  } else {
    const paidUnlocked = await studentService.hasProjectsUnlocked(email);
    if (!paidUnlocked) {
      const err = new Error(
        'Paid industry projects are not available yet. Check back later.',
      );
      err.statusCode = 403;
      err.code = 'PAID_PROJECTS_LOCKED';
      throw err;
    }
  }

  const window = resolveApplicationWindow(project);
  if (window.applicationsNotYetOpen) {
    const err = new Error(
      `Applications open on ${window.applyOpensAt}. Please check back then.`,
    );
    err.statusCode = 403;
    err.code = 'APPLICATIONS_NOT_OPEN';
    throw err;
  }
  if (window.applicationsClosed) {
    const err = new Error(
      'The application window for this project has closed.',
    );
    err.statusCode = 403;
    err.code = 'APPLICATIONS_CLOSED';
    throw err;
  }

  const existing = await ProjectApplication.findOne({
    where: { projectId: project.id, studentEmail: email },
  });
  if (existing) {
    throw badRequest('You have already applied to this project');
  }

  let studentId = payload.studentId || null;
  if (!studentId) {
    const student = await StudentAccount.findOne({ where: { email } });
    if (student) studentId = student.id;
  }

  const contributions = Array.isArray(payload.contributions)
    ? payload.contributions.map((item) => String(item).trim()).filter(Boolean)
    : [];

  const application = await ProjectApplication.create({
    uuid: crypto.randomUUID(),
    studentId,
    projectId: project.id,
    studentName: payload.studentName.trim(),
    studentEmail: email,
    motivation: payload.motivation ? String(payload.motivation).trim() : null,
    contributions,
    status: 'PENDING',
  });

  return {
    id: String(application.id),
    status: application.status,
    projectSlug: project.slug,
  };
}

function serializeAdminApplication(row) {
  const bounds = teamSizeBounds(row.project?.teamSize);
  return {
    id: String(row.id),
    uuid: row.uuid,
    studentId: row.studentId != null ? String(row.studentId) : null,
    studentName: row.studentName,
    studentEmail: row.studentEmail,
    motivation: row.motivation || '',
    contributions: Array.isArray(row.contributions) ? row.contributions : [],
    status: row.status,
    projectId: row.project ? String(row.project.id) : String(row.projectId),
    projectSlug: row.project?.slug || '',
    projectTitle: row.project?.title || '',
    projectCompanyName: row.project?.companyName || '',
    projectTeamSize: Number(row.project?.teamSize) || 1,
    projectTeamSizeLabel: formatTeamSizeLabel(row.project?.teamSize),
    ...bounds,
    submittedAt: row.createdAt
      ? new Date(row.createdAt).toISOString()
      : null,
    submittedAtLabel: row.createdAt
      ? new Date(row.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '',
  };
}

async function listAdminApplications({ page = 1, pageSize = 20, status, projectId } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const where = {};
  if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(String(status).toUpperCase())) {
    where.status = String(status).toUpperCase();
  }
  if (projectId) {
    where.projectId = Number(projectId) || 0;
  }

  const { rows, count } = await ProjectApplication.findAndCountAll({
    where,
    include: [
      {
        model: IndustryProject,
        as: 'project',
        attributes: ['id', 'slug', 'title', 'companyName', 'teamSize'],
      },
    ],
    order: [['id', 'DESC']],
    limit: pageSize,
    offset: (safePage - 1) * pageSize,
  });

  return {
    applications: rows.map(serializeAdminApplication),
    total: count,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
  };
}

async function getAdminApplication(id) {
  const row = await ProjectApplication.findByPk(id, {
    include: [
      {
        model: IndustryProject,
        as: 'project',
        attributes: ['id', 'slug', 'title', 'companyName', 'teamSize', 'isFree'],
      },
    ],
  });
  if (!row) throw notFound('Application not found');
  return serializeAdminApplication(row);
}

async function getDashboardSummary() {
  const [studentsCount, projectsCount, assessmentsCount, pendingApps, recent] =
    await Promise.all([
      StudentAccount.count(),
      IndustryProject.count({ where: { deletedAt: null } }),
      Assessment.count({ where: { deletedAt: null } }),
      ProjectApplication.count({ where: { status: 'PENDING' } }),
      ProjectApplication.findAll({
        include: [
          {
            model: IndustryProject,
            as: 'project',
            attributes: ['id', 'slug', 'title', 'companyName', 'teamSize'],
          },
        ],
        order: [['id', 'DESC']],
        limit: 8,
      }),
    ]);

  return {
    studentsCount,
    projectsCount,
    assessmentsCount,
    pendingApprovals: pendingApps,
    recentApplications: recent.map((row) => {
      const full = serializeAdminApplication(row);
      return {
        id: full.id,
        studentName: full.studentName,
        studentEmail: full.studentEmail,
        projectId: full.projectSlug || full.projectId,
        projectTitle: full.projectTitle,
        submittedAt: full.submittedAtLabel,
        status: full.status,
        motivation: full.motivation,
        contributions: full.contributions,
      };
    }),
  };
}

module.exports = {
  createProject,
  updateProject,
  listAdminProjects,
  getAdminProject,
  deleteProject,
  listPublicProjects,
  getPublicProjectBySlug,
  applyToProject,
  getDashboardSummary,
  listAdminApplications,
  getAdminApplication,
};
