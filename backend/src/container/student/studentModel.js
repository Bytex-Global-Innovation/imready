'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('@connections/sequelize');

const StudentAccount = sequelize.define(
  'StudentAccount',
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
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'full_name',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    countryCode: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: '+91',
      field: 'country_code',
    },
    phone: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: '',
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    collegeName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
      field: 'college_name',
    },
    streamMajor: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: '',
      field: 'stream_major',
    },
    graduationYear: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: '',
      field: 'graduation_year',
    },
    domain: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: '',
    },
    level: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'Beginner',
    },
    careerDoor: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: '',
      field: 'career_door',
    },
    status: {
      type: DataTypes.ENUM('VERIFIED', 'PENDING', 'FLAGGED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'student_accounts',
  },
);

module.exports = StudentAccount;
