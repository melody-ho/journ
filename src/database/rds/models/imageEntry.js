import { DataTypes, Model } from "sequelize";

export default function defineImageEntry(sequelize) {
  class ImageEntry extends Model {}
  ImageEntry.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      caption: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "ImageEntry",
    },
  );
}
