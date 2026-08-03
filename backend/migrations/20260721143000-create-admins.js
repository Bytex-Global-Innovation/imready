'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const tableExists = tables.some(
      (name) => String(name).toLowerCase() === 'admins',
    );

    if (!tableExists) {
      await queryInterface.createTable(
        'admins',
        {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          email: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          password_hash: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal(
              'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            ),
          },
        },
        {
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci',
        },
      );
    }

    const indexes = await queryInterface.showIndex('admins');
    const hasEmailUnique = indexes.some(
      (index) => index.name === 'uq_admins_email',
    );

    if (!hasEmailUnique) {
      await queryInterface.addIndex('admins', ['email'], {
        unique: true,
        name: 'uq_admins_email',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('admins');
  },
};
