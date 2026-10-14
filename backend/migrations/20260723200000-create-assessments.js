'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.some((t) => String(t).toLowerCase() === name.toLowerCase());

    if (!has('assessment_questions')) {
      await queryInterface.createTable(
        'assessment_questions',
        {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          uuid: {
            type: Sequelize.STRING(36),
            allowNull: false,
          },
          title: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          prompt: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          question: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          tips: {
            type: Sequelize.JSON,
            allowNull: false,
            defaultValue: [],
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal(
              'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            ),
          },
        },
        { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
      );
      await queryInterface.addIndex('assessment_questions', ['uuid'], {
        unique: true,
        name: 'uq_assessment_questions_uuid',
      });
    }

    if (!has('assessment_question_options')) {
      await queryInterface.createTable(
        'assessment_question_options',
        {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
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
          correct_order: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal(
              'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            ),
          },
        },
        { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
      );
      await queryInterface.addIndex(
        'assessment_question_options',
        ['question_id', 'option_key'],
        { unique: true, name: 'uq_aqo_question_option_key' },
      );
      await queryInterface.addIndex(
        'assessment_question_options',
        ['question_id', 'correct_order'],
        { unique: true, name: 'uq_aqo_question_correct_order' },
      );
    }

    if (!has('assessments')) {
      await queryInterface.createTable(
        'assessments',
        {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          uuid: {
            type: Sequelize.STRING(36),
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          domain: {
            type: Sequelize.STRING(120),
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM('ACTIVE', 'DRAFT', 'ARCHIVED'),
            allowNull: false,
            defaultValue: 'DRAFT',
          },
          question_count: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 1,
          },
          question_order_mode: {
            type: Sequelize.ENUM('sequential', 'random', 'jumbled'),
            allowNull: false,
            defaultValue: 'sequential',
          },
          jumbled_options_marks: {
            type: Sequelize.DECIMAL(6, 2),
            allowNull: false,
            defaultValue: 60,
          },
          personal_response_marks: {
            type: Sequelize.DECIMAL(6, 2),
            allowNull: false,
            defaultValue: 40,
          },
          pass_marks: {
            type: Sequelize.DECIMAL(6, 2),
            allowNull: false,
            defaultValue: 70,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal(
              'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            ),
          },
        },
        { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
      );
      await queryInterface.addIndex('assessments', ['uuid'], {
        unique: true,
        name: 'uq_assessments_uuid',
      });
      await queryInterface.addIndex('assessments', ['status'], {
        name: 'idx_assessments_status',
      });
    }

    if (!has('assessment_question_links')) {
      await queryInterface.createTable(
        'assessment_question_links',
        {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          assessment_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'assessments', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          question_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'assessment_questions', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
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
            defaultValue: Sequelize.literal(
              'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            ),
          },
        },
        { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
      );
      await queryInterface.addIndex(
        'assessment_question_links',
        ['assessment_id', 'question_id'],
        { unique: true, name: 'uq_aql_assessment_question' },
      );
    }

    if (!has('assessment_submissions')) {
      await queryInterface.createTable(
        'assessment_submissions',
        {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          uuid: {
            type: Sequelize.STRING(36),
            allowNull: false,
          },
          assessment_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'assessments', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          student_name: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          email: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          college_name: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM(
              'SUBMITTED',
              'PARTIALLY_EVALUATED',
              'EVALUATED',
            ),
            allowNull: false,
            defaultValue: 'SUBMITTED',
          },
          result: {
            type: Sequelize.ENUM('PASS', 'FAIL'),
            allowNull: true,
            defaultValue: null,
          },
          jumbled_score: {
            type: Sequelize.DECIMAL(8, 2),
            allowNull: false,
            defaultValue: 0,
          },
          personal_score: {
            type: Sequelize.DECIMAL(8, 2),
            allowNull: true,
            defaultValue: null,
          },
          total_score: {
            type: Sequelize.DECIMAL(8, 2),
            allowNull: true,
            defaultValue: null,
          },
          max_score: {
            type: Sequelize.DECIMAL(8, 2),
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
            defaultValue: Sequelize.literal(
              'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            ),
          },
        },
        { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
      );
      await queryInterface.addIndex('assessment_submissions', ['uuid'], {
        unique: true,
        name: 'uq_assessment_submissions_uuid',
      });
      await queryInterface.addIndex('assessment_submissions', ['email'], {
        name: 'idx_assessment_submissions_email',
      });
      await queryInterface.addIndex('assessment_submissions', ['result'], {
        name: 'idx_assessment_submissions_result',
      });
      await queryInterface.addIndex(
        'assessment_submissions',
        ['assessment_id'],
        { name: 'idx_assessment_submissions_assessment' },
      );
    }

    if (!has('assessment_submission_answers')) {
      await queryInterface.createTable(
        'assessment_submission_answers',
        {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          submission_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'assessment_submissions', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          question_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'assessment_questions', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          option_order: {
            type: Sequelize.JSON,
            allowNull: false,
          },
          personal_response: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: '',
          },
          jumbled_score: {
            type: Sequelize.DECIMAL(8, 2),
            allowNull: false,
            defaultValue: 0,
          },
          personal_score: {
            type: Sequelize.DECIMAL(8, 2),
            allowNull: true,
            defaultValue: null,
          },
          jumbled_max: {
            type: Sequelize.DECIMAL(8, 2),
            allowNull: false,
            defaultValue: 0,
          },
          personal_max: {
            type: Sequelize.DECIMAL(8, 2),
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
            defaultValue: Sequelize.literal(
              'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            ),
          },
        },
        { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
      );
      await queryInterface.addIndex(
        'assessment_submission_answers',
        ['submission_id', 'question_id'],
        { unique: true, name: 'uq_asa_submission_question' },
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('assessment_submission_answers');
    await queryInterface.dropTable('assessment_submissions');
    await queryInterface.dropTable('assessment_question_links');
    await queryInterface.dropTable('assessments');
    await queryInterface.dropTable('assessment_question_options');
    await queryInterface.dropTable('assessment_questions');
  },
};
