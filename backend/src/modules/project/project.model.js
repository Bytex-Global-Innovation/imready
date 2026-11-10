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
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
      field: 'company_name',
    },
    whatYouGain: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: 'what_you_gain',
    },
    cohortStarts: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: '',
      field: 'cohort_starts',
    },
    mentorshipLabel: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Verified Industry Partner',
      field: 'mentorship_label',
    },
    teamFormationNote: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '',
      field: 'team_formation_note',
    },
    applyOpensAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'apply_opens_at',
    },
    applyClosesAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'apply_closes_at',
    },
    applyWindowDays: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'apply_window_days',
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
