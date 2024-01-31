import { DataTypes, Model } from "sequelize";

export default function defineEntry(sequelize) {
  class Entry extends Model {
    static associate(models) {
      // associations
      Entry.belongsTo(models.User, { foreignKey: "userId" });
      Entry.belongsToMany(models.Tag, {
        through: models.EntryTag,
        foreignKey: "entryId",
        otherKey: "tagId",
      });
      Entry.hasMany(models.EntryTag, { foreignKey: "entryId" });
    }
  }
  Entry.init(
    {
      // attributes
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
      createdAt: {
        type: DataTypes.DATE(6),
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE(6),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Entry",
    },
  );
  return Entry;
}
