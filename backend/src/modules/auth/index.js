'use strict';

/**
 * Auth module — JWT cookies + role guards.
 * Login/signup handlers stay in admin/student modules; this folder owns access control.
 */
module.exports = {
  ...require('./admin.guard'),
  ...require('./student.guard'),
  ...require('./admin.cookies'),
  ...require('./student.cookies'),
};
