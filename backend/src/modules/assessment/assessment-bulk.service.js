'use strict';

const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const assessmentService = require('@modules/assessment/assessment.service');
const { createAssessmentSchema } = require('@modules/assessment/assessment.validator');

const REQUIRED_HEADERS = [
  'assessmentName',
  'status',
  'questionCount',
  'questionOrderMode',
  'jumbledOptionsMarks',
  'personalResponseMarks',
  'weightingMode',
  'passMarks',
  'questionTitle',
  'category',
  'answerType',
  'questionJumbledOptionsMarks',
  'questionPersonalResponseMarks',
  'question',
  'option1',
  'option2',
  'option3',
  'option4',
];

const HEADER_ALIASES = {
  assessmentname: 'assessmentName',
  name: 'assessmentName',
  status: 'status',
  questioncount: 'questionCount',
  questionordermode: 'questionOrderMode',
  jumbledoptionsmarks: 'jumbledOptionsMarks',
  personalresponsemarks: 'personalResponseMarks',
  weightingmode: 'weightingMode',
  passmarks: 'passMarks',
  questiontitle: 'questionTitle',
  category: 'category',
  answertype: 'answerType',
  questiontype: 'answerType',
  questionjumbledoptionsmarks: 'questionJumbledOptionsMarks',
  questionpersonalresponsemarks: 'questionPersonalResponseMarks',
  title: 'questionTitle',
  question: 'question',
  questiontext: 'question',
  option1: 'option1',
  option2: 'option2',
  option3: 'option3',
  option4: 'option4',
};

function badRequest(message, errors) {
  const err = new Error(message);
  err.statusCode = 400;
  if (errors) err.errors = errors;
  return err;
}

function cellToString(value) {
  if (value == null) return '';
  return String(value).trim();
}

function normalizeHeader(header) {
  const key = cellToString(header).replace(/\s+/g, '').toLowerCase();
  return HEADER_ALIASES[key] || null;
}

