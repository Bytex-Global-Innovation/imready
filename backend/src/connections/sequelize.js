'use strict';

const { Sequelize } = require('sequelize');
const config = require('@config/config');

const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    pool: {
      max: config.db.connectionLimit,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  },
);

module.exports = sequelize;
