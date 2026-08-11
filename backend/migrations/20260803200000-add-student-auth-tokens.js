'use strict';

/**
 * Add email verification + password reset fields for student auth.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (name) =>
      tables.map((t) => String(t).toLowerCase()).includes(name.toLowerCase());

    if (!has('student_accounts')) return;

    const columns = await queryInterface.describeTable('student_accounts');

    if (!columns.email_verified_at) {
      await queryInterface.addColumn('student_accounts', 'email_verified_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!columns.email_verification_token) {
      await queryInterface.addColumn('student_accounts', 'email_verification_token', {
        type: Sequelize.STRING(128),
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!columns.email_verification_expires_at) {
      await queryInterface.addColumn(
        'student_accounts',
        'email_verification_expires_at',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
      );
    }

    if (!columns.password_reset_token) {
      await queryInterface.addColumn('student_accounts', 'password_reset_token', {
        type: Sequelize.STRING(128),
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!columns.password_reset_expires_at) {
      await queryInterface.addColumn('student_accounts', 'password_reset_expires_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
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
      'email_verified_at',
      'email_verification_token',
      'email_verification_expires_at',
      'password_reset_token',
      'password_reset_expires_at',
    ]) {
      if (columns[col]) {
        await queryInterface.removeColumn('student_accounts', col);
      }
    }
  },
};
