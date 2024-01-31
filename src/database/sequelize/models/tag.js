import { DataTypes, Model } from "sequelize";

export default function defineTag(sequelize) {
  class Tag extends Model {
    static associate(models) {
      // associations
      Tag.belongsToMany(models.User, {
        through: models.UserTag,
        foreignKey: "tagId",
        otherKey: "userId",
      });
      Tag.hasMany(models.UserTag, { foreignKey: "tagId" });
      Tag.belongsToMany(models.Entry, {
        through: models.EntryTag,
        foreignKey: "tagId",
        otherKey: "entryId",
      });
      Tag.hasMany(models.EntryTag, { foreignKey: "tagId" });
    }
  }
  Tag.init(
    {
      // attributes
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
      modelName: "Tag",
    },
  );
  return Tag;
}
