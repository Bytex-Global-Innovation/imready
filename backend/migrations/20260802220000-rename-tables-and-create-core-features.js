'use strict';

/**
 * Align table names with feature motives + create students/projects/applications.
 *
 * Renames:
 *   admins                        → admin_users
 *   assessment_question_links     → assessment_question_assignments
 *   assessment_submission_answers → assessment_answers
 *
 * Creates:
 *   student_accounts
 *   industry_projects
 *   project_applications
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (has('admins') && !has('admin_users')) {
      await queryInterface.renameTable('admins', 'admin_users');
    }

    if (has('assessment_question_links') && !has('assessment_question_assignments')) {
      await queryInterface.renameTable(
        'assessment_question_links',
        'assessment_question_assignments',
      );
    }

    if (has('assessment_submission_answers') && !has('assessment_answers')) {
      await queryInterface.renameTable(
        'assessment_submission_answers',
        'assessment_answers',
      );
    }

    if (!has('student_accounts')) {
      await queryInterface.createTable('student_accounts', {
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
        full_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        country_code: {
          type: Sequelize.STRING(8),
          allowNull: false,
          defaultValue: '+91',
        },
        phone: {
          type: Sequelize.STRING(32),
          allowNull: false,
          defaultValue: '',
        },
        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        college_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: '',
        },
        stream_major: {
          type: Sequelize.STRING(120),
          allowNull: false,
          defaultValue: '',
        },
        graduation_year: {
          type: Sequelize.STRING(8),
          allowNull: false,
          defaultValue: '',
        },
        domain: {
          type: Sequelize.STRING(120),
          allowNull: false,
          defaultValue: '',
        },
        level: {
          type: Sequelize.STRING(64),
          allowNull: false,
          defaultValue: 'Beginner',
        },
        career_door: {
          type: Sequelize.STRING(64),
          allowNull: false,
          defaultValue: '',
        },
        status: {
          type: Sequelize.ENUM('VERIFIED', 'PENDING', 'FLAGGED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      });
      await queryInterface.addIndex('student_accounts', ['status'], {
        name: 'idx_student_accounts_status',
      });
      await queryInterface.addIndex('student_accounts', ['college_name'], {
        name: 'idx_student_accounts_college',
      });
    }

    if (!has('industry_projects')) {
      await queryInterface.createTable('industry_projects', {
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
        slug: {
          type: Sequelize.STRING(160),
          allowNull: false,
          unique: true,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        category: {
          type: Sequelize.ENUM(
            'artificial-intelligence',
            'machine-learning',
            'electronics',
          ),
          allowNull: false,
        },
        badge: {
          type: Sequelize.STRING(64),
          allowNull: false,
          defaultValue: '',
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        image_src: {
          type: Sequelize.STRING(1000),
          allowNull: false,
          defaultValue: '',
        },
        image_alt: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: '',
        },
        requirements: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        tech_stack: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        estimated_time: {
          type: Sequelize.STRING(64),
          allowNull: false,
          defaultValue: '',
        },
        level: {
          type: Sequelize.STRING(64),
          allowNull: false,
          defaultValue: 'Intermediate Level',
        },
        overview: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        brief_requirements: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        deliverables: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        evaluation_criteria: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        resources: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        mentor_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: '',
        },
        team_size: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 1,
        },
        status: {
          type: Sequelize.ENUM('ACTIVE', 'PENDING', 'REVIEW', 'ARCHIVED'),
          allowNull: false,
          defaultValue: 'ACTIVE',
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      });
      await queryInterface.addIndex('industry_projects', ['category'], {
        name: 'idx_industry_projects_category',
      });
      await queryInterface.addIndex('industry_projects', ['status'], {
        name: 'idx_industry_projects_status',
      });
    }

    if (!has('project_applications')) {
      await queryInterface.createTable('project_applications', {
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
        student_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: true,
          references: { model: 'student_accounts', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        project_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'industry_projects', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        student_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        student_email: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      });
      await queryInterface.addIndex('project_applications', ['status'], {
        name: 'idx_project_applications_status',
      });
      await queryInterface.addIndex(
        'project_applications',
        ['project_id', 'student_email'],
        {
          unique: true,
          name: 'uq_project_applications_project_email',
        },
      );
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (has('project_applications')) {
      await queryInterface.dropTable('project_applications');
    }
    if (has('industry_projects')) {
      await queryInterface.dropTable('industry_projects');
    }
    if (has('student_accounts')) {
      await queryInterface.dropTable('student_accounts');
    }
    if (has('assessment_answers') && !has('assessment_submission_answers')) {
      await queryInterface.renameTable(
        'assessment_answers',
        'assessment_submission_answers',
      );
    }
    if (
      has('assessment_question_assignments') &&
      !has('assessment_question_links')
    ) {
      await queryInterface.renameTable(
        'assessment_question_assignments',
        'assessment_question_links',
      );
    }
    if (has('admin_users') && !has('admins')) {
      await queryInterface.renameTable('admin_users', 'admins');
    }
  },
};
