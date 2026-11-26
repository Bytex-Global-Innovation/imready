'use strict';

const crypto = require('crypto');
const { Op } = require('sequelize');
const LandingShareProblem = require('@modules/landing/landing-submission.model');

function formatSubmittedAt(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function serializeClient(row, { includeMessage = false } = {}) {
  const base = {
    id: String(row.id),
    uuid: row.uuid,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    paymentReference: row.paymentReference,
    ideaStage: row.ideaStage,
    problem: row.problem,
    blocker: row.blocker,
    blockerOther: row.blockerOther || '',
    projectTypes: Array.isArray(row.projectTypes) ? row.projectTypes : [],
    projectTypeOther: row.projectTypeOther || '',
    readyPlan: Array.isArray(row.readyPlan) ? row.readyPlan : [],
    source: row.source,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    submittedAtLabel: formatSubmittedAt(row.createdAt),
  };

  if (includeMessage) {
    base.messageText = row.messageText || '';
  }

  return base;
}

async function createShareProblem(payload) {
  const row = await LandingShareProblem.create({
    uuid: crypto.randomUUID(),
    name: payload.name,
    company: payload.company,
    email: payload.email.toLowerCase(),
    phone: payload.phone,
    paymentReference: payload.paymentReference,
    ideaStage: payload.ideaStage,
    problem: payload.problem,
    blocker: payload.blocker,
    blockerOther: payload.blocker === 'other' ? payload.blockerOther || '' : '',
    projectTypes: payload.projectTypes,
    projectTypeOther: payload.projectTypes.includes('other')
      ? payload.projectTypeOther || ''
      : '',
    readyPlan: payload.readyPlan,
    messageText: payload.message || '',
    source: payload.source || 'imready-admin-landing',
  });

  return {
    id: String(row.id),
    uuid: row.uuid,
    createdAt: row.createdAt,
  };
}

async function listShareProblems({ page = 1, pageSize = 10, search } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(50, Math.max(1, Number(pageSize) || 10));
  const where = {};

  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    where[Op.or] = [
      { name: { [Op.like]: term } },
      { company: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { phone: { [Op.like]: term } },
      { paymentReference: { [Op.like]: term } },
    ];
  }

  const { rows, count } = await LandingShareProblem.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    limit: safePageSize,
    offset: (safePage - 1) * safePageSize,
  });

  return {
    clients: rows.map((row) => serializeClient(row)),
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(count / safePageSize)),
    total: count,
  };
}

async function getShareProblem(id) {
  const row = await LandingShareProblem.findByPk(id);
  if (!row) {
    const error = new Error('Client submission not found');
    error.status = 404;
    throw error;
  }
  return serializeClient(row, { includeMessage: true });
}

module.exports = {
  createShareProblem,
  listShareProblems,
  getShareProblem,
};
