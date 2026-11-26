'use strict';

const Joi = require('joi');

const phaseSchema = Joi.object({
  phase: Joi.string().trim().max(40).required(),
  involvement: Joi.string().trim().max(40).required(),
  effort: Joi.string().trim().max(40).allow(null, '').optional(),
}).unknown(false);

const shareProblemSchema = Joi.object({
  name: Joi.string().trim().min(2).max(160).required(),
  company: Joi.string().trim().min(2).max(200).required(),
  email: Joi.string().trim().email().max(255).required(),
  phone: Joi.string().trim().min(8).max(40).required(),
  paymentReference: Joi.string()
    .trim()
    .min(4)
    .max(64)
    .pattern(/^[\w ./_-]+$/)
    .required(),
  ideaStage: Joi.string().valid('rough', 'defined').required(),
  problem: Joi.string().trim().min(15).max(5000).required(),
  blocker: Joi.string().trim().min(1).max(64).required(),
  blockerOther: Joi.string().trim().max(255).allow('').default(''),
  projectTypes: Joi.array()
    .items(Joi.string().trim().max(64))
    .min(1)
    .max(20)
    .required(),
  projectTypeOther: Joi.string().trim().max(255).allow('').default(''),
  readyPlan: Joi.array().items(phaseSchema).min(1).max(20).required(),
  message: Joi.string().trim().max(20000).allow('').default(''),
  source: Joi.string().trim().max(80).allow('').default('imready-admin-landing'),
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
  shareProblemSchema,
  validateBody,
};
