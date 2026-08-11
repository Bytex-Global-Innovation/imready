'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('assessments');

    if (!columns.duration_minutes) {
      await queryInterface.addColumn('assessments', 'duration_minutes', {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 60,
        comment: 'Overall assessment time limit in minutes',
      });
    }

    if (!columns.per_question_duration_seconds) {
      await queryInterface.addColumn(
        'assessments',
        'per_question_duration_seconds',
        {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 180,
          comment: 'Time allowed per question in seconds; expires → lock + auto-next',
        },
      );
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable('assessments');
    if (columns.per_question_duration_seconds) {
      await queryInterface.removeColumn(
        'assessments',
        'per_question_duration_seconds',
      );
    }
    if (columns.duration_minutes) {
      await queryInterface.removeColumn('assessments', 'duration_minutes');
    }
  },
};
