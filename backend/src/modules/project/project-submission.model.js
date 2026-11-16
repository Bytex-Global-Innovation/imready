'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const ProjectSubmission = sequelize.define(
  'ProjectSubmission',
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
    teamId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
      field: 'team_id',
    },
    projectId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'project_id',
    },
    submittedByStudentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'submitted_by_student_id',
    },
    submissionCode: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'submission_code',
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    demoVideoUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      field: 'demo_video_url',
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    status: {
      type: DataTypes.ENUM(
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'FEEDBACK_READY',
        'CLOSED',
      ),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'submitted_at',
    },
  },
  {
    tableName: 'project_submissions',
  },
);

module.exports = ProjectSubmission;
