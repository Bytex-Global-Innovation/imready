'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const AssessmentQuestion = sequelize.define(
  'AssessmentQuestion',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.STRING(36),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tips: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    answerType: {
      type: DataTypes.ENUM('JUMBLED', 'PERSONAL', 'BOTH'),
      allowNull: false,
      defaultValue: 'BOTH',
      field: 'answer_type',
    },
  },
  {
    tableName: 'assessment_questions',
  },
);

module.exports = AssessmentQuestion;
