'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const ProjectTeam = sequelize.define(
  'ProjectTeam',
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
    projectId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'project_id',
    },
    creatorStudentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'creator_student_id',
    },
    leadStudentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'lead_student_id',
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: '',
    },
    faculty: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('FORMING', 'ACTIVE'),
      allowNull: false,
      defaultValue: 'FORMING',
    },
  },
  {
    tableName: 'project_teams',
  },
);

module.exports = ProjectTeam;
