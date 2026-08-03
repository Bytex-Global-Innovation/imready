'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const assessmentColumns = await queryInterface.describeTable('assessments');
    if (!assessmentColumns.weighting_mode) await queryInterface.addColumn('assessments', 'weighting_mode', { type: Sequelize.ENUM('EQUAL', 'INDIVIDUAL'), allowNull: false, defaultValue: 'EQUAL' });
    const linkColumns = await queryInterface.describeTable('assessment_question_links');
    if (!linkColumns.category) await queryInterface.addColumn('assessment_question_links', 'category', { type: Sequelize.ENUM('OBSERVATION', 'THINKING', 'BUILDING'), allowNull: false, defaultValue: 'OBSERVATION' });
    if (!linkColumns.jumbled_options_marks) await queryInterface.addColumn('assessment_question_links', 'jumbled_options_marks', { type: Sequelize.DECIMAL(8, 2), allowNull: true, defaultValue: null });
    if (!linkColumns.personal_response_marks) await queryInterface.addColumn('assessment_question_links', 'personal_response_marks', { type: Sequelize.DECIMAL(8, 2), allowNull: true, defaultValue: null });
    const answerColumns = await queryInterface.describeTable('assessment_submission_answers');
    if (!answerColumns.category) await queryInterface.addColumn('assessment_submission_answers', 'category', { type: Sequelize.ENUM('OBSERVATION', 'THINKING', 'BUILDING'), allowNull: false, defaultValue: 'OBSERVATION' });
  },
  async down(queryInterface) {
    const linkColumns = await queryInterface.describeTable('assessment_question_links');
    for (const column of ['personal_response_marks', 'jumbled_options_marks', 'category']) if (linkColumns[column]) await queryInterface.removeColumn('assessment_question_links', column);
    const assessmentColumns = await queryInterface.describeTable('assessments');
    if (assessmentColumns.weighting_mode) await queryInterface.removeColumn('assessments', 'weighting_mode');
    const answerColumns = await queryInterface.describeTable('assessment_submission_answers');
    if (answerColumns.category) await queryInterface.removeColumn('assessment_submission_answers', 'category');
  },
};
