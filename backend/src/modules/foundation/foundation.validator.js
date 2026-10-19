'use strict';

const Joi = require('joi');

const evidenceSchema = Joi.object({
  fileName: Joi.string().trim().max(255).allow(null, ''),
  fileType: Joi.string().trim().max(64).allow(null, ''),
  filePath: Joi.string().trim().max(512).allow(null, ''),
}).unknown(false);

const saveDraftSchema = Joi.object({
  answers: Joi.object().pattern(Joi.string(), Joi.alternatives().try(
    Joi.string().allow(''),
    Joi.array().items(Joi.string()),
  )).default({}),
  evidence: evidenceSchema.allow(null).default(null),
}).unknown(false);

const completeMissionSchema = saveDraftSchema;

const selectProblemSchema = Joi.object({
  problemStatementId: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().trim().pattern(/^\d+$/),
  ).required(),
}).unknown(false);

const problemStatementSchema = Joi.object({
  statementText: Joi.string().trim().min(10).max(2000).required(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).max(9999).optional(),
}).unknown(false);

const updateProblemStatementSchema = Joi.object({
  statementText: Joi.string().trim().min(10).max(2000).optional(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).max(9999).optional(),
}).unknown(false);

const missionConfigSchema = Joi.object({
  tipAdvisorLabel: Joi.string().trim().max(120).optional(),
  tipQuote: Joi.string().trim().max(4000).optional(),
  analyzeContextText: Joi.string().trim().max(4000).allow(null, '').optional(),
  patternTagOptions: Joi.array().items(Joi.string().trim().max(120)).allow(null).optional(),
  whyLayerLabels: Joi.array().items(
    Joi.object({
      key: Joi.string().trim().required(),
      label: Joi.string().trim().required(),
    }),
  ).allow(null).optional(),
  questions: Joi.array().items(
    Joi.object({
      answerKey: Joi.string().trim().required(),
      question: Joi.string().trim().allow('').optional(),
      label: Joi.string().trim().allow('').optional(),
      helper: Joi.string().trim().allow('').optional(),
      placeholder: Joi.string().trim().allow('').optional(),
    }),
  ).optional(),
  evidenceConfig: Joi.object().unknown(true).allow(null).optional(),
}).unknown(false);

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        message: error.details.map((d) => d.message).join('; '),
      });
    }
    req.body = value;
    return next();
  };
}

module.exports = {
  saveDraftSchema,
  completeMissionSchema,
  selectProblemSchema,
  problemStatementSchema,
  updateProblemStatementSchema,
  missionConfigSchema,
  validateBody,
};
