'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const FoundationMissionRecord = sequelize.define(
  'FoundationMissionRecord',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'student_id',
    },
    missionId: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      field: 'mission_id',
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    evidenceFileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      field: 'evidence_file_name',
    },
    evidenceFileType: {
      type: DataTypes.STRING(64),
      allowNull: true,
      defaultValue: null,
      field: 'evidence_file_type',
    },
    evidenceFilePath: {
      type: DataTypes.STRING(512),
      allowNull: true,
      defaultValue: null,
      field: 'evidence_file_path',
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: 'completed_at',
    },
    xpEarned: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'xp_earned',
    },
  },
  {
    tableName: 'foundation_mission_records',
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'mission_id'],
      },
    ],
  },
);

module.exports = FoundationMissionRecord;
