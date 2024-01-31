"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserTags", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: "Users",
          key: "id",
        },
        allowNull: false,
      },
      tagId: {
        type: Sequelize.UUID,
        references: {
          model: "Tags",
          key: "id",
        },
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserTags");
  },
};
