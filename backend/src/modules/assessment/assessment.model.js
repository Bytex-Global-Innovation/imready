'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const Assessment = sequelize.define(
  'Assessment',
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'DRAFT', 'ARCHIVED'),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    questionCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'question_count',
    },
    questionOrderMode: {
      type: DataTypes.ENUM('sequential', 'random', 'jumbled'),
      allowNull: false,
      defaultValue: 'sequential',
      field: 'question_order_mode',
    },
    jumbledOptionsMarks: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 60,
      field: 'jumbled_options_marks',
    },
    personalResponseMarks: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 40,
      field: 'personal_response_marks',
    },
    mcqOptionsMarks: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 20,
      field: 'mcq_options_marks',
    },
    weightingMode: {
      type: DataTypes.ENUM('EQUAL', 'INDIVIDUAL'),
      allowNull: false,
      defaultValue: 'EQUAL',
      field: 'weighting_mode',
    },
    passMarks: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 70,
      field: 'pass_marks',
    },
    durationMinutes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 60,
      field: 'duration_minutes',
    },
    perQuestionDurationSeconds: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 180,
      field: 'per_question_duration_seconds',
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: 'deleted_at',
    },
  },
  {
    tableName: 'assessments',
    paranoid: true,
    deletedAt: 'deletedAt',
  },
);

module.exports = Assessment;
