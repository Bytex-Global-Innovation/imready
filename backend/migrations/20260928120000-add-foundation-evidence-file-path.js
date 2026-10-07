'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('foundation_mission_records');
    if (!columns.evidence_file_path) {
      await queryInterface.addColumn('foundation_mission_records', 'evidence_file_path', {
        type: Sequelize.STRING(512),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable('foundation_mission_records');
    if (columns.evidence_file_path) {
      await queryInterface.removeColumn('foundation_mission_records', 'evidence_file_path');
    }
  },
};
