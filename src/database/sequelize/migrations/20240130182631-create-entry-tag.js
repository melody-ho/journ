"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EntryTags", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      entryId: {
        type: Sequelize.UUID,
        references: {
          model: "Entries",
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
    await queryInterface.dropTable("EntryTags");
  },
};
