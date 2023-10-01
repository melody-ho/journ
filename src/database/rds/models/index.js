import defineUser from "./user";

export default function initializeModels(sequelize) {
  defineUser(sequelize);
}
