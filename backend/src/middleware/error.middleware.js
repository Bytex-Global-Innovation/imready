'use strict';

function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Resource not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (status >= 500 && !isProd) {
    console.error(err);
  }

  res.status(status).json({
    message:
      status >= 500 && isProd
        ? 'Internal server error'
        : err.message || 'Internal server error',
    ...(err.code ? { code: err.code } : {}),
    ...(Array.isArray(err.errors) && err.errors.length ? { errors: err.errors } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };
