'use strict';

const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
    files: 1,
  },
  fileFilter(req, file, cb) {
    const name = String(file.originalname || '').toLowerCase();
    const ok =
      name.endsWith('.xlsx') ||
      name.endsWith('.xls') ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel';

    if (!ok) {
      const err = new Error('Only Excel files (.xlsx, .xls) are allowed');
      err.statusCode = 400;
      return cb(err);
    }
    return cb(null, true);
  },
});

function uploadExcel(fieldName = 'file') {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 2 MB.' });
        }
        return res.status(err.statusCode || 400).json({
          message: err.message || 'Invalid file upload',
        });
      }
      return next();
    });
  };
}

module.exports = { uploadExcel };
