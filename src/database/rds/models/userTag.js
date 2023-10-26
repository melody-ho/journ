import { DataTypes, Model } from "sequelize";

export default function defineUserTag(sequelize) {
  class UserTag extends Model {}
  UserTag.init(
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
      modelName: "UserTag",
    },
  );
}
