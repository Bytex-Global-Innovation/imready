'use strict';

const Joi = require('joi');

const deliverableSchema = Joi.object({
  id: Joi.string().trim().max(64).optional(),
  label: Joi.string().trim().min(1).max(500).required(),
}).unknown(false);

const criterionSchema = Joi.object({
  label: Joi.string().trim().min(1).max(255).required(),
  percent: Joi.number().min(0).max(100).required(),
}).unknown(false);

const resourceSchema = Joi.object({
  label: Joi.string().trim().min(1).max(255).required(),
  type: Joi.string().valid('pdf', 'zip').default('pdf'),
  href: Joi.string().trim().allow('').max(1000).default('#'),
}).unknown(false);

const createProjectSchema = Joi.object({
  title: Joi.string().trim().min(2).max(255).required(),
  slug: Joi.string().trim().max(160).optional().allow(''),
  category: Joi.string().trim().min(1).max(160).required(),
  badge: Joi.string().trim().max(64).allow('').default(''),
  isFree: Joi.boolean().default(false),
  projectPriceAmount: Joi.number().min(0).max(99999999).allow(null).optional(),
  description: Joi.string().trim().min(1).max(5000).required(),
  imageSrc: Joi.string().trim().allow('').max(1000).default(''),
  imageAlt: Joi.string().trim().allow('').max(255).default(''),
  requirements: Joi.array().items(Joi.string().trim().min(1).max(255)).min(1).required(),
  techStack: Joi.array().items(Joi.string().trim().min(1).max(120)).min(1).required(),
  estimatedTime: Joi.string().trim().max(64).default(''),
  level: Joi.string().trim().max(64).default('Intermediate Level'),
  overview: Joi.string().trim().min(1).max(10000).required(),
  briefRequirements: Joi.array()
    .items(Joi.string().trim().min(1).max(1000))
    .min(1)
    .required(),
  deliverables: Joi.array().items(deliverableSchema).min(1).required(),
  evaluationCriteria: Joi.array().items(criterionSchema).min(1).required(),
  resources: Joi.array().items(resourceSchema).default([]),
  companyName: Joi.string().trim().max(255).allow('').default(''),
  whatYouGain: Joi.array().items(Joi.string().trim().min(1).max(255)).max(12).default([]),
  cohortStarts: Joi.string().trim().max(120).allow('').default(''),
  mentorshipLabel: Joi.string().trim().max(255).allow('').default('Verified Industry Partner'),
  teamFormationNote: Joi.string().trim().max(500).allow('').default(''),
  applyOpensAt: Joi.string()
    .trim()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .allow('', null)
    .optional(),
  applyClosesAt: Joi.string()
    .trim()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .allow('', null)
    .optional(),
  applyWindowDays: Joi.number().integer().min(1).max(365).allow(null).optional(),
  teamSize: Joi.number().integer().min(1).max(100).default(1),
  status: Joi.string()
    .valid('ACTIVE', 'PENDING', 'REVIEW', 'ARCHIVED')
    .default('ACTIVE'),
}).unknown(false);

const applyProjectSchema = Joi.object({
  studentName: Joi.string().trim().min(2).max(255).optional(),
  studentEmail: Joi.string().trim().email().max(255).optional(),
  studentId: Joi.number().integer().positive().optional(),
  motivation: Joi.string().trim().max(1000).allow('').optional(),
  contributions: Joi.array()
    .items(Joi.string().trim().min(1).max(64))
    .max(12)
    .optional(),
}).unknown(false);

const facultyMemberSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
  email: Joi.string().trim().email().max(255).allow('').optional(),
}).unknown(false);

const upsertTeamSchema = Joi.object({
  name: Joi.string().trim().max(120).allow('').optional(),
  leadStudentId: Joi.alternatives()
    .try(Joi.number().integer().positive(), Joi.string().trim().pattern(/^\d+$/))
    .optional(),
  faculty: Joi.array().items(facultyMemberSchema).max(2).optional(),
}).unknown(false);

const inviteTeamMemberSchema = Joi.object({
  studentId: Joi.alternatives()
    .try(Joi.number().integer().positive(), Joi.string().trim().pattern(/^\d+$/))
    .required(),
}).unknown(false);

const finalizeTeamSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).optional(),
  leadStudentId: Joi.alternatives()
    .try(Joi.number().integer().positive(), Joi.string().trim().pattern(/^\d+$/))
    .optional(),
  faculty: Joi.array().items(facultyMemberSchema).max(2).optional(),
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
  createProjectSchema,
  applyProjectSchema,
  upsertTeamSchema,
  inviteTeamMemberSchema,
  finalizeTeamSchema,
  validateBody,
};
