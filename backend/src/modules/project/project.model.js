'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const IndustryProject = sequelize.define(
  'IndustryProject',
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
    slug: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    badge: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: '',
    },
    isFree: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_free',
    },
    completionPayoutAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: null,
      field: 'completion_payout_amount',
    },
    projectPriceAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: null,
      field: 'project_price_amount',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageSrc: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      defaultValue: '',
      field: 'image_src',
    },
    imageAlt: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
      field: 'image_alt',
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    techStack: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: 'tech_stack',
    },
    estimatedTime: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: '',
      field: 'estimated_time',
    },
    level: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'Intermediate Level',
    },
    overview: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    briefRequirements: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: 'brief_requirements',
    },
    deliverables: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    evaluationCriteria: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: 'evaluation_criteria',
    },
    resources: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    mentorName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
      field: 'mentor_name',
    },
    teamSize: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'team_size',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'PENDING', 'REVIEW', 'ARCHIVED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    tableName: 'industry_projects',
    paranoid: true,
    deletedAt: 'deletedAt',
  },
);

module.exports = IndustryProject;
