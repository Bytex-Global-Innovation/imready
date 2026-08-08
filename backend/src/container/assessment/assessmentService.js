'use strict';

const crypto = require('crypto');
const ExcelJS = require('exceljs');
const { Op, fn, col, where } = require('sequelize');
const sequelize = require('@connections/sequelize');
const {
  setupAssessmentAssociations,
  Assessment,
  AssessmentQuestion,
  AssessmentQuestionOption,
  AssessmentQuestionLink,
  AssessmentSubmission,
  AssessmentSubmissionAnswer,
} = require('@container/assessment/assessmentAssociations');

setupAssessmentAssociations();

const DEFAULT_TIPS = [
  'Rearrange the steps into the strongest sequence first',
  'Be specific about tools',
  'Mention a metric of success',
];

const ANSWER_TYPES = new Set(['JUMBLED', 'PERSONAL', 'BOTH']);

function normalizeAnswerType(value) {
  const type = String(value || 'BOTH').toUpperCase();
  return ANSWER_TYPES.has(type) ? type : 'BOTH';
}

function needsJumbled(answerType) {
  const type = normalizeAnswerType(answerType);
  return type === 'JUMBLED' || type === 'BOTH';
}

function needsPersonal(answerType) {
  const type = normalizeAnswerType(answerType);
  return type === 'PERSONAL' || type === 'BOTH';
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function notFound(message) {
  const err = new Error(message || 'Resource not found');
  err.statusCode = 404;
  return err;
}

function toNumber(value) {
  return Number(value) || 0;
}

function normalizeTips(tips) {
  if (!Array.isArray(tips)) return [...DEFAULT_TIPS];
  const cleaned = tips.map((tip) => String(tip || '').trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : [...DEFAULT_TIPS];
}

async function assertUniqueAssessmentName(name, excludeId, transaction) {
  const normalized = String(name || '').trim().toLowerCase();
  if (!normalized) {
    throw badRequest('Assessment name is required');
  }

  const clauses = [
    where(fn('LOWER', col('name')), normalized),
    { deletedAt: null },
  ];
  if (excludeId != null) {
    clauses.push({ id: { [Op.ne]: excludeId } });
  }

  const existing = await Assessment.findOne({
    where: { [Op.and]: clauses },
    transaction,
  });

  if (existing) {
    throw badRequest(
      'An assessment with this name already exists. Assessment names must be unique.',
    );
  }
}

async function assertCanActivateAssessment(excludeId, transaction) {
  const whereClause = { status: 'ACTIVE', deletedAt: null };
  if (excludeId != null) {
    whereClause.id = { [Op.ne]: excludeId };
  }

  const active = await Assessment.findOne({
    where: whereClause,
    attributes: ['id', 'name'],
    transaction,
  });

  if (active) {
    throw badRequest(
      `Already one assessment is active ("${active.name}"). First change its status, then make this assessment active manually. Only one assessment can be active at a time.`,
    );
  }
}

function formatPassMarks(passMarks, questionCount, jumbledMarks, personalMarks) {
  const total = questionCount * (toNumber(jumbledMarks) + toNumber(personalMarks));
  return `${toNumber(passMarks)}/${total || 100}`;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function scoreJumbledOrder(submittedOrder, correctOrder, maxMarks) {
  if (!Array.isArray(submittedOrder) || !Array.isArray(correctOrder) || correctOrder.length === 0) {
    return 0;
  }
  if (submittedOrder.length !== correctOrder.length) {
    return 0;
  }
  let correctPositions = 0;
  for (let i = 0; i < correctOrder.length; i += 1) {
    if (submittedOrder[i] === correctOrder[i]) {
      correctPositions += 1;
    }
  }
  return Number(((correctPositions / correctOrder.length) * maxMarks).toFixed(2));
}

async function createQuestionRecord(questionInput, transaction) {
  const answerType = normalizeAnswerType(questionInput.answerType);
  const options = Array.isArray(questionInput.options) ? questionInput.options : [];

  if (needsJumbled(answerType)) {
    if (options.length !== 4) {
      throw badRequest('Jumbled and combined questions must have exactly 4 options');
    }
  } else if (options.length > 0) {
    throw badRequest('Personal-response-only questions must not include options');
  }

  const question = await AssessmentQuestion.create(
    {
      uuid: crypto.randomUUID(),
      title: questionInput.title,
      prompt: questionInput.prompt || '',
      question: questionInput.question,
      tips: normalizeTips(questionInput.tips),
      answerType,
    },
    { transaction },
  );

  if (options.length > 0) {
    const optionRows = options.map((option) => ({
      questionId: question.id,
      optionKey: `q${question.id}-${crypto.randomBytes(6).toString('hex')}`,
      label: option.label,
      correctOrder: option.correctOrder,
    }));

    const used = new Set();
    optionRows.forEach((row, index) => {
      let key = row.optionKey;
      if (used.has(key)) {
        key = `q${question.id}-${index + 1}-${crypto.randomBytes(4).toString('hex')}`;
        row.optionKey = key;
      }
      used.add(key);
    });

    await AssessmentQuestionOption.bulkCreate(optionRows, { transaction });
  }

  return question;
}

async function cloneQuestionById(questionId, transaction) {
  const source = await AssessmentQuestion.findByPk(questionId, {
    include: [{ model: AssessmentQuestionOption, as: 'options' }],
    transaction,
  });

  if (!source) {
    throw badRequest('One or more selected questions were not found');
  }

  const answerType = normalizeAnswerType(source.answerType);
  const options = needsJumbled(answerType)
    ? (source.options || [])
        .slice()
        .sort((a, b) => a.correctOrder - b.correctOrder)
        .map((option) => ({
          label: option.label,
          correctOrder: option.correctOrder,
        }))
    : [];

  return createQuestionRecord(
    {
      title: source.title,
      prompt: source.prompt,
      question: source.question,
      tips: normalizeTips(source.tips),
      answerType,
      options,
    },
    transaction,
  );
}

function serializeQuestion(question, { includeCorrectOrder = false } = {}) {
  const answerType = normalizeAnswerType(question.answerType);
  const options = needsJumbled(answerType)
    ? (question.options || [])
        .slice()
        .sort((a, b) => a.correctOrder - b.correctOrder)
        .map((option) => {
          const item = {
            id: option.optionKey,
            label: option.label,
          };
          if (includeCorrectOrder) {
            item.correctOrder = option.correctOrder;
          }
          return item;
        })
    : [];

  return {
    id: Number(question.id),
    uuid: question.uuid,
    title: question.title,
    prompt: question.prompt,
    question: question.question,
    tips: normalizeTips(question.tips),
    answerType,
    options,
  };
}

async function listQuestions() {
  const questions = await AssessmentQuestion.findAll({
    include: [{ model: AssessmentQuestionOption, as: 'options' }],
    order: [
      ['id', 'DESC'],
      [{ model: AssessmentQuestionOption, as: 'options' }, 'correctOrder', 'ASC'],
    ],
  });

  const seen = new Set();
  const unique = [];
  for (const question of questions) {
    const serialized = serializeQuestion(question, { includeCorrectOrder: true });
    const fingerprint = `${String(serialized.title).trim().toLowerCase()}::${String(serialized.question).trim().toLowerCase()}`;
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    unique.push(serialized);
  }

  return { questions: unique };
}

async function createQuestion(payload) {
  const answerType = normalizeAnswerType(payload.answerType);
  const options = Array.isArray(payload.options) ? payload.options : [];

  if (needsJumbled(answerType)) {
    if (options.length !== 4) {
      throw badRequest('Jumbled and combined questions must have exactly 4 options');
    }
    const orders = options.map((o) => o.correctOrder).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i += 1) {
      if (orders[i] !== i + 1) {
        throw badRequest('Option correctOrder values must be unique and consecutive starting at 1');
      }
    }
  } else if (options.length > 0) {
    throw badRequest('Personal-response-only questions must not include options');
  }

  const question = await sequelize.transaction(async (transaction) =>
    createQuestionRecord({ ...payload, answerType }, transaction),
  );

  const full = await AssessmentQuestion.findByPk(question.id, {
    include: [{ model: AssessmentQuestionOption, as: 'options' }],
  });

  return serializeQuestion(full, { includeCorrectOrder: true });
}

function questionFingerprint(title, questionText) {
  return `${String(title || '').trim().toLowerCase()}::${String(questionText || '').trim().toLowerCase()}`;
}

async function resolveOwnedQuestionIds(payload, transaction) {
  const ownedQuestionIds = [];
  const seen = new Set();

  for (const questionInput of payload.questions || []) {
    const fingerprint = questionFingerprint(questionInput.title, questionInput.question);
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    const created = await createQuestionRecord(questionInput, transaction);
    const answerType = normalizeAnswerType(questionInput.answerType);
    ownedQuestionIds.push({
      questionId: Number(created.id),
      category: questionInput.category,
      jumbledOptionsMarks: needsJumbled(answerType) ? questionInput.jumbledOptionsMarks : 0,
      personalResponseMarks: needsPersonal(answerType) ? questionInput.personalResponseMarks : 0,
    });
  }

  const bankIds = [...new Set((payload.questionIds || []).map(Number))];
  for (const questionId of bankIds) {
    const source = await AssessmentQuestion.findByPk(questionId, {
      include: [{ model: AssessmentQuestionOption, as: 'options' }],
      transaction,
    });
    if (!source) {
      throw badRequest('One or more selected questions were not found');
    }
    const fingerprint = questionFingerprint(source.title, source.question);
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    const cloned = await cloneQuestionById(questionId, transaction);
    ownedQuestionIds.push({ questionId: Number(cloned.id), category: 'OBSERVATION' });
  }

  const selectedIds = ownedQuestionIds.filter((item, index, items) => items.findIndex((other) => other.questionId === item.questionId) === index);

  if (selectedIds.length === 0) {
    throw badRequest('Select or add at least one question');
  }

  if (payload.questionCount > selectedIds.length) {
    throw badRequest('questionCount cannot exceed the number of selected questions');
  }

  return selectedIds;
}

async function createAssessment(payload) {
  return sequelize.transaction(async (transaction) => {
    await assertUniqueAssessmentName(payload.name, null, transaction);

    const selectedIds = await resolveOwnedQuestionIds(payload, transaction);
    const status = payload.status || 'DRAFT';

    if (status === 'ACTIVE') {
      await assertCanActivateAssessment(null, transaction);
    }

    const assessment = await Assessment.create(
      {
        uuid: crypto.randomUUID(),
        name: payload.name,
        domain: payload.domain || 'General',
        status,
        questionCount: payload.questionCount,
        questionOrderMode: payload.questionOrderMode || 'sequential',
        jumbledOptionsMarks: payload.jumbledOptionsMarks,
        personalResponseMarks: payload.personalResponseMarks,
        weightingMode: payload.weightingMode || 'EQUAL',
        passMarks: payload.passMarks,
      },
      { transaction },
    );

    await AssessmentQuestionLink.bulkCreate(
      selectedIds.map((item, index) => ({
        assessmentId: assessment.id,
        questionId: item.questionId,
        sortOrder: index + 1,
        category: item.category,
        jumbledOptionsMarks: payload.weightingMode === 'INDIVIDUAL' ? item.jumbledOptionsMarks : null,
        personalResponseMarks: payload.weightingMode === 'INDIVIDUAL' ? item.personalResponseMarks : null,
      })),
      { transaction },
    );

    return serializeAssessmentListItem(assessment);
  });
}

async function updateAssessment(id, payload) {
  return sequelize.transaction(async (transaction) => {
    const assessment = await Assessment.findByPk(id, { transaction });
    if (!assessment) throw notFound('Assessment not found');

    await assertUniqueAssessmentName(payload.name, assessment.id, transaction);

    const oldLinks = await AssessmentQuestionLink.findAll({
      where: { assessmentId: assessment.id },
      transaction,
    });
    const oldQuestionIds = oldLinks.map((link) => Number(link.questionId));

    const selectedIds = await resolveOwnedQuestionIds(payload, transaction);
    const status = payload.status || assessment.status;

    if (status === 'ACTIVE' && assessment.status !== 'ACTIVE') {
      await assertCanActivateAssessment(assessment.id, transaction);
    }

    assessment.name = payload.name;
    assessment.domain = payload.domain || assessment.domain || 'General';
    assessment.status = status;
    assessment.questionCount = payload.questionCount;
    assessment.questionOrderMode = payload.questionOrderMode || 'sequential';
    assessment.jumbledOptionsMarks = payload.jumbledOptionsMarks;
    assessment.personalResponseMarks = payload.personalResponseMarks;
    assessment.weightingMode = payload.weightingMode || 'EQUAL';
    assessment.passMarks = payload.passMarks;
    await assessment.save({ transaction });

    await AssessmentQuestionLink.destroy({
      where: { assessmentId: assessment.id },
      transaction,
    });

    await AssessmentQuestionLink.bulkCreate(
      selectedIds.map((item, index) => ({
        assessmentId: assessment.id,
        questionId: item.questionId,
        sortOrder: index + 1,
        category: item.category,
        jumbledOptionsMarks: payload.weightingMode === 'INDIVIDUAL' ? item.jumbledOptionsMarks : null,
        personalResponseMarks: payload.weightingMode === 'INDIVIDUAL' ? item.personalResponseMarks : null,
      })),
      { transaction },
    );

    for (const questionId of oldQuestionIds) {
      const stillLinked = await AssessmentQuestionLink.count({
        where: { questionId },
        transaction,
      });
      if (stillLinked > 0) continue;

      const answerRefs = await AssessmentSubmissionAnswer.count({
        where: { questionId },
        transaction,
      });
      if (answerRefs > 0) continue;

      await AssessmentQuestionOption.destroy({
        where: { questionId },
        transaction,
      });
      await AssessmentQuestion.destroy({
        where: { id: questionId },
        transaction,
      });
    }

    return serializeAssessmentListItem(assessment);
  });
}

function serializeAssessmentListItem(assessment) {
  return {
    id: String(assessment.id),
    uuid: assessment.uuid,
    name: assessment.name,
    domain: assessment.domain,
    passMarks: formatPassMarks(
      assessment.passMarks,
      assessment.questionCount,
      assessment.jumbledOptionsMarks,
      assessment.personalResponseMarks,
    ),
    status: assessment.status,
    questionCount: assessment.questionCount,
    questionOrderMode: assessment.questionOrderMode,
    jumbledOptionsMarks: toNumber(assessment.jumbledOptionsMarks),
    personalResponseMarks: toNumber(assessment.personalResponseMarks),
    weightingMode: assessment.weightingMode || 'EQUAL',
    passMarksValue: toNumber(assessment.passMarks),
  };
}

async function listAssessments(page = 1, pageSize = 5) {
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * pageSize;

  const { rows, count } = await Assessment.findAndCountAll({
    where: { deletedAt: null },
    order: [['id', 'DESC']],
    limit: pageSize,
    offset,
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalThisMonth, activeSessions, evaluated] = await Promise.all([
    Assessment.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
    AssessmentSubmission.count({
      where: { status: { [Op.in]: ['SUBMITTED', 'PARTIALLY_EVALUATED'] } },
    }),
    AssessmentSubmission.findAll({
      where: { result: { [Op.in]: ['PASS', 'FAIL'] } },
      attributes: ['result'],
    }),
  ]);

  const passCount = evaluated.filter((s) => s.result === 'PASS').length;
  const avgPassRate =
    evaluated.length === 0
      ? '0%'
      : `${((passCount / evaluated.length) * 100).toFixed(1)}%`;

  return {
    assessments: rows.map(serializeAssessmentListItem),
    total: count,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
    totalThisMonth,
    activeSessions,
    avgPassRate,
  };
}

async function getAssessmentById(id) {
  const assessment = await Assessment.findOne({
    where: { id, deletedAt: null },
    include: [
      {
        model: AssessmentQuestionLink,
        as: 'questionLinks',
        include: [
          {
            model: AssessmentQuestion,
            as: 'question',
            include: [{ model: AssessmentQuestionOption, as: 'options' }],
          },
        ],
      },
    ],
  });

  if (!assessment) throw notFound('Assessment not found');

  const questions = (assessment.questionLinks || [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((link) => link.question)
    .map((link) => ({
      ...serializeQuestion(link.question, { includeCorrectOrder: true }),
      category: link.category,
      jumbledOptionsMarks: link.jumbledOptionsMarks == null ? null : toNumber(link.jumbledOptionsMarks),
      personalResponseMarks: link.personalResponseMarks == null ? null : toNumber(link.personalResponseMarks),
    }));

  return {
    ...serializeAssessmentListItem(assessment),
    questions,
  };
}

async function deleteAssessment(id) {
  const assessment = await Assessment.findOne({
    where: { id },
  });
  if (!assessment) throw notFound('Assessment not found');

  // Soft-delete only: keep submissions/answers for Assessment Results
  assessment.status = 'ARCHIVED';
  await assessment.save();
  await assessment.destroy();

  return { id: String(id), deleted: true };
}

function shuffleAwayFromCorrect(options, correctOrderIds) {
  if (!options || options.length <= 1) {
    return options ? [...options] : [];
  }

  let shuffled = shuffle(options);
  const matchesCorrect = () =>
    shuffled.length === correctOrderIds.length &&
    shuffled.every((option, index) => option.id === correctOrderIds[index]);

  let attempts = 0;
  while (matchesCorrect() && attempts < 8) {
    shuffled = shuffle(options);
    attempts += 1;
  }

  if (matchesCorrect()) {
    shuffled = [...shuffled];
    const tmp = shuffled[0];
    shuffled[0] = shuffled[1];
    shuffled[1] = tmp;
  }

  return shuffled;
}

function pickQuestionsForStudent(assessment, linkedQuestions) {
  const ordered = linkedQuestions
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((link) => link.question);

  const count = Math.min(assessment.questionCount, ordered.length);
  let selected = ordered;

  if (assessment.questionOrderMode === 'sequential') {
    selected = ordered.slice(0, count);
  } else {
    selected = shuffle(ordered).slice(0, count);
  }

  return selected.map((link) => {
    const question = link.question;
    const answerType = normalizeAnswerType(question.answerType);
    const correctOrderIds = needsJumbled(answerType)
      ? (question.options || [])
          .slice()
          .sort((a, b) => a.correctOrder - b.correctOrder)
          .map((option) => option.optionKey)
      : [];

    const serialized = serializeQuestion(question, { includeCorrectOrder: false });
    serialized.category = link.category || 'OBSERVATION';
    if (needsJumbled(answerType)) {
      // Always jumble options for students — never show admin correct order
      serialized.options = shuffleAwayFromCorrect(serialized.options, correctOrderIds);
    } else {
      serialized.options = [];
    }
    return serialized;
  });
}

async function getActiveAssessmentForStudent() {
  const assessment = await Assessment.findOne({
    where: { status: 'ACTIVE', deletedAt: null },
    order: [['updatedAt', 'DESC'], ['id', 'DESC']],
    include: [
      {
        model: AssessmentQuestionLink,
        as: 'questionLinks',
        include: [
          {
            model: AssessmentQuestion,
            as: 'question',
            include: [{ model: AssessmentQuestionOption, as: 'options' }],
          },
        ],
      },
    ],
  });

  if (!assessment) {
    throw notFound('No active assessment available');
  }

  const questions = pickQuestionsForStudent(assessment, assessment.questionLinks || []);

  return {
    id: String(assessment.id),
    questionCount: questions.length,
    questionOrderMode: assessment.questionOrderMode,
    questions: questions.map((q) => ({
      id: q.id,
      title: q.title,
      prompt: q.prompt,
      question: q.question,
      category: q.category,
      answerType: q.answerType,
      tips: normalizeTips(q.tips),
      options: q.options.map((option) => ({
        id: option.id,
        label: option.label,
      })),
    })),
  };
}

async function submitAssessment(assessmentId, payload) {
  const assessment = await Assessment.findByPk(assessmentId, {
    include: [
      {
        model: AssessmentQuestionLink,
        as: 'questionLinks',
        include: [
          {
            model: AssessmentQuestion,
            as: 'question',
            include: [{ model: AssessmentQuestionOption, as: 'options' }],
          },
        ],
      },
    ],
  });

  if (!assessment || assessment.status !== 'ACTIVE') {
    throw notFound('Assessment not found or not active');
  }

  const allowedQuestionIds = new Set(
    (assessment.questionLinks || []).map((link) => Number(link.questionId)),
  );
  const linkByQuestionId = new Map(
    (assessment.questionLinks || []).map((link) => [Number(link.questionId), link]),
  );

  const expectedCount = Math.min(assessment.questionCount, allowedQuestionIds.size);
  if (payload.answers.length !== expectedCount) {
    throw badRequest(`Exactly ${expectedCount} answers are required`);
  }

  const questionMap = new Map();
  for (const link of assessment.questionLinks || []) {
    if (link.question) {
      questionMap.set(Number(link.question.id), link.question);
    }
  }

  const seenQuestions = new Set();
  for (const answer of payload.answers) {
    const qid = Number(answer.questionId);
    if (!allowedQuestionIds.has(qid)) {
      throw badRequest('Answer references a question not in this assessment');
    }
    if (seenQuestions.has(qid)) {
      throw badRequest('Duplicate answers for the same question are not allowed');
    }
    seenQuestions.add(qid);

    const question = questionMap.get(qid);
    const answerType = normalizeAnswerType(question?.answerType);

    if (needsJumbled(answerType)) {
      const optionKeys = (question.options || []).map((o) => o.optionKey).sort();
      const submittedKeys = [...(answer.optionOrder || [])].sort();
      if (
        optionKeys.length !== submittedKeys.length ||
        optionKeys.some((key, idx) => key !== submittedKeys[idx])
      ) {
        throw badRequest('Invalid option order for one or more questions');
      }
    } else if (answer.optionOrder && answer.optionOrder.length > 0) {
      throw badRequest('Option order is not allowed for personal-response-only questions');
    }
  }

  return sequelize.transaction(async (transaction) => {
    let totalJumbled = 0;
    const answerRows = [];

    for (const answer of payload.answers) {
      const question = questionMap.get(Number(answer.questionId));
      const questionLink = linkByQuestionId.get(Number(answer.questionId));
      const answerType = normalizeAnswerType(question?.answerType);

      let jumbledMax = assessment.weightingMode === 'INDIVIDUAL'
        ? toNumber(questionLink?.jumbledOptionsMarks)
        : toNumber(assessment.jumbledOptionsMarks);
      let personalMax = assessment.weightingMode === 'INDIVIDUAL'
        ? toNumber(questionLink?.personalResponseMarks)
        : toNumber(assessment.personalResponseMarks);

      if (!needsJumbled(answerType)) jumbledMax = 0;
      if (!needsPersonal(answerType)) personalMax = 0;

      const correctOrder = needsJumbled(answerType)
        ? (question.options || [])
            .slice()
            .sort((a, b) => a.correctOrder - b.correctOrder)
            .map((o) => o.optionKey)
        : [];

      const jumbledScore = needsJumbled(answerType)
        ? scoreJumbledOrder(answer.optionOrder || [], correctOrder, jumbledMax)
        : 0;
      totalJumbled += jumbledScore;

      answerRows.push({
        questionId: Number(answer.questionId),
        category: questionLink?.category || 'OBSERVATION',
        optionOrder: needsJumbled(answerType) ? answer.optionOrder || [] : [],
        personalResponse: needsPersonal(answerType) ? answer.personalResponse || '' : '',
        jumbledScore,
        personalScore: needsPersonal(answerType) ? null : 0,
        jumbledMax,
        personalMax,
      });
    }

    const maxScore = answerRows.reduce((sum, row) => sum + row.jumbledMax + row.personalMax, 0);

    const submission = await AssessmentSubmission.create(
      {
        uuid: crypto.randomUUID(),
        assessmentId: assessment.id,
        studentName: payload.studentName,
        email: String(payload.email).trim().toLowerCase(),
        collegeName: payload.collegeName,
        status: 'SUBMITTED',
        result: null,
        jumbledScore: Number(totalJumbled.toFixed(2)),
        personalScore: null,
        totalScore: null,
        maxScore,
      },
      { transaction },
    );

    await AssessmentSubmissionAnswer.bulkCreate(
      answerRows.map((row) => ({ ...row, submissionId: submission.id })),
      { transaction },
    );

    return {
      id: String(submission.id),
      uuid: submission.uuid,
      status: submission.status,
      jumbledScore: toNumber(submission.jumbledScore),
      maxScore: toNumber(submission.maxScore),
    };
  });
}

async function listResults({ page = 1, result, pageSize = 10 } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const where = {};
  if (result === 'PASS' || result === 'FAIL') {
    where.result = result;
  } else if (result === 'PENDING') {
    where.result = null;
  }

  const { rows, count } = await AssessmentSubmission.findAndCountAll({
    where,
    include: [{
      model: Assessment,
      as: 'assessment',
      attributes: ['id', 'name', 'domain'],
      paranoid: false,
    }],
    order: [['id', 'DESC']],
    limit: pageSize,
    offset: (safePage - 1) * pageSize,
  });

  return {
    results: rows.map((row) => ({
      id: String(row.id),
      uuid: row.uuid,
      studentName: row.studentName,
      email: row.email,
      collegeName: row.collegeName,
      assessmentName: row.assessment?.name || '',
      domain: row.assessment?.domain || '',
      status: row.status,
      result: row.result,
      jumbledScore: toNumber(row.jumbledScore),
      personalScore: row.personalScore == null ? null : toNumber(row.personalScore),
      totalScore: row.totalScore == null ? null : toNumber(row.totalScore),
      maxScore: toNumber(row.maxScore),
      submittedAt: row.createdAt,
    })),
    page: safePage,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
    total: count,
  };
}

async function getResultDetail(submissionId) {
  const submission = await AssessmentSubmission.findByPk(submissionId, {
    include: [
      { model: Assessment, as: 'assessment', paranoid: false },
      {
        model: AssessmentSubmissionAnswer,
        as: 'answers',
        include: [
          {
            model: AssessmentQuestion,
            as: 'question',
            include: [{ model: AssessmentQuestionOption, as: 'options' }],
          },
        ],
      },
    ],
  });

  if (!submission) throw notFound('Submission not found');

  return {
    id: String(submission.id),
    uuid: submission.uuid,
    studentName: submission.studentName,
    email: submission.email,
    collegeName: submission.collegeName,
    status: submission.status,
    result: submission.result,
    jumbledScore: toNumber(submission.jumbledScore),
    personalScore:
      submission.personalScore == null ? null : toNumber(submission.personalScore),
    totalScore: submission.totalScore == null ? null : toNumber(submission.totalScore),
    maxScore: toNumber(submission.maxScore),
    passMarksValue: toNumber(submission.assessment?.passMarks),
    assessment: submission.assessment
      ? serializeAssessmentListItem(submission.assessment)
      : null,
    answers: (submission.answers || []).map((answer) => {
      const question = answer.question;
      const correctOrder = (question?.options || [])
        .slice()
        .sort((a, b) => a.correctOrder - b.correctOrder)
        .map((o) => ({ id: o.optionKey, label: o.label, correctOrder: o.correctOrder }));

      const optionByKey = new Map(
        (question?.options || []).map((o) => [o.optionKey, o.label]),
      );

      return {
        id: String(answer.id),
        questionId: Number(answer.questionId),
        category: answer.category || 'OBSERVATION',
        answerType: normalizeAnswerType(question?.answerType),
        title: question?.title || '',
        prompt: question?.prompt || '',
        question: question?.question || '',
        optionOrder: (answer.optionOrder || []).map((key) => ({
          id: key,
          label: optionByKey.get(key) || key,
        })),
        correctOrder,
        personalResponse: answer.personalResponse,
        jumbledScore: toNumber(answer.jumbledScore),
        personalScore: answer.personalScore == null ? null : toNumber(answer.personalScore),
        jumbledMax: toNumber(answer.jumbledMax),
        personalMax: toNumber(answer.personalMax),
      };
    }),
  };
}

async function setPersonalScore(submissionId, answerId, personalScore) {
  const answer = await AssessmentSubmissionAnswer.findOne({
    where: { id: answerId, submissionId },
  });
  if (!answer) throw notFound('Answer not found');

  if (toNumber(answer.personalMax) <= 0) {
    throw badRequest('This answer has no personal response to score');
  }

  if (personalScore > toNumber(answer.personalMax)) {
    throw badRequest(`Personal score cannot exceed ${answer.personalMax}`);
  }

  answer.personalScore = Number(personalScore);
  await answer.save();

  const allAnswers = await AssessmentSubmissionAnswer.findAll({
    where: { submissionId },
  });

  const scoredPersonal = allAnswers.filter((a) => a.personalScore != null);
  const personalTotal = scoredPersonal.reduce(
    (sum, a) => sum + toNumber(a.personalScore),
    0,
  );
  const jumbledTotal = allAnswers.reduce((sum, a) => sum + toNumber(a.jumbledScore), 0);

  const submission = await AssessmentSubmission.findByPk(submissionId);
  submission.jumbledScore = Number(jumbledTotal.toFixed(2));
  submission.personalScore = Number(personalTotal.toFixed(2));
  submission.status = 'PARTIALLY_EVALUATED';
  submission.result = null;
  submission.totalScore = null;
  await submission.save();

  return getResultDetail(submissionId);
}

async function fullEvaluate(submissionId) {
  const submission = await AssessmentSubmission.findByPk(submissionId, {
    include: [
      { model: Assessment, as: 'assessment', paranoid: false },
      { model: AssessmentSubmissionAnswer, as: 'answers' },
    ],
  });

  if (!submission) throw notFound('Submission not found');

  const answers = submission.answers || [];
  if (answers.length === 0) {
    throw badRequest('Submission has no answers to evaluate');
  }

  const unscored = answers.filter(
    (a) => toNumber(a.personalMax) > 0 && a.personalScore == null,
  );
  if (unscored.length > 0) {
    throw badRequest('Score all personal responses before full evaluation');
  }

  // Auto-zero personal scores for jumbled-only answers that somehow stayed null
  for (const answer of answers) {
    if (toNumber(answer.personalMax) <= 0 && answer.personalScore == null) {
      answer.personalScore = 0;
      await answer.save();
    }
  }
  const jumbledTotal = answers.reduce((sum, a) => sum + toNumber(a.jumbledScore), 0);
  const personalTotal = answers.reduce((sum, a) => sum + toNumber(a.personalScore), 0);
  const totalScore = Number((jumbledTotal + personalTotal).toFixed(2));
  const passMarks = toNumber(submission.assessment?.passMarks);

  submission.jumbledScore = Number(jumbledTotal.toFixed(2));
  submission.personalScore = Number(personalTotal.toFixed(2));
  submission.totalScore = totalScore;
  submission.status = 'EVALUATED';
  submission.result = totalScore >= passMarks ? 'PASS' : 'FAIL';
  await submission.save();

  return getResultDetail(submissionId);
}

async function deleteResult(submissionId) {
  const submission = await AssessmentSubmission.findByPk(submissionId);
  if (!submission) throw notFound('Submission not found');

  await sequelize.transaction(async (transaction) => {
    await AssessmentSubmissionAnswer.destroy({
      where: { submissionId: submission.id },
      transaction,
    });
    await submission.destroy({ transaction });
  });

  return { id: String(submissionId), deleted: true };
}

async function bulkDeleteResults(ids) {
  const uniqueIds = [...new Set((ids || []).map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0))];
  if (uniqueIds.length === 0) {
    throw badRequest('Select at least one submission to delete');
  }

  return sequelize.transaction(async (transaction) => {
    const submissions = await AssessmentSubmission.findAll({
      where: { id: { [Op.in]: uniqueIds } },
      attributes: ['id'],
      transaction,
    });

    const foundIds = submissions.map((row) => Number(row.id));
    if (foundIds.length === 0) {
      throw notFound('No matching submissions found');
    }

    await AssessmentSubmissionAnswer.destroy({
      where: { submissionId: { [Op.in]: foundIds } },
      transaction,
    });
    await AssessmentSubmission.destroy({
      where: { id: { [Op.in]: foundIds } },
      transaction,
    });

    return {
      deleted: foundIds.map(String),
      deletedCount: foundIds.length,
      requestedCount: uniqueIds.length,
    };
  });
}

async function exportResultsWorkbook({ result } = {}) {
  const where = {};
  if (result === 'PASS' || result === 'FAIL') {
    where.result = result;
  } else if (result === 'PENDING') {
    where.result = null;
  }

  const rows = await AssessmentSubmission.findAll({
    where,
    attributes: ['studentName', 'email', 'totalScore', 'maxScore', 'result'],
    order: [['id', 'DESC']],
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Assessment Results');

  const headers = ['Student Name', 'Email', 'Total', 'Result'];
  const headerRow = sheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
  });

  rows.forEach((row) => {
    const resultStatus = row.result === 'PASS' || row.result === 'FAIL' ? row.result : 'PENDING';
    const total =
      row.totalScore == null ? '' : `${toNumber(row.totalScore)}/${toNumber(row.maxScore)}`;
    sheet.addRow([
      row.studentName || '',
      row.email || '',
      total,
      resultStatus,
    ]);
  });

  sheet.getColumn(1).width = 28;
  sheet.getColumn(2).width = 32;
  sheet.getColumn(3).width = 14;
  sheet.getColumn(4).width = 14;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

module.exports = {
  listQuestions,
  createQuestion,
  createAssessment,
  updateAssessment,
  listAssessments,
  getAssessmentById,
  deleteAssessment,
  getActiveAssessmentForStudent,
  submitAssessment,
  listResults,
  getResultDetail,
  setPersonalScore,
  fullEvaluate,
  deleteResult,
  bulkDeleteResults,
  exportResultsWorkbook,
};
