'use strict';

const Assessment = require('@container/assessment/assessmentModel');
const AssessmentQuestion = require('@container/assessment/assessmentQuestionModel');
const AssessmentQuestionOption = require('@container/assessment/assessmentQuestionOptionModel');
const AssessmentQuestionLink = require('@container/assessment/assessmentQuestionLinkModel');
const AssessmentSubmission = require('@container/assessment/assessmentSubmissionModel');
const AssessmentSubmissionAnswer = require('@container/assessment/assessmentSubmissionAnswerModel');

let associated = false;

function setupAssessmentAssociations() {
  if (associated) return;
  associated = true;

  AssessmentQuestion.hasMany(AssessmentQuestionOption, {
    as: 'options',
    foreignKey: 'questionId',
    onDelete: 'CASCADE',
  });
  AssessmentQuestionOption.belongsTo(AssessmentQuestion, {
    as: 'question',
    foreignKey: 'questionId',
  });

  Assessment.belongsToMany(AssessmentQuestion, {
    through: AssessmentQuestionLink,
    as: 'questions',
    foreignKey: 'assessmentId',
    otherKey: 'questionId',
  });
  AssessmentQuestion.belongsToMany(Assessment, {
    through: AssessmentQuestionLink,
    as: 'assessments',
    foreignKey: 'questionId',
    otherKey: 'assessmentId',
  });

  Assessment.hasMany(AssessmentQuestionLink, {
    as: 'questionLinks',
    foreignKey: 'assessmentId',
  });
  AssessmentQuestionLink.belongsTo(Assessment, {
    as: 'assessment',
    foreignKey: 'assessmentId',
  });
  AssessmentQuestionLink.belongsTo(AssessmentQuestion, {
    as: 'question',
    foreignKey: 'questionId',
  });

  Assessment.hasMany(AssessmentSubmission, {
    as: 'submissions',
    foreignKey: 'assessmentId',
  });
  AssessmentSubmission.belongsTo(Assessment, {
    as: 'assessment',
    foreignKey: 'assessmentId',
  });

  AssessmentSubmission.hasMany(AssessmentSubmissionAnswer, {
    as: 'answers',
    foreignKey: 'submissionId',
    onDelete: 'CASCADE',
  });
  AssessmentSubmissionAnswer.belongsTo(AssessmentSubmission, {
    as: 'submission',
    foreignKey: 'submissionId',
  });
  AssessmentSubmissionAnswer.belongsTo(AssessmentQuestion, {
    as: 'question',
    foreignKey: 'questionId',
  });
}

module.exports = {
  setupAssessmentAssociations,
  Assessment,
  AssessmentQuestion,
  AssessmentQuestionOption,
  AssessmentQuestionLink,
  AssessmentSubmission,
  AssessmentSubmissionAnswer,
};
