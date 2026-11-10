'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const students = await queryInterface.describeTable('student_accounts');

    if (!students.foundation_verification_status) {
      await queryInterface.addColumn('student_accounts', 'foundation_verification_status', {
        type: Sequelize.ENUM('NONE', 'PENDING', 'PASSED', 'FAILED'),
        allowNull: false,
        defaultValue: 'NONE',
      });
    }
    if (!students.foundation_verification_requested_at) {
      await queryInterface.addColumn(
        'student_accounts',
        'foundation_verification_requested_at',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
      );
    }
    if (!students.foundation_verification_reviewed_at) {
      await queryInterface.addColumn(
        'student_accounts',
        'foundation_verification_reviewed_at',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
      );
    }
    if (!students.foundation_verification_note) {
      await queryInterface.addColumn('student_accounts', 'foundation_verification_note', {
        type: Sequelize.STRING(1000),
        allowNull: true,
        defaultValue: null,
      });
    }

    // Students who already completed foundation before this gate: treat as PASSED
    // so existing unlocked users are not locked out.
    await queryInterface.sequelize.query(`
      UPDATE student_accounts
      SET foundation_verification_status = 'PASSED',
          foundation_verification_requested_at = COALESCE(foundation_completed_at, NOW()),
          foundation_verification_reviewed_at = COALESCE(foundation_completed_at, NOW())
      WHERE foundation_completed_at IS NOT NULL
        AND foundation_verification_status = 'NONE'
    `);

    await queryInterface.addIndex('student_accounts', ['foundation_verification_status'], {
      name: 'idx_students_foundation_verification_status',
    });
  },

  async down(queryInterface) {
    const students = await queryInterface.describeTable('student_accounts');
    try {
      await queryInterface.removeIndex(
        'student_accounts',
        'idx_students_foundation_verification_status',
      );
    } catch {
      // ignore
    }
    if (students.foundation_verification_note) {
      await queryInterface.removeColumn('student_accounts', 'foundation_verification_note');
    }
    if (students.foundation_verification_reviewed_at) {
      await queryInterface.removeColumn(
        'student_accounts',
        'foundation_verification_reviewed_at',
      );
    }
    if (students.foundation_verification_requested_at) {
      await queryInterface.removeColumn(
        'student_accounts',
        'foundation_verification_requested_at',
      );
    }
    if (students.foundation_verification_status) {
      await queryInterface.removeColumn(
        'student_accounts',
        'foundation_verification_status',
      );
    }
  },
};
