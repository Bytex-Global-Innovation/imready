'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const StudentAccount = require('@modules/student/student.model');
const AssessmentSubmission = require('@modules/assessment/assessment-submission.model');
const { DOMAIN_LABELS } = require('@modules/student/student.validator');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  frontendUrl,
  getLastSmtpError,
} = require('@modules/shared/mail.service');
const { STUDENT_ISSUER } = require('@modules/auth/student.guard');
const {
  REMEMBER_REFRESH_MS,
} = require('@modules/auth/student.cookies');

/** New signups must verify within this window or the pending account is deleted. */
const EMAIL_VERIFICATION_TTL_MS = 60 * 60 * 1000; // 1 hour

function badRequest(message, code) {
  const err = new Error(message);
  err.statusCode = 400;
  if (code) err.code = code;
  return err;
}

function unauthorized(message, code) {
  const err = new Error(message || 'Unauthorized');
  err.statusCode = 401;
  if (code) err.code = code;
  return err;
}

function forbidden(message, code) {
  const err = new Error(message);
  err.statusCode = 403;
  if (code) err.code = code;
  return err;
}

function redirectForDoor(careerDoor) {
  return careerDoor === 'bytex-unlock' ? '/bytex' : '/dashboard';
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function createRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

function accessExpiresIn() {
  return process.env.JWT_STUDENT_ACCESS_EXPIRES_IN || '15m';
}

function signAccessToken(student) {
  return jwt.sign(
    {
      id: String(student.id),
      email: student.email,
      role: 'student',
      typ: 'access',
    },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: accessExpiresIn(),
      issuer: STUDENT_ISSUER,
    },
  );
}

async function issueAuthSession(student, { rememberMe = false } = {}) {
  const accessToken = signAccessToken(student);
  const refreshToken = createRawToken();

  // Remember me: refresh cookie + DB validity = 7 days.
  // Without remember me: session cookie (browser close); DB safety net = 1 day.
  const dbRefreshMs = rememberMe
    ? REMEMBER_REFRESH_MS
    : 24 * 60 * 60 * 1000;

  student.refreshTokenHash = hashToken(refreshToken);
  student.refreshTokenExpiresAt = new Date(Date.now() + dbRefreshMs);
  student.refreshRememberMe = Boolean(rememberMe);
  await student.save();

  const projectsUnlocked = await hasPassedAssessment(student.email);

  return {
    accessToken,
    refreshToken,
    rememberMe: Boolean(rememberMe),
    refreshExpiresAt: student.refreshTokenExpiresAt,
    student: serializeStudent(student, { projectsUnlocked }),
    projectsUnlocked,
    redirectTo: redirectForDoor(student.careerDoor),
  };
}

async function clearRefreshSession(student) {
  if (!student) return;
  student.refreshTokenHash = null;
  student.refreshTokenExpiresAt = null;
  student.refreshRememberMe = false;
  await student.save();
}

/**
 * Delete first-time signups that never verified within the 1-hour window.
 * Only touches PENDING + unverified accounts — never verified students.
 */
async function purgeExpiredUnverifiedStudents() {
  const deleted = await StudentAccount.destroy({
    where: {
      emailVerifiedAt: null,
      status: 'PENDING',
      emailVerificationExpiresAt: { [Op.lt]: new Date() },
    },
  });

  if (deleted > 0) {
    console.log(
      `[students] Removed ${deleted} unverified signup(s) after 1-hour expiry`,
    );
  }

  return deleted;
}

function verificationExpiryDate() {
  return new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
}

async function hasPassedAssessment(email) {
  const row = await AssessmentSubmission.findOne({
    where: {
      email: String(email).trim().toLowerCase(),
      result: 'PASS',
    },
    attributes: ['id'],
  });
  return Boolean(row);
}

function serializeStudent(student, extras = {}) {
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
    emailVerified: Boolean(student.emailVerifiedAt),
    createdAt: student.createdAt,
    ...extras,
  };
}

