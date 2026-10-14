'use strict';

const Assessment = require('@modules/assessment/assessment.model');
const AssessmentQuestion = require('@modules/assessment/assessment-question.model');
const AssessmentQuestionOption = require('@modules/assessment/assessment-question-option.model');
const AssessmentQuestionMcqOption = require('@modules/assessment/assessment-question-mcq-option.model');
const AssessmentQuestionLink = require('@modules/assessment/assessment-question-link.model');
const AssessmentSubmission = require('@modules/assessment/assessment-submission.model');
const AssessmentSubmissionAnswer = require('@modules/assessment/assessment-submission-answer.model');

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

  AssessmentQuestion.hasMany(AssessmentQuestionMcqOption, {
    as: 'mcqOptions',
    foreignKey: 'questionId',
    onDelete: 'CASCADE',
  });
  AssessmentQuestionMcqOption.belongsTo(AssessmentQuestion, {
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
  AssessmentQuestionMcqOption,
  AssessmentQuestionLink,
  AssessmentSubmission,
  AssessmentSubmissionAnswer,
};
