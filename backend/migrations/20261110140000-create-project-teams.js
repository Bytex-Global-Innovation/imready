'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(String(name).toLowerCase());

    if (!has('project_teams')) {
      await queryInterface.createTable('project_teams', {
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
        project_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'industry_projects', key: 'id' },
          onDelete: 'CASCADE',
        },
        creator_student_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'student_accounts', key: 'id' },
          onDelete: 'CASCADE',
        },
        lead_student_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'student_accounts', key: 'id' },
          onDelete: 'CASCADE',
        },
        name: {
          type: Sequelize.STRING(120),
          allowNull: false,
          defaultValue: '',
        },
        faculty: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: [],
        },
        status: {
          type: Sequelize.ENUM('FORMING', 'ACTIVE'),
          allowNull: false,
          defaultValue: 'FORMING',
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
      await queryInterface.addIndex('project_teams', ['project_id'], {
        name: 'idx_project_teams_project',
      });
      await queryInterface.addIndex('project_teams', ['creator_student_id'], {
        name: 'idx_project_teams_creator',
      });
    }

    if (!has('project_team_members')) {
      await queryInterface.createTable('project_team_members', {
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
          references: { model: 'project_teams', key: 'id' },
          onDelete: 'CASCADE',
        },
        student_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'student_accounts', key: 'id' },
          onDelete: 'CASCADE',
        },
        invited_by_student_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: true,
          references: { model: 'student_accounts', key: 'id' },
          onDelete: 'SET NULL',
        },
        role: {
          type: Sequelize.ENUM('CREATOR', 'MEMBER'),
          allowNull: false,
          defaultValue: 'MEMBER',
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        responded_at: {
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
      await queryInterface.addIndex('project_team_members', ['team_id'], {
        name: 'idx_project_team_members_team',
      });
      await queryInterface.addIndex('project_team_members', ['student_id', 'status'], {
        name: 'idx_project_team_members_student_status',
      });
      await queryInterface.addIndex(
        'project_team_members',
        ['team_id', 'student_id'],
        {
          unique: true,
          name: 'uq_project_team_members_team_student',
        },
      );
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(String(name).toLowerCase());

    if (has('project_team_members')) {
      await queryInterface.dropTable('project_team_members');
    }
    if (has('project_teams')) {
      await queryInterface.dropTable('project_teams');
    }
  },
};
