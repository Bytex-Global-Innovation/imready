'use strict';

const assessmentService = require('@modules/assessment/assessment.service');
const assessmentBulkService = require('@modules/assessment/assessment-bulk.service');

async function listQuestions(req, res, next) {
  try {
    const result = await assessmentService.listQuestions();
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function createQuestion(req, res, next) {
  try {
    const result = await assessmentService.createQuestion(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listAssessments(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const result = await assessmentService.listAssessments(page);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function createAssessment(req, res, next) {
  try {
    const result = await assessmentService.createAssessment(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function updateAssessment(req, res, next) {
  try {
    const result = await assessmentService.updateAssessment(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getAssessment(req, res, next) {
  try {
    const result = await assessmentService.getAssessmentById(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function deleteAssessment(req, res, next) {
  try {
    const result = await assessmentService.deleteAssessment(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function downloadBulkSample(req, res, next) {
  try {
    const buffer = await assessmentBulkService.buildSampleWorkbookBuffer();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="assessment-bulk-sample.xlsx"',
    );
    return res.status(200).send(buffer);
  } catch (err) {
    return next(err);
  }
}

async function bulkUpload(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'Please upload an Excel file' });
    }

    const result = await assessmentBulkService.bulkCreateFromExcel(req.file.buffer);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getActiveAssessment(req, res, next) {
  try {
    const result = await assessmentService.getActiveAssessmentForStudent();
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function submitAssessment(req, res, next) {
  try {
    const student = req.studentRecord;
    const payload = {
      ...req.body,
      studentName: student.fullName,
      email: student.email,
      collegeName: student.collegeName || req.body.collegeName || 'N/A',
    };
    const result = await assessmentService.submitAssessment(req.params.id, payload);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listResults(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const resultFilter = req.query.result ? String(req.query.result) : undefined;
    const data = await assessmentService.listResults({
      page,
      result: resultFilter,
    });
    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
}

async function getResult(req, res, next) {
  try {
    const result = await assessmentService.getResultDetail(req.params.submissionId);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function setPersonalScore(req, res, next) {
  try {
    const result = await assessmentService.setPersonalScore(
      req.params.submissionId,
      req.params.answerId,
      req.body.personalScore,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function fullEvaluate(req, res, next) {
  try {
    const result = await assessmentService.fullEvaluate(req.params.submissionId);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function deleteResult(req, res, next) {
  try {
    const result = await assessmentService.deleteResult(req.params.submissionId);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function bulkDeleteResults(req, res, next) {
  try {
    const result = await assessmentService.bulkDeleteResults(req.body.ids);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function exportResults(req, res, next) {
  try {
    const resultFilter = req.query.result ? String(req.query.result) : undefined;
    const buffer = await assessmentService.exportResultsWorkbook({
      result: resultFilter,
    });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="assessment-results.xlsx"',
    );
    return res.status(200).send(buffer);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listQuestions,
  createQuestion,
  listAssessments,
  createAssessment,
  updateAssessment,
  getAssessment,
  deleteAssessment,
  downloadBulkSample,
  bulkUpload,
  getActiveAssessment,
  submitAssessment,
  listResults,
  getResult,
  setPersonalScore,
  fullEvaluate,
  deleteResult,
  bulkDeleteResults,
  exportResults,
};
