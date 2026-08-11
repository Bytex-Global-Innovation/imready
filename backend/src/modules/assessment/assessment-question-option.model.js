'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const AssessmentQuestionOption = sequelize.define(
  'AssessmentQuestionOption',
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
    correctOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'correct_order',
    },
  },
  {
    tableName: 'assessment_question_options',
  },
);

module.exports = AssessmentQuestionOption;
