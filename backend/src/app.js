'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('@config/config');
const sequelize = require('@connections/sequelize');
const { notFoundHandler, errorHandler } = require('@middleware/errorHandler');
const routes = require('@container/routes');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 600,
  }),
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({ success: true, status: 'ok', database: 'connected' });
  } catch {
    return res.status(503).json({ success: false, status: 'degraded', database: 'disconnected' });
  }
});

app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
