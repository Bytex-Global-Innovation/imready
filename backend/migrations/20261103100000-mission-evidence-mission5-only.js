'use strict';

const { buildDefaultMissionConfig } = require('../src/modules/foundation/foundation-step.defaults');

function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function stripPresentationVideoQuestion(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.filter((q) => q && q.answerKey !== 'presentationVideoUrl');
}

module.exports = {
  async up(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT fmc.id, fmc.mission_id, fmc.questions, fmc.evidence_config, fps.statement_text
       FROM foundation_mission_configs fmc
       INNER JOIN foundation_problem_statements fps ON fps.id = fmc.problem_statement_id
       WHERE fmc.mission_id BETWEEN 1 AND 5`,
    );

    for (const row of rows) {
      const missionId = Number(row.mission_id);
      const defaults = buildDefaultMissionConfig(row.statement_text || '', missionId);
      let questions = parseJson(row.questions, []);

      if (missionId === 4) {
        questions = stripPresentationVideoQuestion(questions);
      }

      const evidenceConfig =
        missionId === 4 || missionId === 5 ? defaults.evidenceConfig : null;

      await queryInterface.sequelize.query(
        `UPDATE foundation_mission_configs
         SET questions = :questions, evidence_config = :evidenceConfig, updated_at = NOW()
         WHERE id = :id`,
        {
          replacements: {
            id: row.id,
            questions: JSON.stringify(questions),
            evidenceConfig: evidenceConfig ? JSON.stringify(evidenceConfig) : null,
          },
        },
      );
    }
  },

  async down() {
    // Non-destructive content migration — no rollback.
  },
};
