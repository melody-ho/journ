"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Entries", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: "Users",
          key: "id",
        },
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Entries");
  },
};
