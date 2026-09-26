'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('industry_projects');
    if (columns.is_free) return;

    await queryInterface.addColumn('industry_projects', 'is_free', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('industry_projects', 'is_free');
  },
};
