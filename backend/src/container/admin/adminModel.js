'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const Admin = sequelize.define(
  'Admin',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'admins',
    underscored: true,
  },
);

module.exports = Admin;
