'use strict';

/**
 * Store hashed refresh tokens for student access/refresh cookie auth.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (!has('student_accounts')) return;

    const columns = await queryInterface.describeTable('student_accounts');

    if (!columns.refresh_token_hash) {
      await queryInterface.addColumn('student_accounts', 'refresh_token_hash', {
        type: Sequelize.STRING(128),
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!columns.refresh_token_expires_at) {
      await queryInterface.addColumn(
        'student_accounts',
        'refresh_token_expires_at',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
      );
    }

    if (!columns.refresh_remember_me) {
      await queryInterface.addColumn('student_accounts', 'refresh_remember_me', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (!has('student_accounts')) return;

    const columns = await queryInterface.describeTable('student_accounts');
    for (const col of [
      'refresh_token_hash',
      'refresh_token_expires_at',
      'refresh_remember_me',
    ]) {
      if (columns[col]) {
        await queryInterface.removeColumn('student_accounts', col);
      }
    }
  },
};
