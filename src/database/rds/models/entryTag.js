import { DataTypes, Model } from "sequelize";

export default function defineEntryTag(sequelize) {
  class EntryTag extends Model {}
  EntryTag.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
    },
    {
      sequelize,
      modelName: "EntryTag",
    },
  );
}
