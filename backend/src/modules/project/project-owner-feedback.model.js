'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const ProjectOwnerFeedback = sequelize.define(
  'ProjectOwnerFeedback',
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
    submissionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'submission_id',
    },
    adminId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'admin_id',
    },
    workedWell: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      field: 'worked_well',
    },
    improved: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    valuable: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    overall: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    studentQuote: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'student_quote',
    },
    rating: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 5,
    },
    continuation: {
      type: DataTypes.ENUM(
        'entire_team',
        'selected_students',
        'no_continuation',
      ),
      allowNull: false,
      defaultValue: 'entire_team',
    },
    valuedPoints: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: 'valued_points',
    },
    improvePoints: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: 'improve_points',
    },
    selectedStudentIds: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: 'selected_student_ids',
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'SUBMITTED'),
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
    tableName: 'project_owner_feedback',
  },
);

module.exports = ProjectOwnerFeedback;
