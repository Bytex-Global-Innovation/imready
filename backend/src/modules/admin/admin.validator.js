'use strict';

const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().trim().email().max(255).required().messages({
    'string.email': 'Enter a valid email address',
    'any.required': 'Email is required',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
    'string.empty': 'Password is required',
  }),
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

module.exports = { loginSchema, validateBody };
