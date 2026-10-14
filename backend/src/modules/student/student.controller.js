'use strict';

const studentService = require('@modules/student/student.service');
const {
  setAuthCookies,
  clearAuthCookies,
  readRefreshToken,
} = require('@modules/auth/student.cookies');

function attachSessionCookies(res, session) {
  setAuthCookies(res, {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    rememberMe: session.rememberMe,
    refreshExpiresAt: session.refreshExpiresAt,
  });

  return {
    student: session.student,
    projectsUnlocked: session.projectsUnlocked,
    redirectTo: session.redirectTo,
  };
}

async function signup(req, res, next) {
  try {
    const result = await studentService.signup(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const session = await studentService.login(req.body);
    return res.status(200).json(attachSessionCookies(res, session));
  } catch (err) {
    return next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const token = req.body.token || req.query.token;
    const session = await studentService.verifyEmail(token);
    return res.status(200).json(attachSessionCookies(res, session));
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const session = await studentService.refreshSession(readRefreshToken(req));
    return res.status(200).json(attachSessionCookies(res, session));
  } catch (err) {
    clearAuthCookies(res);
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    await studentService.logout(req.student?.id, readRefreshToken(req));
    clearAuthCookies(res);
    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    clearAuthCookies(res);
    return next(err);
  }
}

async function resendVerification(req, res, next) {
  try {
    const result = await studentService.resendVerification(req.body.email);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await studentService.forgotPassword(req.body.email);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await studentService.resetPassword(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const result = await studentService.getMe(req.student.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function requestPremium(req, res, next) {
  try {
    const result = await studentService.requestPremium(req.student.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function submitPremiumPayment(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a payment screenshot' });
    }
    const screenshotPath = `/uploads/premium-payments/${req.file.filename}`;
    const result = await studentService.submitPremiumPayment(
      req.student.id,
      screenshotPath,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listStudents(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const subscriptionStatus = req.query.subscriptionStatus
      ? String(req.query.subscriptionStatus)
      : undefined;
    const college = req.query.college ? String(req.query.college) : undefined;
    const result = await studentService.listStudents({
      page,
      pageSize,
      search,
      status,
      subscriptionStatus,
      college,
    });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function updateStudent(req, res, next) {
  try {
    const result = await studentService.updateStudent(
      req.params.id,
      req.body,
      req.admin?.id,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function approvePremium(req, res, next) {
  try {
    const result = await studentService.approvePremium(
      req.params.id,
      req.admin?.id,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function undoPremium(req, res, next) {
  try {
    const result = await studentService.undoPremium(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function rejectPremium(req, res, next) {
  try {
    const result = await studentService.rejectPremium(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  signup,
  login,
  verifyEmail,
  refresh,
  logout,
  resendVerification,
  forgotPassword,
  resetPassword,
  me,
  requestPremium,
  submitPremiumPayment,
  listStudents,
  updateStudent,
  approvePremium,
  undoPremium,
  rejectPremium,
};
