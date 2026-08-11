'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable(
      'assessment_question_assignments',
    );

    if (!columns.duration_seconds) {
      await queryInterface.addColumn(
        'assessment_question_assignments',
        'duration_seconds',
        {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          defaultValue: null,
          comment:
            'Optional per-question time limit in seconds; null = no question timer',
        },
      );
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable(
      'assessment_question_assignments',
    );
    if (columns.duration_seconds) {
      await queryInterface.removeColumn(
        'assessment_question_assignments',
        'duration_seconds',
      );
    }
  },
};
