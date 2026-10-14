'use strict';

/**
 * Project categories + flexible category slug on industry_projects.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (!has('project_categories')) {
      await queryInterface.createTable('project_categories', {
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
        name: {
          type: Sequelize.STRING(120),
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(160),
          allowNull: false,
          unique: true,
        },
        description: {
          type: Sequelize.STRING(500),
          allowNull: false,
          defaultValue: '',
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
          defaultValue: Sequelize.literal(
            'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
          ),
        },
      });

      const now = new Date();
      await queryInterface.bulkInsert('project_categories', [
        {
          uuid: '11111111-1111-4111-8111-111111111111',
          name: 'Artificial Intelligence',
          slug: 'artificial-intelligence',
          description: 'AI projects',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          uuid: '22222222-2222-4222-8222-222222222222',
          name: 'Machine Learning',
          slug: 'machine-learning',
          description: 'ML projects',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          uuid: '33333333-3333-4333-8333-333333333333',
          name: 'Electronics',
          slug: 'electronics',
          description: 'Electronics projects',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    if (has('industry_projects')) {
      const columns = await queryInterface.describeTable('industry_projects');
      if (columns.category) {
        await queryInterface.changeColumn('industry_projects', 'category', {
          type: Sequelize.STRING(160),
          allowNull: false,
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (has('industry_projects')) {
      await queryInterface.changeColumn('industry_projects', 'category', {
        type: Sequelize.ENUM(
          'artificial-intelligence',
          'machine-learning',
          'electronics',
        ),
        allowNull: false,
      });
    }

    if (has('project_categories')) {
      await queryInterface.dropTable('project_categories');
    }
  },
};
