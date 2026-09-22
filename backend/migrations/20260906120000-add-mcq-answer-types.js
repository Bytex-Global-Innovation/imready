'use strict';

/**
 * Expand answer_type ENUM with MCQ combos and add MCQ storage / marks columns.
 * Existing JUMBLED / PERSONAL / BOTH rows remain valid.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (has('assessment_questions')) {
      await queryInterface.sequelize.query(`
        ALTER TABLE assessment_questions
        MODIFY COLUMN answer_type
          ENUM(
            'JUMBLED',
            'PERSONAL',
            'BOTH',
            'MCQ',
            'JUMBLED_MCQ',
            'PERSONAL_MCQ',
            'ALL'
          ) NOT NULL DEFAULT 'BOTH'
      `);
    }

    if (has('assessments')) {
      const columns = await queryInterface.describeTable('assessments');
      if (!columns.mcq_options_marks) {
        await queryInterface.addColumn('assessments', 'mcq_options_marks', {
          type: Sequelize.DECIMAL(6, 2),
          allowNull: false,
          defaultValue: 20,
        });
      }
    }

    if (has('assessment_question_assignments')) {
      const columns = await queryInterface.describeTable(
        'assessment_question_assignments',
      );
      if (!columns.mcq_options_marks) {
        await queryInterface.addColumn(
          'assessment_question_assignments',
          'mcq_options_marks',
          {
            type: Sequelize.DECIMAL(8, 2),
            allowNull: true,
            defaultValue: null,
          },
        );
      }
    }

    if (has('assessment_answers')) {
      const columns = await queryInterface.describeTable('assessment_answers');
      if (!columns.mcq_selection) {
        await queryInterface.addColumn('assessment_answers', 'mcq_selection', {
          type: Sequelize.STRING(64),
          allowNull: true,
          defaultValue: null,
        });
      }
      if (!columns.mcq_score) {
        await queryInterface.addColumn('assessment_answers', 'mcq_score', {
          type: Sequelize.DECIMAL(8, 2),
          allowNull: false,
          defaultValue: 0,
        });
      }
      if (!columns.mcq_max) {
        await queryInterface.addColumn('assessment_answers', 'mcq_max', {
          type: Sequelize.DECIMAL(8, 2),
          allowNull: false,
          defaultValue: 0,
        });
      }
    }

    if (!has('assessment_question_mcq_options')) {
      await queryInterface.createTable('assessment_question_mcq_options', {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        question_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'assessment_questions', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        option_key: {
          type: Sequelize.STRING(64),
          allowNull: false,
        },
        label: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        is_correct: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        sort_order: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 1,
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
      await queryInterface.addIndex('assessment_question_mcq_options', [
        'question_id',
      ]);
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (has('assessment_question_mcq_options')) {
      await queryInterface.dropTable('assessment_question_mcq_options');
    }

    if (has('assessment_answers')) {
      const columns = await queryInterface.describeTable('assessment_answers');
      for (const col of ['mcq_max', 'mcq_score', 'mcq_selection']) {
        if (columns[col]) {
          await queryInterface.removeColumn('assessment_answers', col);
        }
      }
    }

    if (has('assessment_question_assignments')) {
      const columns = await queryInterface.describeTable(
        'assessment_question_assignments',
      );
      if (columns.mcq_options_marks) {
        await queryInterface.removeColumn(
          'assessment_question_assignments',
          'mcq_options_marks',
        );
      }
    }

    if (has('assessments')) {
      const columns = await queryInterface.describeTable('assessments');
      if (columns.mcq_options_marks) {
        await queryInterface.removeColumn('assessments', 'mcq_options_marks');
      }
    }

    if (has('assessment_questions')) {
      // Rows using new types must be mapped back before shrinking the ENUM.
      await queryInterface.sequelize.query(`
        UPDATE assessment_questions
        SET answer_type = 'BOTH'
        WHERE answer_type IN ('MCQ', 'JUMBLED_MCQ', 'PERSONAL_MCQ', 'ALL')
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE assessment_questions
        MODIFY COLUMN answer_type
          ENUM('JUMBLED', 'PERSONAL', 'BOTH') NOT NULL DEFAULT 'BOTH'
      `);
    }
  },
};
