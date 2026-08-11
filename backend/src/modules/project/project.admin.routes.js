'use strict';

const express = require('express');
const path = require('path');
const projectController = require('@modules/project/project.controller');
const categoryController = require('@modules/project/project-category.controller');
const {
  validateBody,
  createProjectSchema,
} = require('@modules/project/project.validator');
const {
  validateBody: validateCategoryBody,
  createCategorySchema,
} = require('@modules/project/project-category.validator');
const { requireAdmin } = require('@modules/auth/admin.guard');
const { uploadProjectFile } = require('@middleware/upload-project-file.middleware');

const router = express.Router();

router.use(requireAdmin);

router.get('/categories', categoryController.listCategories);
router.post(
  '/categories',
  validateCategoryBody(createCategorySchema),
  categoryController.createCategory,
);
router.put(
  '/categories/:id',
  validateCategoryBody(createCategorySchema),
  categoryController.updateCategory,
);
router.delete('/categories/:id', categoryController.deleteCategory);

router.post('/uploads', uploadProjectFile('file'), (req, res) => {
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

router.get('/', projectController.listAdminProjects);
router.post('/', validateBody(createProjectSchema), projectController.createProject);
router.get('/:id', projectController.getAdminProject);
router.put('/:id', validateBody(createProjectSchema), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
