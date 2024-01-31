import { DataTypes, Model } from "sequelize";

export default function defineModel(sequelize) {
  class User extends Model {
    static associate(models) {
      // associations
      User.hasMany(models.Entry, { foreignKey: "userId" });
      User.belongsToMany(models.Tag, {
        through: models.UserTag,
        foreignKey: "userId",
        otherKey: "tagId",
      });
      User.hasMany(models.UserTag, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      // attributes
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
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
      modelName: "User",
    },
  );
  return User;
}