async function signup(payload) {
  await purgeExpiredUnverifiedStudents();

  const email = String(payload.email).trim().toLowerCase();
  const existing = await StudentAccount.findOne({ where: { email } });
  if (existing) {
    throw badRequest('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const domain = DOMAIN_LABELS[payload.targetDomain] || payload.targetDomain;
  const rawToken = createRawToken();

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
    emailVerifiedAt: null,
    emailVerificationToken: hashToken(rawToken),
    emailVerificationExpiresAt: verificationExpiryDate(),
  });

  const mailResult = await sendVerificationEmail({
    email: student.email,
    fullName: student.fullName,
    token: rawToken,
    careerDoor: student.careerDoor,
  });

  const emailSent = Boolean(mailResult && mailResult.sent);
  const smtpError = getLastSmtpError();
  const response = {
    message: emailSent
      ? 'Account created. Please check your email and click Verify to continue.'
      : `Account created, but Gmail could not send the verification email.${
          smtpError ? ` Reason: ${smtpError}` : ''
        } Update SMTP_PASS with a Google App Password for ${process.env.SMTP_USER}, restart backend, then use Resend verification.`,
    email: student.email,
    requiresVerification: true,
    emailSent,
    redirectTo: redirectForDoor(student.careerDoor),
  };

  if (!emailSent) {
    response.smtpError = smtpError || 'Gmail SMTP unavailable';
  }

  if (!emailSent && process.env.NODE_ENV !== 'production') {
    response.devVerifyUrl = frontendUrl(
      `/verify-email?token=${encodeURIComponent(rawToken)}`,
    );
  }

  return response;
}

