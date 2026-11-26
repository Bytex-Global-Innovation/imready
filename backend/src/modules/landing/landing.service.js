'use strict';

const crypto = require('crypto');
const LandingShareProblem = require('@modules/landing/landing-submission.model');

async function createShareProblem(payload) {
  const row = await LandingShareProblem.create({
    uuid: crypto.randomUUID(),
    name: payload.name,
    company: payload.company,
    email: payload.email.toLowerCase(),
    phone: payload.phone,
    paymentReference: payload.paymentReference,
    ideaStage: payload.ideaStage,
    problem: payload.problem,
    blocker: payload.blocker,
    blockerOther: payload.blocker === 'other' ? payload.blockerOther || '' : '',
    projectTypes: payload.projectTypes,
    projectTypeOther: payload.projectTypes.includes('other')
      ? payload.projectTypeOther || ''
      : '',
    readyPlan: payload.readyPlan,
    messageText: payload.message || '',
    source: payload.source || 'imready-admin-landing',
  });

  return {
    id: String(row.id),
    uuid: row.uuid,
    createdAt: row.createdAt,
  };
}

module.exports = {
  createShareProblem,
};
