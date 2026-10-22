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
    teamSize: project.teamSize,
    status: project.status,
  };
}

function serializeStudentProject(project) {
  return {
    id: project.slug,
    dbId: String(project.id),
    category: project.category,
    badge: project.badge,
    isFree: Boolean(project.isFree),
    projectPriceAmount: serializeProjectPrice(project),
    title: project.title,
    description: project.description,
    imageSrc: project.imageSrc,
    imageAlt: project.imageAlt || project.title,
    requirements: project.requirements || [],
    techStack: (project.techStack || []).map((label) =>
      typeof label === 'string' ? { label } : { label: label.label || String(label) },
    ),
    estimatedTime: project.estimatedTime,
    level: project.level,
    overview: project.overview,
    briefRequirements: project.briefRequirements || [],
    deliverables: project.deliverables || [],
    evaluationCriteria: project.evaluationCriteria || [],
    resources: project.resources || [],
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
      const err = new Error(
        'Complete the Foundation stage to apply for unpaid projects.',
      );
      err.statusCode = 403;
      err.code = 'FOUNDATION_INCOMPLETE';
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

  const application = await ProjectApplication.create({
    uuid: crypto.randomUUID(),
    studentId,
    projectId: project.id,
    studentName: payload.studentName.trim(),
    studentEmail: email,
    status: 'PENDING',
  });

  return {
    id: String(application.id),
    status: application.status,
    projectSlug: project.slug,
  };
}

async function getDashboardSummary() {
  const [studentsCount, projectsCount, assessmentsCount, pendingApps, recent] =
    await Promise.all([
      StudentAccount.count(),
      IndustryProject.count({ where: { deletedAt: null } }),
      Assessment.count({ where: { deletedAt: null } }),
      ProjectApplication.count({ where: { status: 'PENDING' } }),
      ProjectApplication.findAll({
        include: [{ model: IndustryProject, as: 'project', attributes: ['id', 'slug', 'title'] }],
        order: [['id', 'DESC']],
        limit: 8,
      }),
    ]);

  return {
    studentsCount,
    projectsCount,
    assessmentsCount,
    pendingApprovals: pendingApps,
    recentApplications: recent.map((row) => ({
      id: String(row.id),
      studentName: row.studentName,
      projectId: row.project?.slug || String(row.projectId),
      projectTitle: row.project?.title || '',
      submittedAt: row.createdAt
        ? new Date(row.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '',
      status: row.status,
    })),
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
};
