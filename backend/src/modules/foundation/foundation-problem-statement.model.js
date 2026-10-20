'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const FoundationProblemStatement = sequelize.define(
  'FoundationProblemStatement',
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
    statementText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'statement_text',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },
  },
  {
    tableName: 'foundation_problem_statements',
    underscored: true,
  },
);

module.exports = FoundationProblemStatement;
