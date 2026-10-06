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
  validateBody,
};
