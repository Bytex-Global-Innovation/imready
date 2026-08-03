'use strict';

const studentService = require('@container/student/studentService');

async function signup(req, res, next) {
  try {
    const result = await studentService.signup(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listStudents(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const result = await studentService.listStudents({ page, search, status });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  signup,
  listStudents,
};
