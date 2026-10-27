'use strict';

const domainService = require('@modules/target-domain/target-domain.service');

async function listPublic(req, res, next) {
  try {
    const result = await domainService.listDomains({ activeOnly: true });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listAdmin(req, res, next) {
  try {
    const result = await domainService.listDomains({ activeOnly: false });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const result = await domainService.createDomain(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await domainService.updateDomain(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await domainService.deleteDomain(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listPublic,
  listAdmin,
  create,
  update,
  remove,
};
