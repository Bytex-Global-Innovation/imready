'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const FoundationMissionConfig = sequelize.define(
  'FoundationMissionConfig',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    problemStatementId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'problem_statement_id',
    },
    missionId: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      field: 'mission_id',
    },
    tipAdvisorLabel: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: 'Advisor',
      field: 'tip_advisor_label',
    },
    tipQuote: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      field: 'tip_quote',
    },
    analyzeContextText: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      field: 'analyze_context_text',
    },
    patternTagOptions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      field: 'pattern_tag_options',
    },
    whyLayerLabels: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      field: 'why_layer_labels',
    },
    questions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    evidenceConfig: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      field: 'evidence_config',
    },
  },
  {
    tableName: 'foundation_mission_configs',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['problem_statement_id', 'mission_id'],
        name: 'foundation_mission_configs_problem_mission_unique',
      },
    ],
  },
);

module.exports = FoundationMissionConfig;
