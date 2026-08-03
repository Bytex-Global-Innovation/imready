'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const StudentAccount = require('@container/student/studentModel');
const { DOMAIN_LABELS } = require('@container/student/studentValidator');

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function serializeStudent(student) {
  return {
    id: String(student.id),
    uuid: student.uuid,
    studentName: student.fullName,
    email: student.email,
    phone: `${student.countryCode} ${student.phone}`.trim(),
    college: student.collegeName,
    collegeName: student.collegeName,
    streamMajor: student.streamMajor,
    graduationYear: student.graduationYear,
    domain: student.domain,
    level: student.level,
    careerDoor: student.careerDoor,
    status: student.status,
    createdAt: student.createdAt,
  };
}

async function signup(payload) {
  const email = String(payload.email).trim().toLowerCase();
  const existing = await StudentAccount.findOne({ where: { email } });
  if (existing) {
    throw badRequest('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const domain = DOMAIN_LABELS[payload.targetDomain] || payload.targetDomain;

  const student = await StudentAccount.create({
    uuid: crypto.randomUUID(),
    fullName: payload.fullName.trim(),
    email,
    countryCode: payload.countryCode || '+91',
    phone: payload.phone.trim(),
    passwordHash,
    collegeName: payload.college.trim(),
    streamMajor: payload.streamMajor.trim(),
    graduationYear: String(payload.graduationYear),
    domain,
    level: 'Beginner',
    careerDoor: payload.careerDoor,
    status: 'PENDING',
    isActive: true,
  });

  const token = jwt.sign(
    { id: String(student.id), email: student.email, role: 'student' },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      issuer: process.env.JWT_ISSUER || 'imready-student',
    },
  );

  return {
    token,
    student: serializeStudent(student),
    redirectTo: payload.careerDoor === 'bytex-unlock' ? '/bytex' : '/dashboard',
  };
}

async function listStudents({ page = 1, pageSize = 10, search, status } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const where = {};

  if (status === 'VERIFIED' || status === 'PENDING' || status === 'FLAGGED') {
    where.status = status;
  }

  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    where[Op.or] = [
      { fullName: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { collegeName: { [Op.like]: term } },
      { domain: { [Op.like]: term } },
    ];
  }

  const { rows, count } = await StudentAccount.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    limit: pageSize,
    offset: (safePage - 1) * pageSize,
  });

  return {
    students: rows.map(serializeStudent),
    page: safePage,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
    total: count,
  };
}

module.exports = {
  signup,
  listStudents,
  serializeStudent,
};
