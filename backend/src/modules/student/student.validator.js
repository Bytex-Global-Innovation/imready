'use strict';

const Joi = require('joi');

const DOMAIN_LABELS = {
  ai: 'Artificial Intelligence',
  iot: 'IoT',
  'web-dev': 'Web Dev',
  product: 'Product',
};

const signupSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(255).required(),
  email: Joi.string().trim().email().max(255).required(),
  countryCode: Joi.string().trim().max(8).default('+91'),
  phone: Joi.string().trim().min(10).max(32).required(),
  password: Joi.string().min(6).max(128).required(),
  college: Joi.string().trim().min(2).max(255).required(),
  streamMajor: Joi.string().trim().min(1).max(120).required(),
  graduationYear: Joi.string().trim().max(8).required(),
  targetDomain: Joi.string()
    .valid('ai', 'iot', 'web-dev', 'product')
    .required(),
  careerDoor: Joi.string()
    .valid('written-challenge', 'bytex-unlock')
    .required(),
  agreedToTerms: Joi.boolean().valid(true).required(),
}).unknown(false);

const loginSchema = Joi.object({
  email: Joi.string().trim().email().max(255).required(),
  password: Joi.string().min(1).max(128).required(),
  rememberMe: Joi.boolean().default(false),
}).unknown(false);

const emailOnlySchema = Joi.object({
  email: Joi.string().trim().email().max(255).required(),
}).unknown(false);

const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().min(20).max(200).required(),
}).unknown(false);

const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().min(20).max(200).required(),
  password: Joi.string().min(8).max(128).required(),
}).unknown(false);

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const updateStudentSchema = Joi.object({
  studentName: Joi.string().trim().min(2).max(255).required(),
  email: Joi.string().trim().email().max(255).required(),
  college: Joi.string().trim().min(2).max(255).required(),
  domain: Joi.string().trim().min(1).max(120).required(),
  level: Joi.string().trim().min(1).max(64).required(),
  phone: Joi.string().trim().max(40).allow('').optional(),
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
  DOMAIN_LABELS,
  LEVELS,
  signupSchema,
  loginSchema,
  emailOnlySchema,
  verifyEmailSchema,
  resetPasswordSchema,
  updateStudentSchema,
  validateBody,
};
