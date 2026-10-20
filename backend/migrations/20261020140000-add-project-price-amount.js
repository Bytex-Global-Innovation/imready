'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('industry_projects');
    if (!table.project_price_amount) {
      await queryInterface.addColumn('industry_projects', 'project_price_amount', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('industry_projects');
    if (table.project_price_amount) {
      await queryInterface.removeColumn('industry_projects', 'project_price_amount');
    }
  },
};
