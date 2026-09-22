'use strict';

/**
 * Answer-format capability helpers.
 * Keep JUMBLED / PERSONAL / BOTH semantics unchanged forever.
 * MCQ is an orthogonal third part.
 */
const ANSWER_TYPES = [
  'JUMBLED',
  'PERSONAL',
  'BOTH',
  'MCQ',
  'JUMBLED_MCQ',
  'PERSONAL_MCQ',
  'ALL',
];

const ANSWER_TYPE_SET = new Set(ANSWER_TYPES);

function normalizeAnswerType(value) {
  const type = String(value || 'BOTH').toUpperCase();
  return ANSWER_TYPE_SET.has(type) ? type : 'BOTH';
}

function needsJumbled(answerType) {
  const type = normalizeAnswerType(answerType);
  return (
    type === 'JUMBLED' ||
    type === 'BOTH' ||
    type === 'JUMBLED_MCQ' ||
    type === 'ALL'
  );
}

function needsPersonal(answerType) {
  const type = normalizeAnswerType(answerType);
  return (
    type === 'PERSONAL' ||
    type === 'BOTH' ||
    type === 'PERSONAL_MCQ' ||
    type === 'ALL'
  );
}

function needsMcq(answerType) {
  const type = normalizeAnswerType(answerType);
  return (
    type === 'MCQ' ||
    type === 'JUMBLED_MCQ' ||
    type === 'PERSONAL_MCQ' ||
    type === 'ALL'
  );
}

module.exports = {
  ANSWER_TYPES,
  normalizeAnswerType,
  needsJumbled,
  needsPersonal,
  needsMcq,
};
