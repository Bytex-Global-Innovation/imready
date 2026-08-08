'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const AssessmentSubmission = sequelize.define(
  'AssessmentSubmission',
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
    assessmentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'assessment_id',
    },
    studentName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'student_name',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    collegeName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'college_name',
    },
    status: {
      type: DataTypes.ENUM('SUBMITTED', 'PARTIALLY_EVALUATED', 'EVALUATED'),
      allowNull: false,
      defaultValue: 'SUBMITTED',
    },
    result: {
      type: DataTypes.ENUM('PASS', 'FAIL'),
      allowNull: true,
      defaultValue: null,
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
    totalScore: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      defaultValue: null,
      field: 'total_score',
    },
    maxScore: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'max_score',
    },
  },
  {
    tableName: 'assessment_submissions',
  },
);

module.exports = AssessmentSubmission;
