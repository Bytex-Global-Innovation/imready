'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const ProjectTeamMember = sequelize.define(
  'ProjectTeamMember',
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
      field: 'team_id',
    },
    studentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'student_id',
    },
    invitedByStudentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'invited_by_student_id',
    },
    role: {
      type: DataTypes.ENUM('CREATOR', 'MEMBER'),
      allowNull: false,
      defaultValue: 'MEMBER',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'responded_at',
    },
  },
  {
    tableName: 'project_team_members',
  },
);

module.exports = ProjectTeamMember;
