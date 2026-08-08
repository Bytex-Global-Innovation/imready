'use strict';

const categoryService = require('@container/project/projectCategoryService');

async function listCategories(req, res, next) {
  try {
    const activeOnly = String(req.query.activeOnly || '') === 'true';
    const result = await categoryService.listCategories({ activeOnly });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const result = await categoryService.createCategory(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const result = await categoryService.updateCategory(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
