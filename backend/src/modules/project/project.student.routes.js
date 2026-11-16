'use strict';

const express = require('express');
const projectController = require('@modules/project/project.controller');
const teamController = require('@modules/project/project-team.controller');
const stageController = require('@modules/project/project-stage.controller');
const categoryService = require('@modules/project/project-category.service');
const {
  validateBody,
  applyProjectSchema,
  upsertTeamSchema,
  inviteTeamMemberSchema,
  finalizeTeamSchema,
  updateStageProgressSchema,
  submitProjectSchema,
} = require('@modules/project/project.validator');
const {
  requireVerifiedStudent,
  STUDENT_ISSUER,
} = require('@modules/auth/student.guard');
const StudentAccount = require('@modules/student/student.model');
const { readAccessToken } = require('@modules/auth/student.cookies');
const jwt = require('jsonwebtoken');

const router = express.Router();

/** Attach studentRecord when a valid student token is present (optional auth). */
async function optionalVerifiedStudent(req, res, next) {
  const token = readAccessToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: STUDENT_ISSUER,
    });
    if (!payload || payload.role !== 'student' || payload.typ !== 'access') {
      return next();
    }
    const student = await StudentAccount.findByPk(payload.id);
    if (student && student.isActive && student.emailVerifiedAt) {
      req.student = {
        id: String(payload.id),
        email: payload.email,
        role: payload.role,
      };
      req.studentRecord = student;
    }
  } catch {
    // ignore invalid token for optional auth
  }
  return next();
}

router.get('/categories', async (req, res, next) => {
  try {
    const result = await categoryService.listCategories({ activeOnly: true });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
});

router.get(
  '/students/search',
  requireVerifiedStudent,
  teamController.searchStudents,
);

router.get('/', projectController.listPublicProjects);

router.get(
  '/:slug/my-status',
  requireVerifiedStudent,
  projectController.getMyProjectStatus,
);
router.get(
  '/:slug/stage',
  requireVerifiedStudent,
  stageController.getStudentStageBundle,
);
router.put(
  '/:slug/stage/progress',
  requireVerifiedStudent,
  validateBody(updateStageProgressSchema),
  stageController.updateStudentProgress,
);
router.post(
  '/:slug/stage/submit',
  requireVerifiedStudent,
  validateBody(submitProjectSchema),
  stageController.submitStudentProject,
);
router.get(
  '/:slug/stage/owner-feedback',
  requireVerifiedStudent,
  stageController.getStudentOwnerFeedback,
);
router.get(
  '/:slug/stage/outcome',
  requireVerifiedStudent,
  stageController.getStudentOutcome,
);
router.get(
  '/:slug/team',
  requireVerifiedStudent,
  teamController.getTeam,
);
router.put(
  '/:slug/team',
  requireVerifiedStudent,
  validateBody(upsertTeamSchema),
  teamController.upsertTeam,
);
router.post(
  '/:slug/team/finalize',
  requireVerifiedStudent,
  validateBody(finalizeTeamSchema),
  teamController.finalizeTeam,
);
router.post(
  '/:slug/team/invites',
  requireVerifiedStudent,
  validateBody(inviteTeamMemberSchema),
  teamController.inviteMember,
);
router.delete(
  '/:slug/team/members/:memberId',
  requireVerifiedStudent,
  teamController.cancelInvite,
);

router.get('/:slug', optionalVerifiedStudent, projectController.getPublicProject);
router.post(
  '/:slug/apply',
  requireVerifiedStudent,
  validateBody(applyProjectSchema),
  projectController.applyToProject,
);

module.exports = router;