async function buildSampleWorkbookBuffer() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Assessments');

  const headerRow = sheet.addRow(REQUIRED_HEADERS);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
  });

  sheet.addRow([
    'Digital Literacy Assessment',
    'ACTIVE',
    2,
    'sequential',
    60,
    40,
    'EQUAL',
    70,
    'Core Competency: Community Impact',
    'OBSERVATION',
    'BOTH',
    60,
    40,
    'How would you use technology to improve learning in your community?',
    'Identify local learning gaps with short community surveys',
    'Train peer mentors to support first-time learners',
    'Share learning resources through an accessible digital platform',
    'Track engagement and improve content based on results',
  ]);

  sheet.addRow([
    'Digital Literacy Assessment',
    'ACTIVE',
    2,
    'sequential',
    60,
    40,
    'EQUAL',
    70,
    'Core Competency: Career Readiness',
    'THINKING',
    'BOTH',
    60,
    40,
    'What skills do you most want to build, and how will you measure your progress?',
    'Choose 1-2 priority skills tied to your career door',
    'Practice weekly with small, measurable goals',
    'Build a simple portfolio piece that shows those skills',
    'Review progress every 30 days and adjust your plan',
  ]);

  REQUIRED_HEADERS.forEach((_, index) => {
    sheet.getColumn(index + 1).width = 28;
  });

  const instructions = workbook.addWorksheet('Instructions');
  const instructionHeader = instructions.addRow(['Column', 'Required', 'Rules']);
  instructionHeader.eachCell((cell) => {
    cell.font = { bold: true };
  });
  [
    ['assessmentName', 'Yes', 'Assessment name. Rows with the same name become one assessment.'],
    ['status', 'Yes', 'ACTIVE | DRAFT | ARCHIVED (only one ACTIVE assessment is kept)'],
    ['questionCount', 'Yes', 'How many questions to ask students. On upload this is set to the number of question rows for that assessment so admin and student stay in sync.'],
    ['questionOrderMode', 'Yes', 'sequential | random | jumbled'],
    ['jumbledOptionsMarks', 'Yes', 'Marks for jumbled options per question (number >= 0)'],
    ['personalResponseMarks', 'Yes', 'Marks for personal response per question (number >= 0)'],
    ['weightingMode', 'Yes', 'EQUAL or INDIVIDUAL. EQUAL uses the assessment marks; INDIVIDUAL uses the question marks below.'],
    ['passMarks', 'Yes', 'Absolute pass threshold for the assessment'],
    ['questionTitle', 'Yes', 'Question title'],
    ['category', 'Yes', 'OBSERVATION | THINKING | BUILDING'],
    ['answerType', 'Yes', 'JUMBLED | PERSONAL | BOTH — controls which answer parts students complete'],
    ['questionJumbledOptionsMarks', 'Yes', 'Per-question jumbled score cap; required when weightingMode is INDIVIDUAL and answerType includes jumbled.'],
    ['questionPersonalResponseMarks', 'Yes', 'Per-question personal score cap; required when weightingMode is INDIVIDUAL and answerType includes personal.'],
    ['question', 'Yes', 'Main question text'],
    ['option1..option4', 'Conditional', 'Required (exactly 4, correct order) for JUMBLED and BOTH. Leave blank for PERSONAL.'],
  ].forEach((row) => instructions.addRow(row));
  instructions.getColumn(1).width = 24;
  instructions.getColumn(2).width = 16;
  instructions.getColumn(3).width = 80;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function mapRowsToAssessments(rawRows) {
  if (!rawRows.length) {
    throw badRequest('Excel file has no data rows');
  }

  const headerRow = rawRows[0];
  const mappedHeaders = headerRow.map((h) => normalizeHeader(h));

  const missing = REQUIRED_HEADERS.filter(
    (required) => !mappedHeaders.includes(required),
  );
  if (missing.length > 0) {
    throw badRequest(
      `Missing required columns: ${missing.join(', ')}`,
      missing.map((col) => ({ row: 1, field: col, message: 'Required column missing' })),
    );
  }

  const errors = [];
  const groups = new Map();

  for (let i = 1; i < rawRows.length; i += 1) {
    const rowNumber = i + 1;
    const row = rawRows[i];
    if (!row || row.every((cell) => cellToString(cell) === '')) continue;

    const record = {};
    mappedHeaders.forEach((header, index) => {
      if (header) record[header] = row[index];
    });

    const assessmentName = cellToString(record.assessmentName);
    const status = cellToString(record.status).toUpperCase() || 'DRAFT';
    const questionOrderMode = cellToString(record.questionOrderMode).toLowerCase() || 'sequential';
    const weightingMode = cellToString(record.weightingMode).toUpperCase() || 'EQUAL';
    const questionTitle = cellToString(record.questionTitle);
    const category = cellToString(record.category).toUpperCase();
    const question = cellToString(record.question);

    if (!assessmentName) {
      errors.push({ row: rowNumber, field: 'assessmentName', message: 'assessmentName is required' });
    }
    if (!['ACTIVE', 'DRAFT', 'ARCHIVED'].includes(status)) {
      errors.push({
        row: rowNumber,
        field: 'status',
        message: 'status must be ACTIVE, DRAFT, or ARCHIVED',
      });
    }
    if (!['sequential', 'random', 'jumbled'].includes(questionOrderMode)) {
      errors.push({
        row: rowNumber,
        field: 'questionOrderMode',
        message: 'questionOrderMode must be sequential, random, or jumbled',
      });
    }
    if (!['EQUAL', 'INDIVIDUAL'].includes(weightingMode)) errors.push({ row: rowNumber, field: 'weightingMode', message: 'weightingMode must be EQUAL or INDIVIDUAL' });
    if (!['OBSERVATION', 'THINKING', 'BUILDING'].includes(category)) errors.push({ row: rowNumber, field: 'category', message: 'category must be OBSERVATION, THINKING, or BUILDING' });

    const answerType = cellToString(record.answerType).toUpperCase() || 'BOTH';
    if (!['JUMBLED', 'PERSONAL', 'BOTH'].includes(answerType)) {
      errors.push({
        row: rowNumber,
        field: 'answerType',
        message: 'answerType must be JUMBLED, PERSONAL, or BOTH',
      });
    }
    const requiresJumbled = answerType === 'JUMBLED' || answerType === 'BOTH';
    const requiresPersonal = answerType === 'PERSONAL' || answerType === 'BOTH';

    const questionCount = Number(record.questionCount);
    const jumbledOptionsMarks = Number(record.jumbledOptionsMarks);
    const personalResponseMarks = Number(record.personalResponseMarks);
    const passMarks = Number(record.passMarks);
    const questionJumbledOptionsMarks = Number(record.questionJumbledOptionsMarks);
    const questionPersonalResponseMarks = Number(record.questionPersonalResponseMarks);

    if (!Number.isFinite(questionCount) || questionCount < 1) {
      errors.push({
        row: rowNumber,
        field: 'questionCount',
        message: 'questionCount must be a positive number',
      });
    }
    if (!Number.isFinite(jumbledOptionsMarks) || jumbledOptionsMarks < 0) {
      errors.push({
        row: rowNumber,
        field: 'jumbledOptionsMarks',
        message: 'jumbledOptionsMarks must be a number >= 0',
      });
    }
    if (!Number.isFinite(personalResponseMarks) || personalResponseMarks < 0) {
      errors.push({
        row: rowNumber,
        field: 'personalResponseMarks',
        message: 'personalResponseMarks must be a number >= 0',
      });
    }
    if (!Number.isFinite(passMarks) || passMarks < 0) {
      errors.push({
        row: rowNumber,
        field: 'passMarks',
        message: 'passMarks must be a number >= 0',
      });
    }
    if (
      weightingMode === 'INDIVIDUAL' &&
      ((requiresJumbled && (!Number.isFinite(questionJumbledOptionsMarks) || questionJumbledOptionsMarks < 0)) ||
        (requiresPersonal && (!Number.isFinite(questionPersonalResponseMarks) || questionPersonalResponseMarks < 0)))
    ) {
      errors.push({
        row: rowNumber,
        field: 'question marks',
        message: 'Individual weighting requires non-negative marks for the answer parts used by this question',
      });
    }
    if (!questionTitle) {
      errors.push({ row: rowNumber, field: 'questionTitle', message: 'questionTitle is required' });
    }
    if (!question) {
      errors.push({ row: rowNumber, field: 'question', message: 'question is required' });
    }

    const options = ['option1', 'option2', 'option3', 'option4'].map((key, index) => ({
      label: cellToString(record[key]),
      correctOrder: index + 1,
    }));

    if (requiresJumbled) {
      if (options.some((opt) => !opt.label)) {
        errors.push({
          row: rowNumber,
          field: 'option1-option4',
          message: 'Exactly 4 options are required (option1 to option4) for JUMBLED and BOTH',
        });
      }
    } else if (options.some((opt) => opt.label)) {
      errors.push({
        row: rowNumber,
        field: 'option1-option4',
        message: 'Leave option1..option4 blank for PERSONAL answerType',
      });
    }

    const groupKey = assessmentName.toLowerCase();
    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        name: assessmentName,
        domain: 'General',
        status,
        questionCount,
        questionOrderMode,
        jumbledOptionsMarks,
        personalResponseMarks,
        weightingMode,
        passMarks,
        questionIds: [],
        questions: [],
        sourceRows: [],
      });
    }

    const group = groups.get(groupKey);
    group.sourceRows.push(rowNumber);
    group.questions.push({
      title: questionTitle,
      prompt: '',
      question,
      tips: [],
      answerType,
      options: requiresJumbled ? options : [],
      category,
      jumbledOptionsMarks: requiresJumbled ? questionJumbledOptionsMarks : 0,
      personalResponseMarks: requiresPersonal ? questionPersonalResponseMarks : 0,
    });

    if (group.name === assessmentName) {
      if (group.status !== status) {
        errors.push({
          row: rowNumber,
          field: 'status',
          message: `status must match other rows for assessment "${assessmentName}"`,
        });
      }
      if (group.questionOrderMode !== questionOrderMode) {
        errors.push({
          row: rowNumber,
          field: 'questionOrderMode',
          message: `questionOrderMode must match other rows for assessment "${assessmentName}"`,
        });
      }
      if (Number(group.questionCount) !== questionCount) {
        errors.push({
          row: rowNumber,
          field: 'questionCount',
          message: `questionCount must match other rows for assessment "${assessmentName}"`,
        });
      }
      if (Number(group.jumbledOptionsMarks) !== jumbledOptionsMarks) {
        errors.push({
          row: rowNumber,
          field: 'jumbledOptionsMarks',
          message: `jumbledOptionsMarks must match other rows for assessment "${assessmentName}"`,
        });
      }
      if (Number(group.personalResponseMarks) !== personalResponseMarks) {
        errors.push({
          row: rowNumber,
          field: 'personalResponseMarks',
          message: `personalResponseMarks must match other rows for assessment "${assessmentName}"`,
        });
      }
      if (Number(group.passMarks) !== passMarks) {
        errors.push({
          row: rowNumber,
          field: 'passMarks',
          message: `passMarks must match other rows for assessment "${assessmentName}"`,
        });
      }
      if (group.weightingMode !== weightingMode) errors.push({ row: rowNumber, field: 'weightingMode', message: `weightingMode must match other rows for assessment "${assessmentName}"` });
    }
  }

  if (errors.length > 0) {
    throw badRequest(
      `Excel validation failed (${errors.length} error${errors.length === 1 ? '' : 's'})`,
      errors.slice(0, 50),
    );
  }

  if (groups.size === 0) {
    throw badRequest('Excel file has no valid assessment rows');
  }

  const payloads = [];
  for (const group of groups.values()) {
    if (group.questionCount > group.questions.length) {
      throw badRequest(
        `Assessment "${group.name}" questionCount (${group.questionCount}) exceeds questions provided (${group.questions.length})`,
      );
    }

    const { error, value } = createAssessmentSchema.validate(
      {
        name: group.name,
        domain: group.domain,
        status: group.status,
        // Students always receive the full uploaded question set for this assessment.
        questionCount: group.questions.length,
        questionOrderMode: group.questionOrderMode,
        jumbledOptionsMarks: group.jumbledOptionsMarks,
        personalResponseMarks: group.personalResponseMarks,
        weightingMode: group.weightingMode,
        passMarks: group.passMarks,
        // Sensible defaults for bulk uploads (admin can edit after).
        durationMinutes: 60,
        questionIds: [],
        questions: group.questions,
      },
      { abortEarly: false, stripUnknown: true },
    );

    if (error) {
      throw badRequest(
        `Invalid assessment "${group.name}": ${error.details[0]?.message || 'validation failed'}`,
        error.details.map((d) => ({
          row: group.sourceRows[0],
          field: d.path.join('.'),
          message: d.message,
        })),
      );
    }

    payloads.push(value);
  }

  return payloads;
}

function parseExcelBuffer(buffer) {
  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  } catch {
    throw badRequest('Unable to read Excel file. Upload a valid .xlsx or .xls file.');
  }

  const sheetName = workbook.SheetNames.includes('Assessments')
    ? 'Assessments'
    : workbook.SheetNames[0];

  if (!sheetName) {
    throw badRequest('Excel file has no sheets');
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  return mapRowsToAssessments(rawRows);
}

async function bulkCreateFromExcel(buffer) {
  const payloads = parseExcelBuffer(buffer);
  const created = [];

  for (const payload of payloads) {
    const assessment = await assessmentService.createAssessment(payload);
    created.push(assessment);
  }

  return {
    createdCount: created.length,
    assessments: created,
  };
}

module.exports = {
  buildSampleWorkbookBuffer,
  bulkCreateFromExcel,
  REQUIRED_HEADERS,
};
