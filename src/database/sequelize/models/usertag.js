import { DataTypes, Model } from "sequelize";

export default function defineUserTag(sequelize) {
  class UserTag extends Model {
    static associate(models) {
      // associations
      UserTag.belongsTo(models.User, { foreignKey: "userId" });
      UserTag.belongsTo(models.Tag, { foreignKey: "tagId" });
    }
  }
  UserTag.init(
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
      modelName: "UserTag",
    },
  );
  return UserTag;
}
