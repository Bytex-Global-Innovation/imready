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

async function listShareProblems(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const search = req.query.search || '';
    const result = await landingService.listShareProblems({
      page,
      pageSize,
      search,
    });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getShareProblem(req, res, next) {
  try {
    const result = await landingService.getShareProblem(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createShareProblem,
  listShareProblems,
  getShareProblem,
};
