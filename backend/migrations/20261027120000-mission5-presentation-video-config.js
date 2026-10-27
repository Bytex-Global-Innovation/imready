'use strict';

const { buildDefaultMissionConfig } = require('../src/modules/foundation/foundation-step.defaults');

module.exports = {
  async up(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT fmc.id, fmc.questions, fmc.evidence_config, fps.statement_text
       FROM foundation_mission_configs fmc
       INNER JOIN foundation_problem_statements fps ON fps.id = fmc.problem_statement_id
       WHERE fmc.mission_id = 5`,
    );

    const defaults = buildDefaultMissionConfig('', 5);

    for (const row of rows) {
      let questions = row.questions;
      if (typeof questions === 'string') {
        try {
          questions = JSON.parse(questions);
        } catch {
          questions = [];
        }
      }
      if (!Array.isArray(questions)) questions = [];

      const hasVideo = questions.some((q) => q && q.answerKey === 'presentationVideoUrl');
      const nextQuestions = hasVideo
        ? questions
        : [defaults.questions[0], ...questions];

      const evidenceConfig = {
        ...(typeof row.evidence_config === 'object' && row.evidence_config ? row.evidence_config : {}),
        ...defaults.evidenceConfig,
      };

      await queryInterface.sequelize.query(
        `UPDATE foundation_mission_configs
         SET questions = :questions, evidence_config = :evidenceConfig, updated_at = NOW()
         WHERE id = :id`,
        {
          replacements: {
            id: row.id,
            questions: JSON.stringify(nextQuestions),
            evidenceConfig: JSON.stringify(evidenceConfig),
          },
        },
      );
    }
  },

  async down() {
    // Non-destructive content migration — no rollback.
  },
};
