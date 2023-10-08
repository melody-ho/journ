import defineEntry from "./entry";
import defineUser from "./user";

export default function initializeModels(sequelize) {
  // define models //
  defineUser(sequelize);
  defineEntry(sequelize);

  // define associations //
  const user = sequelize.models.User;
  const entry = sequelize.models.Entry;
  user.hasMany(entry, { foreignKey: "userId" });
  entry.belongsTo(user, { foreignKey: "userId" });
}
