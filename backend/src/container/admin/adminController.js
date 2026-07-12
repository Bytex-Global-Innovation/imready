'use strict';

const adminService = require('@container/admin/adminService');

async function login(req, res, next) {
  try {
    const result = await adminService.login(req.body.email, req.body.password);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { login };
