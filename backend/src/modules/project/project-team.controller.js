'use strict';

const teamService = require('@modules/project/project-team.service');

async function getTeam(req, res, next) {
  try {
    const result = await teamService.getTeamForStudent(
      req.params.slug,
      req.studentRecord.id,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function upsertTeam(req, res, next) {
  try {
    const team = await teamService.upsertTeam(
      req.params.slug,
      req.studentRecord,
      req.body || {},
    );
    return res.status(200).json({ team });
  } catch (err) {
    return next(err);
  }
}

async function inviteMember(req, res, next) {
  try {
    const team = await teamService.inviteMember(
      req.params.slug,
      req.studentRecord,
      req.body?.studentId,
    );
    return res.status(200).json({ team });
  } catch (err) {
    return next(err);
  }
}

async function cancelInvite(req, res, next) {
  try {
    const team = await teamService.cancelInvite(
      req.params.slug,
      req.studentRecord,
      req.params.memberId,
    );
    return res.status(200).json({ team });
  } catch (err) {
    return next(err);
  }
}

async function finalizeTeam(req, res, next) {
  try {
    const team = await teamService.finalizeTeam(
      req.params.slug,
      req.studentRecord,
      req.body || {},
    );
    return res.status(200).json({ team });
  } catch (err) {
    return next(err);
  }
}

async function searchStudents(req, res, next) {
  try {
    const result = await teamService.searchStudentsForTeam(
      req.studentRecord.id,
      req.query.q || req.query.search,
      { limit: Number(req.query.limit) || 12 },
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listNotifications(req, res, next) {
  try {
    const result = await teamService.listNotifications(req.studentRecord.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function acceptInvite(req, res, next) {
  try {
    const result = await teamService.respondToInvite(
      req.studentRecord.id,
      req.params.memberId,
      true,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function rejectInvite(req, res, next) {
  try {
    const result = await teamService.respondToInvite(
      req.studentRecord.id,
      req.params.memberId,
      false,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getTeam,
  upsertTeam,
  inviteMember,
  cancelInvite,
  finalizeTeam,
  searchStudents,
  listNotifications,
  acceptInvite,
  rejectInvite,
};
