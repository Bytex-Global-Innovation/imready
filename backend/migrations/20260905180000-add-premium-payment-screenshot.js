'use strict';

/**
 * Store premium payment screenshot path + submission time on student_accounts.
 * No separate bytex/product tables — payment proof lives with the subscription request.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (!has('student_accounts')) return;

    const columns = await queryInterface.describeTable('student_accounts');

    if (!columns.premium_payment_screenshot) {
      await queryInterface.addColumn(
        'student_accounts',
        'premium_payment_screenshot',
        {
          type: Sequelize.STRING(512),
          allowNull: true,
          defaultValue: null,
        },
      );
    }

    if (!columns.premium_payment_submitted_at) {
      await queryInterface.addColumn(
        'student_accounts',
        'premium_payment_submitted_at',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
      );
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (!has('student_accounts')) return;

    const columns = await queryInterface.describeTable('student_accounts');
    for (const col of [
      'premium_payment_submitted_at',
      'premium_payment_screenshot',
    ]) {
      if (columns[col]) {
        await queryInterface.removeColumn('student_accounts', col);
      }
    }
  },
};
