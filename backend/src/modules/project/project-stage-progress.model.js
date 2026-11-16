'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const ProjectStageProgress = sequelize.define(
  'ProjectStageProgress',
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
    currentStage: {
      type: DataTypes.ENUM(
        'WORKSPACE',
        'READY',
        'DO',
        'SUBMIT',
        'REVIEW',
        'OWNER_FEEDBACK',
        'OUTCOME',
        'PROFILE',
      ),
      allowNull: false,
      defaultValue: 'WORKSPACE',
      field: 'current_stage',
    },
    checkpoints: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    updatedByStudentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'updated_by_student_id',
    },
  },
  {
    tableName: 'project_stage_progress',
  },
);

module.exports = ProjectStageProgress;
