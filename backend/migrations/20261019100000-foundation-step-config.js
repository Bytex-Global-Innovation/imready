'use strict';

const crypto = require('crypto');
const { buildDefaultProblemPayloads } = require('../src/modules/foundation/foundation-step.defaults');

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((t) => (typeof t === 'string' ? t : t.tableName || t.name));

    if (!tableNames.includes('foundation_problem_statements')) {
      await queryInterface.createTable('foundation_problem_statements', {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.STRING(36),
          allowNull: false,
          unique: true,
        },
        statement_text: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        sort_order: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }

    if (!tableNames.includes('foundation_mission_configs')) {
      await queryInterface.createTable('foundation_mission_configs', {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        problem_statement_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'foundation_problem_statements', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        mission_id: {
          type: Sequelize.TINYINT.UNSIGNED,
          allowNull: false,
        },
        tip_advisor_label: {
          type: Sequelize.STRING(120),
          allowNull: false,
          defaultValue: 'Advisor',
        },
        tip_quote: {
          type: Sequelize.TEXT,
          allowNull: false,
          defaultValue: '',
        },
        analyze_context_text: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        pattern_tag_options: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        why_layer_labels: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        questions: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: [],
        },
        evidence_config: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      await queryInterface.addIndex('foundation_mission_configs', ['problem_statement_id', 'mission_id'], {
        unique: true,
        name: 'foundation_mission_configs_problem_mission_unique',
      });
    }

    const studentColumns = await queryInterface.describeTable('student_accounts');
    if (!studentColumns.foundation_problem_statement_id) {
      await queryInterface.addColumn('student_accounts', 'foundation_problem_statement_id', {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      });
    }

    const [existingProblems] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS count FROM foundation_problem_statements',
    );
    const count = Number(existingProblems[0]?.count || 0);
    if (count === 0) {
      const defaults = buildDefaultProblemPayloads();
      const now = new Date();
      for (const problem of defaults) {
        const [problemResult] = await queryInterface.sequelize.query(
          `INSERT INTO foundation_problem_statements (uuid, statement_text, is_active, sort_order, created_at, updated_at)
           VALUES (:uuid, :statementText, :isActive, :sortOrder, :now, :now)`,
          {
            replacements: {
              uuid: crypto.randomUUID(),
              statementText: problem.statementText,
              isActive: problem.isActive,
              sortOrder: problem.sortOrder,
              now,
            },
          },
        );
        const problemId = problemResult?.insertId;
        if (!problemId) continue;

        for (const mission of problem.missions) {
          await queryInterface.sequelize.query(
            `INSERT INTO foundation_mission_configs
              (problem_statement_id, mission_id, tip_advisor_label, tip_quote, analyze_context_text,
               pattern_tag_options, why_layer_labels, questions, evidence_config, created_at, updated_at)
             VALUES
              (:problemId, :missionId, :tipAdvisorLabel, :tipQuote, :analyzeContextText,
               :patternTagOptions, :whyLayerLabels, :questions, :evidenceConfig, :now, :now)`,
            {
              replacements: {
                problemId,
                missionId: mission.missionId,
                tipAdvisorLabel: mission.tipAdvisorLabel,
                tipQuote: mission.tipQuote,
                analyzeContextText: mission.analyzeContextText,
                patternTagOptions: mission.patternTagOptions
                  ? JSON.stringify(mission.patternTagOptions)
                  : null,
                whyLayerLabels: mission.whyLayerLabels
                  ? JSON.stringify(mission.whyLayerLabels)
                  : null,
                questions: JSON.stringify(mission.questions),
                evidenceConfig: mission.evidenceConfig
                  ? JSON.stringify(mission.evidenceConfig)
                  : null,
                now,
              },
            },
          );
        }
      }
    }
  },

  async down(queryInterface) {
    const studentColumns = await queryInterface.describeTable('student_accounts');
    if (studentColumns.foundation_problem_statement_id) {
      await queryInterface.removeColumn('student_accounts', 'foundation_problem_statement_id');
    }
    await queryInterface.dropTable('foundation_mission_configs');
    await queryInterface.dropTable('foundation_problem_statements');
  },
};
