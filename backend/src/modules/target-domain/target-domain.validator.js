'use strict';

const Joi = require('joi');

const domainSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  slug: Joi.string().trim().max(160).allow('').optional(),
  description: Joi.string().trim().max(500).allow('').default(''),
  isActive: Joi.boolean().default(true),
  isOther: Joi.boolean().default(false),
  sortOrder: Joi.number().integer().min(0).max(9999).default(0),
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
  createDomainSchema: domainSchema,
  validateBody,
};
