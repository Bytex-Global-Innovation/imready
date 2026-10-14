'use strict';

const jwt = require('jsonwebtoken');
const StudentAccount = require('@modules/student/student.model');
const { readAccessToken } = require('@modules/auth/student.cookies');

const STUDENT_ISSUER =
  process.env.JWT_STUDENT_ISSUER || 'imready-student';

function requireStudent(req, res, next) {
  const token = readAccessToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized', code: 'NO_ACCESS_TOKEN' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: STUDENT_ISSUER,
    });

    if (!payload || payload.role !== 'student' || payload.typ !== 'access') {
      return res.status(401).json({ message: 'Unauthorized', code: 'INVALID_ACCESS_TOKEN' });
    }

    req.student = {
      id: String(payload.id),
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch (err) {
    const code =
      err?.name === 'TokenExpiredError' ? 'ACCESS_TOKEN_EXPIRED' : 'INVALID_ACCESS_TOKEN';
    return res.status(401).json({ message: 'Unauthorized', code });
  }
}

async function requireVerifiedStudent(req, res, next) {
  requireStudent(req, res, async () => {
    try {
      if (res.headersSent) return;
      const student = await StudentAccount.findByPk(req.student.id);
      if (!student || !student.isActive) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!student.emailVerifiedAt) {
        return res.status(403).json({
          message: 'Please verify your email before continuing',
          code: 'EMAIL_NOT_VERIFIED',
        });
      }
      req.studentRecord = student;
      return next();
    } catch (err) {
      return next(err);
    }
  });
}

module.exports = {
  requireStudent,
  requireVerifiedStudent,
  STUDENT_ISSUER,
};
