'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(String(name).toLowerCase());

    if (!has('project_stage_progress')) {
      await queryInterface.createTable('project_stage_progress', {
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
        team_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          unique: true,
          references: { model: 'project_teams', key: 'id' },
          onDelete: 'CASCADE',
        },
        project_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'industry_projects', key: 'id' },
          onDelete: 'CASCADE',
        },
        current_stage: {
          type: Sequelize.ENUM(
            'WORKSPACE',
            'READY',
            'DO',
            'SUBMIT',
            'REVIEW',
            'OWNER_FEEDBACK',
            'OUTCOME',
            'PROFILE',
          ),
          allowNull: false,
          defaultValue: 'WORKSPACE',
        },
        checkpoints: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: {},
        },
        updated_by_student_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: true,
          references: { model: 'student_accounts', key: 'id' },
          onDelete: 'SET NULL',
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
      await queryInterface.addIndex('project_stage_progress', ['project_id'], {
        name: 'idx_stage_progress_project',
      });
    }

    if (!has('project_submissions')) {
      await queryInterface.createTable('project_submissions', {
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
        team_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          unique: true,
          references: { model: 'project_teams', key: 'id' },
          onDelete: 'CASCADE',
        },
        project_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'industry_projects', key: 'id' },
          onDelete: 'CASCADE',
        },
        submitted_by_student_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: true,
          references: { model: 'student_accounts', key: 'id' },
          onDelete: 'SET NULL',
        },
        submission_code: {
          type: Sequelize.STRING(64),
          allowNull: true,
        },
        summary: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        demo_video_url: {
          type: Sequelize.STRING(1000),
          allowNull: true,
        },
        payload: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: {},
        },
        status: {
          type: Sequelize.ENUM(
            'DRAFT',
            'SUBMITTED',
            'UNDER_REVIEW',
            'FEEDBACK_READY',
            'CLOSED',
          ),
          allowNull: false,
          defaultValue: 'DRAFT',
        },
        submitted_at: {
          type: Sequelize.DATE,
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
      await queryInterface.addIndex('project_submissions', ['project_id'], {
        name: 'idx_submissions_project',
      });
      await queryInterface.addIndex('project_submissions', ['status'], {
        name: 'idx_submissions_status',
      });
    }

    if (!has('project_owner_feedback')) {
      await queryInterface.createTable('project_owner_feedback', {
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
        team_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          unique: true,
          references: { model: 'project_teams', key: 'id' },
          onDelete: 'CASCADE',
        },
        project_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'industry_projects', key: 'id' },
          onDelete: 'CASCADE',
        },
        submission_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: true,
          references: { model: 'project_submissions', key: 'id' },
          onDelete: 'SET NULL',
        },
        admin_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: true,
          references: { model: 'admin_users', key: 'id' },
          onDelete: 'SET NULL',
        },
        worked_well: {
          type: Sequelize.TEXT,
          allowNull: false,
          defaultValue: '',
        },
        improved: {
          type: Sequelize.TEXT,
          allowNull: false,
          defaultValue: '',
        },
        valuable: {
          type: Sequelize.TEXT,
          allowNull: false,
          defaultValue: '',
        },
        overall: {
          type: Sequelize.TEXT,
          allowNull: false,
          defaultValue: '',
        },
        student_quote: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        rating: {
          type: Sequelize.TINYINT.UNSIGNED,
          allowNull: false,
          defaultValue: 5,
        },
        continuation: {
          type: Sequelize.ENUM(
            'entire_team',
            'selected_students',
            'no_continuation',
          ),
          allowNull: false,
          defaultValue: 'entire_team',
        },
        valued_points: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: [],
        },
        improve_points: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: [],
        },
        selected_student_ids: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: [],
        },
        status: {
          type: Sequelize.ENUM('DRAFT', 'SUBMITTED'),
          allowNull: false,
          defaultValue: 'DRAFT',
        },
        submitted_at: {
          type: Sequelize.DATE,
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
      await queryInterface.addIndex('project_owner_feedback', ['project_id'], {
        name: 'idx_owner_feedback_project',
      });
      await queryInterface.addIndex('project_owner_feedback', ['status'], {
        name: 'idx_owner_feedback_status',
      });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(String(name).toLowerCase());

    if (has('project_owner_feedback')) {
      await queryInterface.dropTable('project_owner_feedback');
    }
    if (has('project_submissions')) {
      await queryInterface.dropTable('project_submissions');
    }
    if (has('project_stage_progress')) {
      await queryInterface.dropTable('project_stage_progress');
    }
  },
};
