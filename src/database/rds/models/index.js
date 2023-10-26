import defineEntry from "./entry";
import defineEntryTag from "./entryTag";
import defineTag from "./tag";
import defineUser from "./user";
import defineUserTag from "./userTag";

export default function initializeModels(sequelize) {
  // define models //
  defineUser(sequelize);
  defineEntry(sequelize);
  defineTag(sequelize);
  defineUserTag(sequelize);
  defineEntryTag(sequelize);

  // define associations //
  const user = sequelize.models.User;
  const entry = sequelize.models.Entry;
  const tag = sequelize.models.Tag;
  const userTag = sequelize.models.UserTag;
  const entryTag = sequelize.models.EntryTag;
  user.hasMany(entry, { foreignKey: "userId" });
  entry.belongsTo(user, { foreignKey: "userId" });
  user.belongsToMany(tag, {
    through: userTag,
    foreignKey: "userId",
    otherKey: "tagId",
  });
  tag.belongsToMany(user, {
    through: userTag,
    foreignKey: "tagId",
    otherKey: "userId",
  });
  user.hasMany(userTag, { foreignKey: "userId" });
  userTag.belongsTo(user, { foreignKey: "userId" });
  tag.hasMany(userTag, { foreignKey: "tagId" });
  userTag.belongsTo(tag, { foreignKey: "tagId" });
  entry.belongsToMany(tag, {
    through: entryTag,
    foreignKey: "entryId",
    otherKey: "tagId",
  });
  tag.belongsToMany(entry, {
    through: entryTag,
    foreignKey: "tagId",
    otherKey: "entryId",
  });
  entry.hasMany(entryTag, { foreignKey: "entryId" });
  entryTag.belongsTo(entry, { foreignKey: "entryId" });
  tag.hasMany(entryTag, { foreignKey: "tagId" });
  entryTag.belongsTo(tag, { foreignKey: "tagId" });
}
