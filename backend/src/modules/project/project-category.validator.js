'use strict';

const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  slug: Joi.string().trim().max(160).allow('').optional(),
  description: Joi.string().trim().allow('').max(500).default(''),
  isActive: Joi.boolean().default(true),
}).unknown(false);

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: true,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        message: error.details[0]?.message || 'Invalid request',
      });
    }
    req.body = value;
    return next();
  };
}

module.exports = {
  createCategorySchema,
  validateBody,
};
