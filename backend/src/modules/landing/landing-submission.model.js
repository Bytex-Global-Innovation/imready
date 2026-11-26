'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const LandingShareProblem = sequelize.define(
  'LandingShareProblem',
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
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    paymentReference: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'payment_reference',
    },
    ideaStage: {
      type: DataTypes.STRING(32),
      allowNull: false,
      field: 'idea_stage',
    },
    problem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    blocker: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    blockerOther: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
      field: 'blocker_other',
    },
    projectTypes: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'project_types',
    },
    projectTypeOther: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
      field: 'project_type_other',
    },
    readyPlan: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'ready_plan',
    },
    messageText: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      field: 'message_text',
    },
    source: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: 'imready-admin-landing',
    },
  },
  {
    tableName: 'landing_share_problems',
  },
);

module.exports = LandingShareProblem;
