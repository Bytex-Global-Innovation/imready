'use strict';

/** Unpaid projects no longer use completion payout; amounts are premium-only. */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('industry_projects');
    if (table.completion_payout_amount) {
      await queryInterface.sequelize.query(
        'UPDATE industry_projects SET completion_payout_amount = NULL WHERE is_free = 1',
      );
    }
  },

  async down() {
    // Data cannot be restored.
  },
};
