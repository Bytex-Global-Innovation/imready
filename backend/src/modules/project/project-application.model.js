'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const ProjectApplication = sequelize.define(
  'ProjectApplication',
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
    studentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'student_id',
    },
    projectId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'project_id',
    },
    studentName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'student_name',
    },
    studentEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'student_email',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    tableName: 'project_applications',
  },
);

module.exports = ProjectApplication;
