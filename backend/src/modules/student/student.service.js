'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const StudentAccount = require('@modules/student/student.model');
const { DOMAIN_LABELS } = require('@modules/student/student.validator');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  frontendUrl,
  getLastMailError,
} = require('@modules/shared/mail.service');
const { STUDENT_ISSUER } = require('@modules/auth/student.guard');
const {
  REMEMBER_REFRESH_MS,
} = require('@modules/auth/student.cookies');
const {
  isFoundationCompleteForStudent,
} = require('@modules/foundation/foundation.service');
const config = require('@config/index');
const targetDomainService = require('@modules/target-domain/target-domain.service');

/** New signups must verify within this window or the pending account is deleted. */
const EMAIL_VERIFICATION_TTL_MS = 60 * 60 * 1000; // 1 hour

const SUBSCRIPTION = {
  FREE: 'FREE',
  PREMIUM_PENDING: 'PREMIUM_PENDING',
  PREMIUM: 'PREMIUM',
};

function subscriptionFromCareerDoor(careerDoor) {
  return careerDoor === 'bytex-unlock'
    ? SUBSCRIPTION.PREMIUM
    : SUBSCRIPTION.FREE;
}

function isPremiumUnlocked(student) {
  return student?.subscriptionStatus === SUBSCRIPTION.PREMIUM;
}

function verificationStatus(student) {
  if (student.status === 'FLAGGED') return 'FLAGGED';
  return student.emailVerifiedAt ? 'VERIFIED' : 'PENDING';
}

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

function redirectForDoor(careerDoor, subscriptionStatus) {
  return '/dashboard';
}

