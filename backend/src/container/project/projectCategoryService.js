'use strict';

const crypto = require('crypto');
const { Op } = require('sequelize');
const ProjectCategory = require('@container/project/projectCategoryModel');
const IndustryProject = require('@container/project/projectModel');

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function notFound(message) {
  const err = new Error(message || 'Category not found');
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

function serializeCategory(row) {
  return {
    id: String(row.id),
    uuid: row.uuid,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    isActive: Boolean(row.isActive),
  };
}

async function ensureUniqueSlug(baseSlug, excludeId) {
  let slug = baseSlug || `category-${crypto.randomBytes(3).toString('hex')}`;
  let attempt = 0;
  while (attempt < 20) {
    const where = { slug };
    if (excludeId != null) where.id = { [Op.ne]: excludeId };
    const existing = await ProjectCategory.findOne({ where });
    if (!existing) return slug;
    attempt += 1;
    slug = `${baseSlug}-${attempt + 1}`;
  }
  return `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
}

async function listCategories({ activeOnly = false } = {}) {
  const where = {};
  if (activeOnly) where.isActive = true;
  const rows = await ProjectCategory.findAll({
    where,
    order: [['name', 'ASC']],
  });
  return { categories: rows.map(serializeCategory) };
}

async function createCategory(payload) {
  const baseSlug = slugify(payload.slug || payload.name);
  const slug = await ensureUniqueSlug(baseSlug);
  const row = await ProjectCategory.create({
    uuid: crypto.randomUUID(),
    name: payload.name.trim(),
    slug,
    description: payload.description || '',
    isActive: payload.isActive !== false,
  });
  return serializeCategory(row);
}

async function updateCategory(id, payload) {
  const row = await ProjectCategory.findByPk(id);
  if (!row) throw notFound();
  const baseSlug = slugify(payload.slug || payload.name);
  const slug = await ensureUniqueSlug(baseSlug, row.id);
  row.name = payload.name.trim();
  row.slug = slug;
  row.description = payload.description || '';
  row.isActive = payload.isActive !== false;
  await row.save();
  return serializeCategory(row);
}

async function deleteCategory(id) {
  const row = await ProjectCategory.findByPk(id);
  if (!row) throw notFound();

  const inUse = await IndustryProject.count({
    where: { category: row.slug, deletedAt: null },
  });
  if (inUse > 0) {
    throw badRequest(
      `Cannot delete category "${row.name}" because ${inUse} project(s) use it`,
    );
  }

  await row.destroy();
  return { id: String(id), deleted: true };
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  serializeCategory,
};
