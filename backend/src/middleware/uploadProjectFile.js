'use strict';

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

const uploadsRoot = path.join(process.cwd(), 'uploads');
const projectsDir = path.join(uploadsRoot, 'projects');

function ensureDirs() {
  for (const dir of [uploadsRoot, projectsDir, path.join(projectsDir, 'images'), path.join(projectsDir, 'resources')]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDirs();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const kind = String(req.query.kind || req.body.kind || 'image').toLowerCase();
    const folder = kind === 'resource' ? 'resources' : 'images';
    cb(null, path.join(projectsDir, folder));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, cb) {
    const kind = String(req.query.kind || 'image').toLowerCase();
    const name = String(file.originalname || '').toLowerCase();
    const mime = String(file.mimetype || '');

    if (kind === 'resource') {
      const ok =
        name.endsWith('.pdf') ||
        name.endsWith('.zip') ||
        mime === 'application/pdf' ||
        mime === 'application/zip' ||
        mime === 'application/x-zip-compressed';
      if (!ok) {
        const err = new Error('Only PDF or ZIP files are allowed for resources');
        err.statusCode = 400;
        return cb(err);
      }
      return cb(null, true);
    }

    const ok =
      mime.startsWith('image/') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.webp') ||
      name.endsWith('.gif');
    if (!ok) {
      const err = new Error('Only image files are allowed');
      err.statusCode = 400;
      return cb(err);
    }
    return cb(null, true);
  },
});

function uploadProjectFile(fieldName = 'file') {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 8 MB.' });
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
  uploadProjectFile,
  uploadsRoot,
};
