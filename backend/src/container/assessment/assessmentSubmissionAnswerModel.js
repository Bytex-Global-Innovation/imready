'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const AssessmentSubmissionAnswer = sequelize.define(
  'AssessmentSubmissionAnswer',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    submissionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'submission_id',
    },
    questionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'question_id',
    },
    category: { type: DataTypes.ENUM('OBSERVATION', 'THINKING', 'BUILDING'), allowNull: false, defaultValue: 'OBSERVATION' },
    optionOrder: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'option_order',
    },
    personalResponse: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      field: 'personal_response',
    },
    jumbledScore: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'jumbled_score',
    },
    personalScore: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      defaultValue: null,
      field: 'personal_score',
    },
    jumbledMax: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'jumbled_max',
    },
    personalMax: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'personal_max',
    },
  },
  {
    tableName: 'assessment_answers',
  },
);

module.exports = AssessmentSubmissionAnswer;
