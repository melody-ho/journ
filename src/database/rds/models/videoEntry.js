import { DataTypes, Model } from "sequelize";

export default function defineVideoEntry(sequelize) {
  class VideoEntry extends Model {}
  VideoEntry.init(
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
      modelName: "VideoEntry",
    },
  );
}
