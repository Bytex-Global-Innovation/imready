'use strict';

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const { uploadsRoot } = require('@middleware/upload-project-file.middleware');

const paymentsDir = path.join(uploadsRoot, 'premium-payments');

function ensureDir() {
  if (!fs.existsSync(paymentsDir)) {
    fs.mkdirSync(paymentsDir, { recursive: true });
  }
}

ensureDir();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    ensureDir();
    cb(null, paymentsDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)
      ? ext
      : '.png';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, cb) {
    const name = String(file.originalname || '').toLowerCase();
    const mime = String(file.mimetype || '');
    const ok =
      mime.startsWith('image/') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.webp') ||
      name.endsWith('.gif');
    if (!ok) {
      const err = new Error('Only image files are allowed for payment screenshots');
      err.statusCode = 400;
      return cb(err);
    }
    return cb(null, true);
  },
});

function uploadPaymentScreenshot(fieldName = 'screenshot') {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'File too large. Maximum size is 5 MB.',
          });
        }
        return res.status(err.statusCode || 400).json({
          message: err.message || 'Invalid file upload',
        });
      }
      return next();
    });
  };
}

module.exports = {
  uploadPaymentScreenshot,
  paymentsDir,
};
