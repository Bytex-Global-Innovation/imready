'use strict';

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

const uploadsRoot = path.join(process.cwd(), 'uploads');
const evidenceDir = path.join(uploadsRoot, 'foundation-evidence');

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);
const ALLOWED_MIME_PREFIXES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function ensureDir() {
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }
}

ensureDir();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    ensureDir();
    cb(null, evidenceDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.pdf';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, cb) {
    const name = String(file.originalname || '').toLowerCase();
    const ext = path.extname(name);
    const mime = String(file.mimetype || '');
    const ok =
      ALLOWED_EXTENSIONS.has(ext)
      || ALLOWED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix));
    if (!ok) {
      const err = new Error('Only PDF or Word documents are allowed (.pdf, .doc, .docx).');
      err.statusCode = 400;
      return cb(err);
    }
    return cb(null, true);
  },
});

function uploadFoundationEvidence(fieldName = 'evidence') {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'File too large. Maximum size is 10 MB.',
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
  uploadFoundationEvidence,
  evidenceDir,
  uploadsRoot,
};
