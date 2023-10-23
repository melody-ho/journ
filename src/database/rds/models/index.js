import defineEntry from "./entry";
import defineTag from "./tag";
import defineUser from "./user";

export default function initializeModels(sequelize) {
  // define models //
  defineUser(sequelize);
  defineEntry(sequelize);
  defineTag(sequelize);

  // define associations //
  const user = sequelize.models.User;
  const entry = sequelize.models.Entry;
  const tag = sequelize.models.Tag;
  user.hasMany(entry, { foreignKey: "userId" });
  entry.belongsTo(user, { foreignKey: "userId" });
  user.belongsToMany(tag, { through: "UserTags", foreignKey: "userId" });
  tag.belongsToMany(user, { through: "UserTags", foreignKey: "tagId" });
  entry.belongsToMany(tag, { through: "EntryTags", foreignKey: "entryId" });
  tag.belongsToMany(entry, { through: "EntryTags", foreignKey: "tagId" });
}
