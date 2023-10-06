import defineImageEntry from "./imageEntry";
import defineUser from "./user";
import defineVideoEntry from "./videoEntry";

export default function initializeModels(sequelize) {
  // define models //
  defineUser(sequelize);
  defineImageEntry(sequelize);
  defineVideoEntry(sequelize);

  // define associations //
  const user = sequelize.models.User;
  const imageEntry = sequelize.models.ImageEntry;
  const videoEntry = sequelize.models.VideoEntry;
  user.hasMany(imageEntry, { foreignKey: "userId" });
  user.hasMany(videoEntry, { foreignKey: "userId" });
}