function redirectForStudent(student) {
  return redirectForDoor(student.careerDoor, student.subscriptionStatus);
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

  const access = await buildProjectAccess(student);

  return {
    accessToken,
    refreshToken,
    rememberMe: Boolean(rememberMe),
    refreshExpiresAt: student.refreshTokenExpiresAt,
    student: serializeStudent(student, {
      foundationComplete: access.foundationComplete,
      projectsUnlocked: access.paidProjectsUnlocked,
    }),
    ...access,
    redirectTo: redirectForStudent(student),
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

async function resolvePaidProjectsUnlocked(student) {
  if (!student) return false;
  if (!config.paidIndustryProjectsEnabled) return false;
  if (isPremiumUnlocked(student)) return true;
  return isFoundationCompleteForStudent(student);
}

async function resolveUnpaidProjectsUnlocked(student) {
  if (!student) return false;
  return isFoundationCompleteForStudent(student);
}

/** Paid industry projects (legacy field name on session responses). */
async function resolveProjectsUnlocked(student) {
  return resolvePaidProjectsUnlocked(student);
}

async function buildProjectAccess(student) {
  const foundationComplete = await isFoundationCompleteForStudent(student);
  const unpaidProjectsUnlocked = foundationComplete;
  const paidProjectsUnlocked = await resolvePaidProjectsUnlocked(student);
  return {
    foundationComplete,
    unpaidProjectsUnlocked,
    paidProjectsUnlocked,
    projectsUnlocked: paidProjectsUnlocked,
  };
}

async function withProjectAccess(student, extra = {}) {
  const access = await buildProjectAccess(student);
  return {
    ...extra,
    student: serializeStudent(student, {
      foundationComplete: access.foundationComplete,
      projectsUnlocked: access.paidProjectsUnlocked,
    }),
    ...access,
  };
}

async function hasProjectsUnlocked(email) {
  const normalized = String(email).trim().toLowerCase();
  const student = await StudentAccount.findOne({
    where: { email: normalized },
    attributes: ['id', 'email', 'subscriptionStatus', 'foundationCompletedAt'],
  });
  return await resolvePaidProjectsUnlocked(student);
}

async function hasUnpaidProjectsUnlocked(email) {
  const normalized = String(email).trim().toLowerCase();
  const student = await StudentAccount.findOne({
    where: { email: normalized },
    attributes: ['id', 'email', 'subscriptionStatus', 'foundationCompletedAt'],
  });
  return await resolveUnpaidProjectsUnlocked(student);
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
    status: verificationStatus(student),
    emailVerified: Boolean(student.emailVerifiedAt),
    subscriptionStatus: student.subscriptionStatus || SUBSCRIPTION.FREE,
    premiumApprovedAt: student.premiumApprovedAt,
    premiumPaymentScreenshot: student.premiumPaymentScreenshot || null,
    premiumPaymentSubmittedAt: student.premiumPaymentSubmittedAt || null,
    foundationCompletedAt: student.foundationCompletedAt || null,
    foundationComplete: Boolean(student.foundationCompletedAt),
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
  const collegeName =
    payload.college === 'Other'
      ? String(payload.collegeOtherName || '').trim()
      : String(payload.college).trim();
  if (!collegeName) {
    throw badRequest('Please enter your college or institution name');
  }

  const targetDomainOther = String(payload.targetDomainOther || '').trim() || null;
  await targetDomainService.validateSignupDomains(
    payload.targetDomains,
    targetDomainOther,
  );
  const domain = await targetDomainService.formatDomainsForStudent(
    payload.targetDomains,
    targetDomainOther,
  );
  const careerDoor = payload.careerDoor || 'written-challenge';
  const rawToken = createRawToken();

  const student = await StudentAccount.create({
    uuid: crypto.randomUUID(),
    fullName: payload.fullName.trim(),
    email,
    countryCode: payload.countryCode || '+91',
    phone: payload.phone.trim(),
    passwordHash,
    collegeName,
    streamMajor: payload.streamMajor.trim(),
    graduationYear: String(payload.graduationYear),
    domain,
    targetDomainsJson: payload.targetDomains,
    targetDomainOther,
    level: 'Beginner',
    careerDoor,
    subscriptionStatus: subscriptionFromCareerDoor(careerDoor),
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
  const mailError = getLastMailError();
  const response = {
    message: emailSent
      ? 'Account created. Please check your email and click Verify to continue.'
      : `Account created, but we could not send the verification email.${
          mailError ? ` Reason: ${mailError}` : ''
        } Check AWS SES (or MAIL_PROVIDER) settings in backend/.env, restart the server, then use Resend verification.`,
    email: student.email,
    requiresVerification: true,
    emailSent,
    redirectTo: redirectForStudent(student),
  };

  if (!emailSent) {
    response.mailError = mailError || 'Email service unavailable';
    response.smtpError = response.mailError;
  }

  if (!emailSent && process.env.NODE_ENV !== 'production') {
    const next = redirectForStudent(student);
    response.devVerifyUrl = frontendUrl(
      `/verify-email?token=${encodeURIComponent(rawToken)}&next=${encodeURIComponent(next)}`,
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

  const access = await buildProjectAccess(student);

  return {
    accessToken,
    refreshToken,
    rememberMe,
    refreshExpiresAt: absoluteExpiry,
    student: serializeStudent(student, {
      foundationComplete: access.foundationComplete,
      projectsUnlocked: access.paidProjectsUnlocked,
    }),
    ...access,
    redirectTo: redirectForStudent(student),
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

  return withProjectAccess(student, {
    redirectTo: redirectForStudent(student),
  });
}

async function requestPremium(studentId) {
  const student = await StudentAccount.findByPk(studentId);
  if (!student || !student.isActive) {
    throw unauthorized('Unauthorized');
  }

  if (student.subscriptionStatus === SUBSCRIPTION.PREMIUM) {
    const projectsUnlocked = await resolveProjectsUnlocked(student);
    return {
      message: 'Premium is already active on this account.',
      student: serializeStudent(student, { projectsUnlocked }),
      projectsUnlocked,
    };
  }

  if (student.subscriptionStatus !== SUBSCRIPTION.PREMIUM_PENDING) {
    student.careerDoor = 'bytex-unlock';
    student.subscriptionStatus = SUBSCRIPTION.PREMIUM_PENDING;
    student.premiumApprovedAt = null;
    student.premiumApprovedBy = null;
    student.premiumPaymentScreenshot = null;
    student.premiumPaymentSubmittedAt = null;
    await student.save();
  }

  const projectsUnlocked = await resolveProjectsUnlocked(student);
  return {
    message:
      'Premium request started. Complete payment on the details page and upload your screenshot for admin review.',
    student: serializeStudent(student, { projectsUnlocked }),
    projectsUnlocked,
  };
}

async function submitPremiumPayment(studentId, screenshotPath) {
  const student = await StudentAccount.findByPk(studentId);
  if (!student || !student.isActive) {
    throw unauthorized('Unauthorized');
  }

  if (student.subscriptionStatus === SUBSCRIPTION.PREMIUM) {
    throw badRequest('Premium is already active on this account.');
  }

  if (!screenshotPath) {
    throw badRequest('Please upload a payment screenshot.');
  }

  student.careerDoor = 'bytex-unlock';
  student.subscriptionStatus = SUBSCRIPTION.PREMIUM_PENDING;
  student.premiumApprovedAt = null;
  student.premiumApprovedBy = null;
  student.premiumPaymentScreenshot = screenshotPath;
  student.premiumPaymentSubmittedAt = new Date();
  await student.save();

  const projectsUnlocked = await resolveProjectsUnlocked(student);
  return {
    message:
      'Payment screenshot submitted. An admin will review and approve your premium access.',
    student: serializeStudent(student, { projectsUnlocked }),
    projectsUnlocked,
  };
}

async function updateStudent(studentId, payload, adminId) {
  const student = await StudentAccount.findByPk(studentId);
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  const email = String(payload.email).trim().toLowerCase();
  if (email !== student.email) {
    const taken = await StudentAccount.findOne({
      where: { email, id: { [Op.ne]: student.id } },
      attributes: ['id'],
    });
    if (taken) {
      throw badRequest('An account with this email already exists');
    }
    student.email = email;
  }

  student.fullName = payload.studentName.trim();
  student.collegeName = payload.college.trim();
  student.domain = payload.domain.trim();
  student.level = payload.level.trim();

  if (typeof payload.phone === 'string') {
    const raw = payload.phone.trim();
    const match = raw.match(/^(\+\d{1,4})\s*(.*)$/);
    if (match) {
      student.countryCode = match[1];
      student.phone = match[2].replace(/\s+/g, '');
    } else if (raw) {
      student.phone = raw.replace(/\s+/g, '');
    }
  }

  if (
    payload.subscriptionStatus === SUBSCRIPTION.FREE ||
    payload.subscriptionStatus === SUBSCRIPTION.PREMIUM_PENDING ||
    payload.subscriptionStatus === SUBSCRIPTION.PREMIUM
  ) {
    applySubscriptionStatus(student, payload.subscriptionStatus, adminId);
  }

  await student.save();
  return {
    message: 'Student details updated.',
    student: serializeStudent(student),
  };
}

function applySubscriptionStatus(student, nextStatus, adminId) {
  const previous = student.subscriptionStatus || SUBSCRIPTION.FREE;
  if (previous === nextStatus) return;

  if (nextStatus === SUBSCRIPTION.FREE) {
    student.subscriptionStatus = SUBSCRIPTION.FREE;
    student.careerDoor = 'written-challenge';
    clearPremiumGrant(student);
    clearPremiumPayment(student);
    return;
  }

  if (nextStatus === SUBSCRIPTION.PREMIUM_PENDING) {
    student.subscriptionStatus = SUBSCRIPTION.PREMIUM_PENDING;
    student.careerDoor = 'bytex-unlock';
    clearPremiumGrant(student);
    return;
  }

  student.subscriptionStatus = SUBSCRIPTION.PREMIUM;
  student.careerDoor = 'bytex-unlock';
  student.premiumApprovedAt = new Date();
  student.premiumApprovedBy = adminId ? String(adminId) : null;
}

async function approvePremium(studentId, adminId) {
  const student = await StudentAccount.findByPk(studentId);
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  if (!student.emailVerifiedAt) {
    throw badRequest(
      'This student has not verified their email yet. Premium can only be managed after email verification.',
    );
  }

  if (student.subscriptionStatus === SUBSCRIPTION.PREMIUM) {
    const projectsUnlocked = await resolveProjectsUnlocked(student);
    return {
      message: 'This student already has premium access.',
      student: serializeStudent(student, { projectsUnlocked }),
    };
  }

  if (student.subscriptionStatus !== SUBSCRIPTION.PREMIUM_PENDING) {
    throw badRequest(
      'This student has not requested premium. Only Premium Pending accounts can be approved.',
    );
  }

  student.subscriptionStatus = SUBSCRIPTION.PREMIUM;
  student.careerDoor = 'bytex-unlock';
  student.premiumApprovedAt = new Date();
  student.premiumApprovedBy = adminId ? String(adminId) : null;
  await student.save();

  const projectsUnlocked = await resolveProjectsUnlocked(student);
  return {
    message: 'Premium access approved. Premium features are now unlocked.',
    student: serializeStudent(student, { projectsUnlocked }),
  };
}

function studentNotFound() {
  const err = new Error('Student not found');
  err.statusCode = 404;
  return err;
}

function clearPremiumGrant(student) {
  student.premiumApprovedAt = null;
  student.premiumApprovedBy = null;
}

function clearPremiumPayment(student) {
  student.premiumPaymentScreenshot = null;
  student.premiumPaymentSubmittedAt = null;
}

async function undoPremium(studentId) {
  const student = await StudentAccount.findByPk(studentId);
  if (!student) throw studentNotFound();

  if (!student.emailVerifiedAt) {
    throw badRequest(
      'This student has not verified their email yet. Premium can only be managed after email verification.',
    );
  }

  if (student.subscriptionStatus !== SUBSCRIPTION.PREMIUM) {
    throw badRequest(
      'Only an approved Premium subscription can be undone.',
    );
  }

  student.subscriptionStatus = SUBSCRIPTION.PREMIUM_PENDING;
  student.careerDoor = 'bytex-unlock';
  clearPremiumGrant(student);
  await student.save();

  const projectsUnlocked = await resolveProjectsUnlocked(student);
  return {
    message:
      'Premium approval undone. Status is Premium Pending again and premium features are locked.',
    student: serializeStudent(student, { projectsUnlocked }),
  };
}

async function rejectPremium(studentId) {
  const student = await StudentAccount.findByPk(studentId);
  if (!student) throw studentNotFound();

  if (!student.emailVerifiedAt) {
    throw badRequest(
      'This student has not verified their email yet. Premium can only be managed after email verification.',
    );
  }

  if (
    student.subscriptionStatus !== SUBSCRIPTION.PREMIUM &&
    student.subscriptionStatus !== SUBSCRIPTION.PREMIUM_PENDING
  ) {
    throw badRequest(
      'This student does not have a premium request or approval to reject.',
    );
  }

  student.subscriptionStatus = SUBSCRIPTION.FREE;
  student.careerDoor = 'written-challenge';
  clearPremiumGrant(student);
  clearPremiumPayment(student);
  await student.save();

  const projectsUnlocked = await resolveProjectsUnlocked(student);
  return {
    message:
      'Premium subscription rejected. The student is back on the Free plan.',
    student: serializeStudent(student, { projectsUnlocked }),
  };
}

async function listStudents({
  page = 1,
  pageSize = 10,
  search,
  status,
  subscriptionStatus,
  college,
} = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(50, Math.max(1, Number(pageSize) || 10));
  const where = {};

  if (status === 'VERIFIED') {
    where.emailVerifiedAt = { [Op.ne]: null };
    where.status = { [Op.ne]: 'FLAGGED' };
  } else if (status === 'PENDING') {
    where.emailVerifiedAt = null;
    where.status = { [Op.ne]: 'FLAGGED' };
  } else if (status === 'FLAGGED') {
    where.status = 'FLAGGED';
  }

  if (
    subscriptionStatus === SUBSCRIPTION.FREE ||
    subscriptionStatus === SUBSCRIPTION.PREMIUM_PENDING ||
    subscriptionStatus === SUBSCRIPTION.PREMIUM
  ) {
    where.subscriptionStatus = subscriptionStatus;
  }

  if (college && String(college).trim() && String(college).trim() !== 'ALL') {
    where.collegeName = String(college).trim();
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
    limit: safePageSize,
    offset: (safePage - 1) * safePageSize,
  });

  return {
    students: rows.map((row) => serializeStudent(row)),
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(count / safePageSize)),
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
  requestPremium,
  submitPremiumPayment,
  updateStudent,
  approvePremium,
  undoPremium,
  rejectPremium,
  listStudents,
  serializeStudent,
  hasProjectsUnlocked,
  hasUnpaidProjectsUnlocked,
  resolveProjectsUnlocked,
  resolvePaidProjectsUnlocked,
  resolveUnpaidProjectsUnlocked,
  buildProjectAccess,
  redirectForDoor,
  redirectForStudent,
  purgeExpiredUnverifiedStudents,
  EMAIL_VERIFICATION_TTL_MS,
  SUBSCRIPTION,
};
