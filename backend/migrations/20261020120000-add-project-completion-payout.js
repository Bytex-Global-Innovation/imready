'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('industry_projects');
    if (!table.completion_payout_amount) {
      await queryInterface.addColumn('industry_projects', 'completion_payout_amount', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('industry_projects');
    if (table.completion_payout_amount) {
      await queryInterface.removeColumn('industry_projects', 'completion_payout_amount');
    }
  },
};
