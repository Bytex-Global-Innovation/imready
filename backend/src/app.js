'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('@config');
const sequelize = require('@connections/sequelize');
const { notFoundHandler, errorHandler } = require('@middleware/error.middleware');
const routes = require('@routes/v1');
const { uploadsRoot } = require('@middleware/upload-project-file.middleware');

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

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(require('cookie-parser')());
app.use('/uploads', express.static(uploadsRoot));

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({ success: true, status: 'ok', database: 'connected' });
  } catch {
    return res.status(503).json({ success: false, status: 'degraded', database: 'disconnected' });
  }
});

// Versioned API surface — all business routes live under /api/v1
app.use('/api/v1', routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
