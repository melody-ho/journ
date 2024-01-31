import { DataTypes, Model } from "sequelize";

export default function defineEntryTag(sequelize) {
  class EntryTag extends Model {
    static associate(models) {
      // associations
      EntryTag.belongsTo(models.Entry, { foreignKey: "entryId" });
      EntryTag.belongsTo(models.Tag, { foreignKey: "tagId" });
    }
  }
  EntryTag.init(
    {
      // attributes
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "EntryTag",
    },
  );
  return EntryTag;
}
