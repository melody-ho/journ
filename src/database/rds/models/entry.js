import { DataTypes, Model } from "sequelize";

export default function defineEntry(sequelize) {
  class Entry extends Model {}
  Entry.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "Entry",
    },
  );
}
