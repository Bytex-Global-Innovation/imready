'use strict';

const landingService = require('@modules/landing/landing.service');

async function createShareProblem(req, res, next) {
  try {
    const result = await landingService.createShareProblem(req.body);
    return res.status(201).json({
      success: true,
      message: 'Problem shared',
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createShareProblem,
};
