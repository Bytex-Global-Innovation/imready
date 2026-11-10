'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const projects = await queryInterface.describeTable('industry_projects');
    if (!projects.company_name) {
      await queryInterface.addColumn('industry_projects', 'company_name', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: '',
      });
    }

    const apps = await queryInterface.describeTable('project_applications');
    if (!apps.motivation) {
      await queryInterface.addColumn('project_applications', 'motivation', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!apps.contributions) {
      await queryInterface.addColumn('project_applications', 'contributions', {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      });
    }
  },

  async down(queryInterface) {
    const apps = await queryInterface.describeTable('project_applications');
    if (apps.contributions) {
      await queryInterface.removeColumn('project_applications', 'contributions');
    }
    if (apps.motivation) {
      await queryInterface.removeColumn('project_applications', 'motivation');
    }

    const projects = await queryInterface.describeTable('industry_projects');
    if (projects.company_name) {
      await queryInterface.removeColumn('industry_projects', 'company_name');
    }
  },
};
