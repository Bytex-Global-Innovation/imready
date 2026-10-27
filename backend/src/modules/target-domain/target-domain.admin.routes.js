'use strict';

const express = require('express');
const controller = require('@modules/target-domain/target-domain.controller');
const {
  validateBody,
  createDomainSchema,
} = require('@modules/target-domain/target-domain.validator');
const { requireAdmin } = require('@modules/auth/admin.guard');

const router = express.Router();

router.use(requireAdmin);
router.get('/', controller.listAdmin);
router.post('/', validateBody(createDomainSchema), controller.create);
router.put('/:id', validateBody(createDomainSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
