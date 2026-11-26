'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (has('landing_share_problems')) return;

    await queryInterface.createTable('landing_share_problems', {
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
        type: Sequelize.STRING(160),
        allowNull: false,
      },
      company: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      payment_reference: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      idea_stage: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      problem: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      blocker: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      blocker_other: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: '',
      },
      project_types: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      project_type_other: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: '',
      },
      ready_plan: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      message_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      source: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: 'imready-admin-landing',
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

    await queryInterface.addIndex('landing_share_problems', ['email'], {
      name: 'landing_share_problems_email_idx',
    });
    await queryInterface.addIndex(
      'landing_share_problems',
      ['payment_reference'],
      {
        name: 'landing_share_problems_payment_reference_idx',
      },
    );
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());
    if (has('landing_share_problems')) {
      await queryInterface.dropTable('landing_share_problems');
    }
  },
};
