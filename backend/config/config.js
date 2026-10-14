require('dotenv').config(); // Load env variables from .env

function dbConfig() {
  return {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: String(process.env.DB_NAME || '').trim(),
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
  };
}

module.exports = {
  development: dbConfig(),
  test: dbConfig(),
  production: dbConfig(),
};
