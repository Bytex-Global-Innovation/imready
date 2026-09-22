'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const AssessmentQuestionMcqOption = sequelize.define(
  'AssessmentQuestionMcqOption',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    questionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'question_id',
    },
    optionKey: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'option_key',
    },
    label: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_correct',
    },
    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'sort_order',
    },
  },
  {
    tableName: 'assessment_question_mcq_options',
  },
);

module.exports = AssessmentQuestionMcqOption;
