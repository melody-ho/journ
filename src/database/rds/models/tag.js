import { DataTypes, Model } from "sequelize";

export default function defineTag(sequelize) {
  class Tag extends Model {}
  Tag.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Tag",
    },
  );
}
