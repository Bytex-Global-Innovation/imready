'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const questionColumns = await queryInterface.describeTable('assessment_questions');
    if (!questionColumns.answer_type) {
      await queryInterface.addColumn('assessment_questions', 'answer_type', {
        type: Sequelize.ENUM('JUMBLED', 'PERSONAL', 'BOTH'),
        allowNull: false,
        defaultValue: 'BOTH',
      });
    }
  },

  async down(queryInterface) {
    const questionColumns = await queryInterface.describeTable('assessment_questions');
    if (questionColumns.answer_type) {
      await queryInterface.removeColumn('assessment_questions', 'answer_type');
    }
  },
};
