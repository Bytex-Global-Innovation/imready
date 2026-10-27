'use strict';

const crypto = require('crypto');
const { Op } = require('sequelize');
const TargetDomain = require('@modules/target-domain/target-domain.model');

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function notFound(message) {
  const err = new Error(message || 'Target domain not found');
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

function serializeDomain(row) {
  return {
    id: String(row.id),
    uuid: row.uuid,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    isActive: Boolean(row.isActive),
    isOther: Boolean(row.isOther),
    sortOrder: row.sortOrder,
  };
}

async function ensureUniqueSlug(baseSlug, excludeId) {
  let slug = baseSlug || `domain-${crypto.randomBytes(3).toString('hex')}`;
  let attempt = 0;
  while (attempt < 20) {
    const where = { slug };
    if (excludeId != null) where.id = { [Op.ne]: excludeId };
    const existing = await TargetDomain.findOne({ where });
    if (!existing) return slug;
    attempt += 1;
    slug = `${baseSlug}-${attempt + 1}`;
  }
  return `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
}

async function listDomains({ activeOnly = false } = {}) {
  const where = {};
  if (activeOnly) where.isActive = true;
  const rows = await TargetDomain.findAll({
    where,
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
  });
  return { domains: rows.map(serializeDomain) };
}

async function createDomain(payload) {
  if (payload.isOther) {
    const existingOther = await TargetDomain.findOne({ where: { isOther: true } });
    if (existingOther) {
      throw badRequest('An "Others" domain already exists. Edit that row instead.');
    }
  }
  const baseSlug = slugify(payload.slug || payload.name);
  const slug = await ensureUniqueSlug(baseSlug);
  const row = await TargetDomain.create({
    uuid: crypto.randomUUID(),
    name: payload.name.trim(),
    slug,
    description: payload.description || '',
    isActive: payload.isActive !== false,
    isOther: Boolean(payload.isOther),
    sortOrder: Number(payload.sortOrder) || 0,
  });
  return serializeDomain(row);
}

async function updateDomain(id, payload) {
  const row = await TargetDomain.findByPk(id);
  if (!row) throw notFound();

  if (payload.isOther && !row.isOther) {
    const existingOther = await TargetDomain.findOne({
      where: { isOther: true, id: { [Op.ne]: row.id } },
    });
    if (existingOther) {
      throw badRequest('Another "Others" domain already exists.');
    }
  }

  const baseSlug = slugify(payload.slug || payload.name);
  const slug = await ensureUniqueSlug(baseSlug, row.id);
  row.name = payload.name.trim();
  row.slug = slug;
  row.description = payload.description || '';
  row.isActive = payload.isActive !== false;
  row.isOther = Boolean(payload.isOther);
  row.sortOrder = Number(payload.sortOrder) || 0;
  await row.save();
  return serializeDomain(row);
}

async function deleteDomain(id) {
  const row = await TargetDomain.findByPk(id);
  if (!row) throw notFound();
  if (row.isOther) {
    throw badRequest('The "Others" option cannot be deleted. Deactivate it instead.');
  }
  await row.destroy();
  return { message: 'Target domain deleted' };
}

async function validateSignupDomains(slugs, otherText) {
  const unique = [...new Set((slugs || []).map((s) => String(s).trim()).filter(Boolean))];
  if (!unique.length) {
    throw badRequest('Select at least one target domain');
  }

  const rows = await TargetDomain.findAll({
    where: { slug: unique, isActive: true },
  });
  if (rows.length !== unique.length) {
    throw badRequest('One or more target domains are invalid or inactive');
  }

  const includesOther = rows.some((r) => r.isOther);
  if (includesOther) {
    const text = String(otherText || '').trim();
    if (!text) {
      throw badRequest('Please specify your target domain when selecting Others');
    }
  }

  return { slugs: unique, rows };
}

async function formatDomainsForStudent(slugs, otherText) {
  const { rows } = await validateSignupDomains(slugs, otherText);
  const labels = slugs.map((slug) => {
    const row = rows.find((r) => r.slug === slug);
    if (row?.isOther) return String(otherText).trim();
    return row?.name || slug;
  });
  return labels.join(', ');
}

module.exports = {
  listDomains,
  createDomain,
  updateDomain,
  deleteDomain,
  validateSignupDomains,
  formatDomainsForStudent,
};
