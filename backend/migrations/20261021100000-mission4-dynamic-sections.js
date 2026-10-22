'use strict';

const { buildDefaultMissionConfig } = require('../src/modules/foundation/foundation-step.defaults');

module.exports = {
  async up(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT fmc.id, fmc.questions, fmc.evidence_config
       FROM foundation_mission_configs fmc
       WHERE fmc.mission_id = 4`,
    );

    const defaults = buildDefaultMissionConfig('', 4);

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

      const hasImplementation = questions.some((q) => q && q.answerKey === 'implementation');
      const nextQuestions = hasImplementation
        ? questions
        : [...questions, defaults.questions.find((q) => q.answerKey === 'implementation')].filter(
            Boolean,
          );

      let evidenceConfig = row.evidence_config;
      if (typeof evidenceConfig === 'string') {
        try {
          evidenceConfig = JSON.parse(evidenceConfig);
        } catch {
          evidenceConfig = {};
        }
      }
      if (!evidenceConfig || typeof evidenceConfig !== 'object') evidenceConfig = {};

      const mergedEvidence = { ...defaults.evidenceConfig, ...evidenceConfig };

      await queryInterface.sequelize.query(
        `UPDATE foundation_mission_configs
         SET questions = :questions, evidence_config = :evidenceConfig, updated_at = NOW()
         WHERE id = :id`,
        {
          replacements: {
            id: row.id,
            questions: JSON.stringify(nextQuestions),
            evidenceConfig: JSON.stringify(mergedEvidence),
          },
        },
      );
    }
  },

  async down() {
    // Non-destructive content migration — no rollback.
  },
};
