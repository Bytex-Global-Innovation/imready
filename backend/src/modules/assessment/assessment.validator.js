'use strict';

const Joi = require('joi');

const ANSWER_TYPES = ['JUMBLED', 'PERSONAL', 'BOTH'];

const optionSchema = Joi.object({
  label: Joi.string().trim().min(1).max(1000).required(),
  correctOrder: Joi.number().integer().min(1).max(4).required(),
}).unknown(false);

const questionInputSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required(),
  prompt: Joi.string().trim().allow('').max(5000).default(''),
  question: Joi.string().trim().min(1).max(2000).required(),
  tips: Joi.array().items(Joi.string().trim().min(1).max(500)).max(10).default([]),
  answerType: Joi.string()
    .valid(...ANSWER_TYPES)
    .default('BOTH'),
  options: Joi.array().items(optionSchema).max(4).default([]),
  category: Joi.string().valid('OBSERVATION', 'THINKING', 'BUILDING').required(),
  jumbledOptionsMarks: Joi.number().min(0).max(100000).optional(),
  personalResponseMarks: Joi.number().min(0).max(100000).optional(),
  /** Optional question timer in seconds. Omit/null = no per-question lock. */
  durationSeconds: Joi.number().integer().min(30).max(3600).allow(null).optional(),
}).unknown(false);

const createQuestionSchema = questionInputSchema;

function validateQuestionOptions(question, helpers) {
  const answerType = question.answerType || 'BOTH';
  const needsJumbled = answerType === 'JUMBLED' || answerType === 'BOTH';
  const needsPersonal = answerType === 'PERSONAL' || answerType === 'BOTH';

  if (needsJumbled) {
    if (!question.options || question.options.length !== 4) {
      return helpers.error('any.custom', {
        message: 'Jumbled and combined questions must have exactly 4 options',
      });
    }
    const orders = question.options.map((o) => o.correctOrder).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i += 1) {
      if (orders[i] !== i + 1) {
        return helpers.error('any.custom', {
          message: 'Option correctOrder values must be unique and consecutive starting at 1',
        });
      }
    }
  } else if (question.options && question.options.length > 0) {
    return helpers.error('any.custom', {
      message: 'Personal-response-only questions must not include options',
    });
  }

  if (needsPersonal && question.personalResponseMarks != null && question.personalResponseMarks < 0) {
    return helpers.error('any.custom', {
      message: 'Personal response marks must be >= 0',
    });
  }

  return null;
}

const createAssessmentSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  domain: Joi.string().trim().min(1).max(120).default('General'),
  status: Joi.string().valid('ACTIVE', 'DRAFT', 'ARCHIVED').default('DRAFT'),
  questionCount: Joi.number().integer().min(1).max(50).required(),
  questionOrderMode: Joi.string()
    .valid('sequential', 'random', 'jumbled')
    .default('sequential'),
  jumbledOptionsMarks: Joi.number().min(0).max(1000).required(),
  personalResponseMarks: Joi.number().min(0).max(1000).required(),
  weightingMode: Joi.string().valid('EQUAL', 'INDIVIDUAL').default('EQUAL'),
  passMarks: Joi.number().min(0).max(100000).required(),
  /** Overall assessment time limit in minutes (auto-submit when reached). */
  durationMinutes: Joi.number().integer().min(1).max(480).required(),
  questionIds: Joi.array()
    .items(Joi.number().integer().positive())
    .default([]),
  questions: Joi.array().items(questionInputSchema).default([]),
})
  .custom((value, helpers) => {
    if (
      (!value.questionIds || value.questionIds.length === 0) &&
      (!value.questions || value.questions.length === 0)
    ) {
      return helpers.error('any.custom', {
        message: 'Select or add at least one question',
      });
    }
    for (const q of value.questions || []) {
      const answerType = q.answerType || 'BOTH';
      const needsJumbled = answerType === 'JUMBLED' || answerType === 'BOTH';
      const needsPersonal = answerType === 'PERSONAL' || answerType === 'BOTH';

      if (value.weightingMode === 'INDIVIDUAL') {
        if (needsJumbled && !Number.isFinite(q.jumbledOptionsMarks)) {
          return helpers.error('any.custom', {
            message: 'Each jumbled/combined question needs jumbled score caps when individual weighting is selected',
          });
        }
        if (needsPersonal && !Number.isFinite(q.personalResponseMarks)) {
          return helpers.error('any.custom', {
            message: 'Each personal/combined question needs personal score caps when individual weighting is selected',
          });
        }
      }

      const optionError = validateQuestionOptions(q, helpers);
      if (optionError) return optionError;
    }
    return value;
  })
  .messages({
    'any.custom': '{{#message}}',
  })
  .unknown(false);

const submitAssessmentSchema = Joi.object({
  studentName: Joi.string().trim().min(2).max(255).optional(),
  email: Joi.string().trim().email().max(255).optional(),
  collegeName: Joi.string().trim().min(2).max(255).optional(),
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.number().integer().positive().required(),
        optionOrder: Joi.array()
          .items(Joi.string().trim().min(1).max(64))
          .max(4)
          .default([]),
        personalResponse: Joi.string().trim().allow('').max(10000).default(''),
      }).unknown(false),
    )
    .min(1)
    .max(50)
    .required(),
}).unknown(false);

const personalScoreSchema = Joi.object({
  personalScore: Joi.number().min(0).max(100000).required(),
}).unknown(false);

const bulkDeleteResultsSchema = Joi.object({
  ids: Joi.array()
    .items(Joi.alternatives().try(Joi.number().integer().positive(), Joi.string().pattern(/^\d+$/)))
    .min(1)
    .max(200)
    .required(),
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
  ANSWER_TYPES,
  createQuestionSchema,
  createAssessmentSchema,
  submitAssessmentSchema,
  personalScoreSchema,
  bulkDeleteResultsSchema,
  validateBody,
};
