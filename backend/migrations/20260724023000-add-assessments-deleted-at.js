'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('assessments');
    if (!table.deleted_at) {
      await queryInterface.addColumn('assessments', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
      await queryInterface.addIndex('assessments', ['deleted_at'], {
        name: 'idx_assessments_deleted_at',
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('assessments');
    if (table.deleted_at) {
      await queryInterface.removeIndex('assessments', 'idx_assessments_deleted_at');
      await queryInterface.removeColumn('assessments', 'deleted_at');
    }
  },
};
