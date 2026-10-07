'use strict';

/**
 * Track Free / Premium Pending / Premium separately from email verification status.
 * Existing Bytex (bytex-unlock) signups become PREMIUM_PENDING until an admin approves.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (!has('student_accounts')) return;

    const columns = await queryInterface.describeTable('student_accounts');

    if (!columns.subscription_status) {
      await queryInterface.addColumn('student_accounts', 'subscription_status', {
        type: Sequelize.ENUM('FREE', 'PREMIUM_PENDING', 'PREMIUM'),
        allowNull: false,
        defaultValue: 'FREE',
      });
    }

    if (!columns.premium_approved_at) {
      await queryInterface.addColumn('student_accounts', 'premium_approved_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!columns.premium_approved_by) {
      await queryInterface.addColumn('student_accounts', 'premium_approved_by', {
        type: Sequelize.STRING(36),
        allowNull: true,
        defaultValue: null,
      });
    }

    await queryInterface.sequelize.query(
      `UPDATE student_accounts
       SET subscription_status = 'PREMIUM_PENDING'
       WHERE career_door = 'bytex-unlock'
         AND subscription_status = 'FREE'`,
    );
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (!has('student_accounts')) return;

    const columns = await queryInterface.describeTable('student_accounts');
    for (const col of [
      'premium_approved_by',
      'premium_approved_at',
      'subscription_status',
    ]) {
      if (columns[col]) {
        await queryInterface.removeColumn('student_accounts', col);
      }
    }
  },
};
