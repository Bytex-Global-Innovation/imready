'use strict';

const { randomUUID } = require('crypto');

const SEED_DOMAINS = [
  { name: 'Artificial Intelligence', slug: 'ai', sort_order: 1, is_other: 0 },
  { name: 'IoT', slug: 'iot', sort_order: 2, is_other: 0 },
  { name: 'Web Dev', slug: 'web-dev', sort_order: 3, is_other: 0 },
  { name: 'Product', slug: 'product', sort_order: 4, is_other: 0 },
  { name: 'Others', slug: 'other', sort_order: 99, is_other: 1 },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (!has('target_domains')) {
      await queryInterface.createTable('target_domains', {
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
        is_other: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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
      });

      const now = new Date();
      await queryInterface.bulkInsert(
        'target_domains',
        SEED_DOMAINS.map((row) => ({
          uuid: randomUUID(),
          name: row.name,
          slug: row.slug,
          description: '',
          is_active: true,
          is_other: row.is_other,
          sort_order: row.sort_order,
          created_at: now,
          updated_at: now,
        })),
      );
    }

    if (has('student_accounts')) {
      const columns = await queryInterface.describeTable('student_accounts');
      if (!columns.target_domains_json) {
        await queryInterface.addColumn('student_accounts', 'target_domains_json', {
          type: Sequelize.JSON,
          allowNull: true,
        });
      }
      if (!columns.target_domain_other) {
        await queryInterface.addColumn('student_accounts', 'target_domain_other', {
          type: Sequelize.STRING(255),
          allowNull: true,
        });
      }
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (has('student_accounts')) {
      const columns = await queryInterface.describeTable('student_accounts');
      if (columns.target_domain_other) {
        await queryInterface.removeColumn('student_accounts', 'target_domain_other');
      }
      if (columns.target_domains_json) {
        await queryInterface.removeColumn('student_accounts', 'target_domains_json');
      }
    }
    if (has('target_domains')) {
      await queryInterface.dropTable('target_domains');
    }
  },
};
