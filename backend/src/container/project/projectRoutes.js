'use strict';

const express = require('express');
const path = require('path');
const projectController = require('@container/project/projectController');
const categoryController = require('@container/project/projectCategoryController');
const categoryService = require('@container/project/projectCategoryService');
const {
  validateBody,
  createProjectSchema,
  applyProjectSchema,
} = require('@container/project/projectValidator');
const {
  validateBody: validateCategoryBody,
  createCategorySchema,
} = require('@container/project/projectCategoryValidator');
const { requireAdmin } = require('@middleware/requireAdmin');
const { uploadProjectFile } = require('@middleware/uploadProjectFile');

const adminRouter = express.Router();
const publicRouter = express.Router();

adminRouter.use(requireAdmin);

adminRouter.get('/categories', categoryController.listCategories);
adminRouter.post(
  '/categories',
  validateCategoryBody(createCategorySchema),
  categoryController.createCategory,
);
adminRouter.put(
  '/categories/:id',
  validateCategoryBody(createCategorySchema),
  categoryController.updateCategory,
);
adminRouter.delete('/categories/:id', categoryController.deleteCategory);

adminRouter.post('/uploads', uploadProjectFile('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }
  const kind = String(req.query.kind || 'image').toLowerCase();
  const folder = kind === 'resource' ? 'resources' : 'images';
  const urlPath = `/uploads/projects/${folder}/${req.file.filename}`;
  const ext = path.extname(req.file.originalname || '').toLowerCase();
  const type = ext === '.zip' ? 'zip' : kind === 'resource' ? 'pdf' : 'image';
  return res.status(201).json({
    url: urlPath,
    filename: req.file.originalname,
    type,
  });
});

adminRouter.get('/', projectController.listAdminProjects);
adminRouter.post('/', validateBody(createProjectSchema), projectController.createProject);
adminRouter.get('/:id', projectController.getAdminProject);
adminRouter.put('/:id', validateBody(createProjectSchema), projectController.updateProject);
adminRouter.delete('/:id', projectController.deleteProject);

publicRouter.get('/categories', async (req, res, next) => {
  try {
    const result = await categoryService.listCategories({ activeOnly: true });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
});
publicRouter.get('/', projectController.listPublicProjects);
publicRouter.get('/:slug', projectController.getPublicProject);
publicRouter.post(
  '/:slug/apply',
  validateBody(applyProjectSchema),
  projectController.applyToProject,
);

module.exports = { adminRouter, publicRouter };
