'use strict';

const fs = require('fs/promises');
const path = require('path');
const { performance } = require('node:perf_hooks');
const sequelize = require('@connections/sequelize');
const { uploadsRoot } = require('@middleware/upload-project-file.middleware');
const { getMailProvider, getLastMailError } = require('@modules/shared/mail.service');
const categoryService = require('@modules/project/project-category.service');
const projectService = require('@modules/project/project.service');
const assessmentService = require('@modules/assessment/assessment.service');
const { API_CATALOG, fullPath } = require('@modules/health/api-catalog');

async function timed(label, fn) {
  const start = performance.now();
  try {
    await fn();
    const responseTimeMs = Math.round((performance.now() - start) * 100) / 100;
    return { status: 'ok', responseTimeMs, label };
  } catch (err) {
    const responseTimeMs = Math.round((performance.now() - start) * 100) / 100;
    return {
      status: 'error',
      responseTimeMs,
      label,
      message: err?.message || String(err),
    };
  }
}

function emailConfigured() {
  const provider = getMailProvider();
  if (provider === 'smtp') {
    return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  }
  const region = (process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || '').trim();
  const from = (process.env.SES_FROM || process.env.MAIL_FROM || '').trim();
  return Boolean(region && from);
}

const LIVE_HANDLERS = {
  'GET /projects/categories': () =>
    categoryService.listCategories({ activeOnly: true }),
  'GET /projects': () => projectService.listPublicProjects({ access: 'free' }),
  'GET /assessments/active': async () => {
    try {
      await assessmentService.getActiveAssessmentForStudent();
    } catch (err) {
      if (err?.statusCode === 404) return;
      throw err;
    }
  },
};

function catalogKey(entry) {
  return `${entry.method} ${entry.path}`;
}

async function buildHealthReport() {
  const started = performance.now();

  const [database, uploadsStorage, email] = await Promise.all([
    timed('database', () => sequelize.authenticate()),
    timed('uploadsStorage', async () => {
      await fs.access(uploadsRoot);
      const evidenceDir = path.join(uploadsRoot, 'foundation-evidence');
      await fs.mkdir(evidenceDir, { recursive: true });
    }),
    Promise.resolve().then(() => {
      const start = performance.now();
      const configured = emailConfigured();
      const responseTimeMs = Math.round((performance.now() - start) * 100) / 100;
      return {
        status: configured ? 'ok' : 'degraded',
        responseTimeMs,
        label: 'email',
        provider: getMailProvider(),
        configured,
        hint: configured ? undefined : getLastMailError() || 'Set SES or SMTP env vars',
      };
    }),
  ]);

  const services = {
    database: {
      status: database.status,
      responseTimeMs: database.responseTimeMs,
    },
    uploadsStorage: {
      status: uploadsStorage.status,
      responseTimeMs: uploadsStorage.responseTimeMs,
    },
    email: {
      status: email.status,
      responseTimeMs: email.responseTimeMs,
      provider: email.provider,
      configured: email.configured,
      ...(email.hint ? { hint: email.hint } : {}),
    },
  };

  const apis = await Promise.all(
    API_CATALOG.map(async (entry) => {
      const key = catalogKey(entry);
      const route = fullPath(entry.path);

      if (entry.probe === 'self') {
        return {
          method: entry.method,
          path: route,
          module: entry.module,
          auth: entry.auth,
          status: 'ok',
          responseTimeMs: 0,
          probe: 'self',
        };
      }

      const handler = LIVE_HANDLERS[key];
      if (entry.probe === 'live' && handler) {
        const result = await timed(key, handler);
        return {
          method: entry.method,
          path: route,
          module: entry.module,
          auth: entry.auth,
          status: result.status,
          responseTimeMs: result.responseTimeMs,
          probe: 'live',
          ...(result.message ? { message: result.message } : {}),
        };
      }

      return {
        method: entry.method,
        path: route,
        module: entry.module,
        auth: entry.auth,
        status: 'registered',
        responseTimeMs: null,
        probe: 'registered',
      };
    }),
  );

  const responseTimeMs = Math.round((performance.now() - started) * 100) / 100;

  const failedServices = Object.values(services).filter((s) => s.status === 'error');
  const failedApis = apis.filter((a) => a.status === 'error');
  const success = failedServices.length === 0 && failedApis.length === 0;

  const probed = apis.filter((a) => a.probe === 'live' || a.probe === 'self');
  const summary = {
    totalApis: apis.length,
    registered: apis.filter((a) => a.status === 'registered').length,
    probed: probed.length,
    liveOk: apis.filter((a) => a.probe === 'live' && a.status === 'ok').length,
    errors: failedApis.length,
  };

  return {
    success,
    status: success ? 'ok' : 'degraded',
    responseTimeMs,
    checkedAt: new Date().toISOString(),
    services,
    apis,
    summary,
  };
}

module.exports = {
  buildHealthReport,
};
