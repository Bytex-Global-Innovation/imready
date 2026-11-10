'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const projects = await queryInterface.describeTable('industry_projects');

    if (!projects.what_you_gain) {
      await queryInterface.addColumn('industry_projects', 'what_you_gain', {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      });
    }
    if (!projects.cohort_starts) {
      await queryInterface.addColumn('industry_projects', 'cohort_starts', {
        type: Sequelize.STRING(120),
        allowNull: false,
        defaultValue: '',
      });
    }
    if (!projects.mentorship_label) {
      await queryInterface.addColumn('industry_projects', 'mentorship_label', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Verified Industry Partner',
      });
    }
    if (!projects.team_formation_note) {
      await queryInterface.addColumn('industry_projects', 'team_formation_note', {
        type: Sequelize.STRING(500),
        allowNull: false,
        defaultValue: '',
      });
    }
    if (!projects.apply_opens_at) {
      await queryInterface.addColumn('industry_projects', 'apply_opens_at', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
    }
    if (!projects.apply_closes_at) {
      await queryInterface.addColumn('industry_projects', 'apply_closes_at', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
    }
    if (!projects.apply_window_days) {
      await queryInterface.addColumn('industry_projects', 'apply_window_days', {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const projects = await queryInterface.describeTable('industry_projects');
    const columns = [
      'apply_window_days',
      'apply_closes_at',
      'apply_opens_at',
      'team_formation_note',
      'mentorship_label',
      'cohort_starts',
      'what_you_gain',
    ];
    for (const column of columns) {
      if (projects[column]) {
        await queryInterface.removeColumn('industry_projects', column);
      }
    }
  },
};
