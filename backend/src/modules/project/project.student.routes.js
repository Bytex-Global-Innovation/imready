'use strict';

const express = require('express');
const projectController = require('@modules/project/project.controller');
const categoryService = require('@modules/project/project-category.service');
const {
  validateBody,
  applyProjectSchema,
} = require('@modules/project/project.validator');
const { requireVerifiedStudent } = require('@modules/auth/student.guard');

const router = express.Router();

router.get('/categories', async (req, res, next) => {
  try {
    const result = await categoryService.listCategories({ activeOnly: true });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
});
router.get('/', projectController.listPublicProjects);
router.get('/:slug', projectController.getPublicProject);
router.post(
  '/:slug/apply',
  requireVerifiedStudent,
  validateBody(applyProjectSchema),
  projectController.applyToProject,
);

module.exports = router;
