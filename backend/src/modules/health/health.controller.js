'use strict';

const { buildHealthReport } = require('@modules/health/health.service');

async function getHealth(req, res) {
  try {
    const report = await buildHealthReport();
    const statusCode = report.success ? 200 : 503;
    return res.status(statusCode).json(report);
  } catch (err) {
    return res.status(503).json({
      success: false,
      status: 'error',
      message: err?.message || 'Health check failed',
      checkedAt: new Date().toISOString(),
    });
  }
}

module.exports = {
  getHealth,
};
