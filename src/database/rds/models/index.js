import defineUser from "./user";

export default async function initializeModels(sequelize) {
  defineUser(sequelize);
  await sequelize.sync({ force: true });
}
