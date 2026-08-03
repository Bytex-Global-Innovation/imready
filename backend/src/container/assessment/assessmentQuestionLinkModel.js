'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const AssessmentQuestionLink = sequelize.define(
  'AssessmentQuestionLink',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    assessmentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'assessment_id',
    },
    questionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'question_id',
    },
    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },
    category: { type: DataTypes.ENUM('OBSERVATION', 'THINKING', 'BUILDING'), allowNull: false, defaultValue: 'OBSERVATION' },
    jumbledOptionsMarks: { type: DataTypes.DECIMAL(8, 2), allowNull: true, field: 'jumbled_options_marks' },
    personalResponseMarks: { type: DataTypes.DECIMAL(8, 2), allowNull: true, field: 'personal_response_marks' },
  },
  {
    tableName: 'assessment_question_assignments',
  },
);

module.exports = AssessmentQuestionLink;