async function verifyEmail(token) {
  await purgeExpiredUnverifiedStudents();

  const hashed = hashToken(token);
  const student = await StudentAccount.findOne({
    where: {
      emailVerificationToken: hashed,
      emailVerificationExpiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!student) {
    throw badRequest(
      'Invalid or expired verification link. Please sign up again if your link has expired.',
    );
  }

  student.emailVerifiedAt = new Date();
  student.emailVerificationToken = null;
  student.emailVerificationExpiresAt = null;
  if (student.status === 'PENDING') {
    student.status = 'VERIFIED';
  }
  await student.save();

  return issueAuthSession(student, { rememberMe: false });
}

async function resendVerification(emailInput) {
  await purgeExpiredUnverifiedStudents();

  const email = String(emailInput).trim().toLowerCase();
  const student = await StudentAccount.findOne({ where: { email } });

  // Avoid account enumeration
  if (!student || student.emailVerifiedAt) {
    return {
      message:
        'If an unverified account exists for that email, a new verification link has been sent.',
    };
  }

  // Expired pending signup should already be purged; belt-and-suspenders.
  if (
    student.emailVerificationExpiresAt &&
    student.emailVerificationExpiresAt.getTime() <= Date.now()
  ) {
    await student.destroy();
    return {
      message:
        'If an unverified account exists for that email, a new verification link has been sent.',
    };
  }

  const rawToken = createRawToken();
  student.emailVerificationToken = hashToken(rawToken);
  student.emailVerificationExpiresAt = verificationExpiryDate();
  await student.save();

  await sendVerificationEmail({
    email: student.email,
    fullName: student.fullName,
    token: rawToken,
    careerDoor: student.careerDoor,
  });

  return {
    message:
      'If an unverified account exists for that email, a new verification link has been sent.',
  };
}

async function login({ email, password, rememberMe = false }) {
  await purgeExpiredUnverifiedStudents();

  const normalized = String(email).trim().toLowerCase();
  const student = await StudentAccount.findOne({ where: { email: normalized } });
  if (!student || !student.isActive) {
    throw unauthorized('Invalid email or password');
  }

  const ok = await bcrypt.compare(password, student.passwordHash);
  if (!ok) {
    throw unauthorized('Invalid email or password');
  }

  if (!student.emailVerifiedAt) {
    const expired =
      student.emailVerificationExpiresAt &&
      student.emailVerificationExpiresAt.getTime() <= Date.now();

    if (expired) {
      await student.destroy();
      throw unauthorized(
        'Your verification window expired. Please sign up again.',
        'VERIFICATION_EXPIRED',
      );
    }

    throw forbidden(
      'Please verify your email before logging in. Check your inbox for the verification link.',
      'EMAIL_NOT_VERIFIED',
    );
  }

  return issueAuthSession(student, { rememberMe: Boolean(rememberMe) });
}

async function refreshSession(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw unauthorized('Unauthorized', 'NO_REFRESH_TOKEN');
  }

  const hashed = hashToken(rawRefreshToken);
  const student = await StudentAccount.findOne({
    where: {
      refreshTokenHash: hashed,
      refreshTokenExpiresAt: { [Op.gt]: new Date() },
      isActive: true,
    },
  });

  if (!student || !student.emailVerifiedAt) {
    throw unauthorized('Unauthorized', 'INVALID_REFRESH_TOKEN');
  }

  const rememberMe = Boolean(student.refreshRememberMe);
  const absoluteExpiry = student.refreshTokenExpiresAt;

  // Rotate refresh token but keep the original absolute expiry (7-day cap).
  const accessToken = signAccessToken(student);
  const refreshToken = createRawToken();
  student.refreshTokenHash = hashToken(refreshToken);
  student.refreshTokenExpiresAt = absoluteExpiry;
  student.refreshRememberMe = rememberMe;
  await student.save();

  const projectsUnlocked = await hasPassedAssessment(student.email);

  return {
    accessToken,
    refreshToken,
    rememberMe,
    refreshExpiresAt: absoluteExpiry,
    student: serializeStudent(student, { projectsUnlocked }),
    projectsUnlocked,
    redirectTo: redirectForDoor(student.careerDoor),
  };
}

async function logout(studentId, rawRefreshToken) {
  let student = null;
  if (studentId) {
    student = await StudentAccount.findByPk(studentId);
  } else if (rawRefreshToken) {
    student = await StudentAccount.findOne({
      where: { refreshTokenHash: hashToken(rawRefreshToken) },
    });
  }

  if (student) {
    await clearRefreshSession(student);
  }

  return { message: 'Logged out' };
}

async function forgotPassword(emailInput) {
  const email = String(emailInput).trim().toLowerCase();
  const student = await StudentAccount.findOne({ where: { email } });

  if (student && student.isActive) {
    const rawToken = createRawToken();
    student.passwordResetToken = hashToken(rawToken);
    student.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await student.save();

    await sendPasswordResetEmail({
      email: student.email,
      fullName: student.fullName,
      token: rawToken,
    });
  }

  return {
    message:
      'If an account exists for that email, a password reset link has been sent.',
  };
}

async function resetPassword({ token, password }) {
  const hashed = hashToken(token);
  const student = await StudentAccount.findOne({
    where: {
      passwordResetToken: hashed,
      passwordResetExpiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!student) {
    throw badRequest('Invalid or expired password reset link');
  }

  student.passwordHash = await bcrypt.hash(password, 12);
  student.passwordResetToken = null;
  student.passwordResetExpiresAt = null;
  await student.save();

  return { message: 'Password updated successfully. You can now log in.' };
}

async function getMe(studentId) {
  const student = await StudentAccount.findByPk(studentId);
  if (!student || !student.isActive) {
    throw unauthorized('Unauthorized');
  }

  const projectsUnlocked = await hasPassedAssessment(student.email);
  return {
    student: serializeStudent(student, { projectsUnlocked }),
    projectsUnlocked,
    redirectTo: redirectForDoor(student.careerDoor),
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
    students: rows.map((row) => serializeStudent(row)),
    page: safePage,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
    total: count,
  };
}

module.exports = {
  signup,
  verifyEmail,
  resendVerification,
  login,
  refreshSession,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  listStudents,
  serializeStudent,
  hasPassedAssessment,
  redirectForDoor,
  purgeExpiredUnverifiedStudents,
  EMAIL_VERIFICATION_TTL_MS,
};
