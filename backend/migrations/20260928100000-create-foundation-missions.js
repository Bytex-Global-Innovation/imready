'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((t) => (typeof t === 'string' ? t : t.tableName || t.name));

    const studentColumns = await queryInterface.describeTable('student_accounts');
    if (!studentColumns.foundation_completed_at) {
      await queryInterface.addColumn('student_accounts', 'foundation_completed_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!tableNames.includes('foundation_mission_records')) {
      await queryInterface.createTable(
        'foundation_mission_records',
        {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
          },
          student_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'student_accounts', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          mission_id: {
            type: Sequelize.TINYINT.UNSIGNED,
            allowNull: false,
          },
          answers: {
            type: Sequelize.JSON,
            allowNull: false,
            defaultValue: {},
          },
          evidence_file_name: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null,
          },
          evidence_file_type: {
            type: Sequelize.STRING(64),
            allowNull: true,
            defaultValue: null,
          },
          completed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          completed_at: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null,
          },
          xp_earned: {
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
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
          },
        },
        {
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci',
        },
      );

      await queryInterface.addIndex('foundation_mission_records', ['student_id', 'mission_id'], {
        unique: true,
        name: 'foundation_mission_records_student_mission_unique',
      });
      await queryInterface.addIndex('foundation_mission_records', ['student_id'], {
        name: 'foundation_mission_records_student_id',
      });
      await queryInterface.addIndex('foundation_mission_records', ['completed'], {
        name: 'foundation_mission_records_completed',
      });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((t) => (typeof t === 'string' ? t : t.tableName || t.name));

    if (tableNames.includes('foundation_mission_records')) {
      await queryInterface.dropTable('foundation_mission_records');
    }

    const studentColumns = await queryInterface.describeTable('student_accounts');
    if (studentColumns.foundation_completed_at) {
      await queryInterface.removeColumn('student_accounts', 'foundation_completed_at');
    }
  },
};
