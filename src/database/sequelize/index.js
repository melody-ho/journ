/// imports ///
import config from "./config/config";
import defineEntry from "./models/entry";
import defineEntryTag from "./models/entrytag";
import defineTag from "./models/tag";
import defineUser from "./models/user";
import defineUserTag from "./models/usertag";
import { Sequelize } from "sequelize";

/// main ///
// configure //
const env = process.env.NODE_ENV || "development";
const envConfig = config[env];

const sequelize = new Sequelize(
  envConfig.database,
  envConfig.username,
  envConfig.password,
  {
    host: envConfig.host,
    dialect: envConfig.dialect,
    dialectModule: envConfig.dialectModule,
  },
);

// define models //
const models = {
  User: defineUser(sequelize),
  Entry: defineEntry(sequelize),
  Tag: defineTag(sequelize),
  UserTag: defineUserTag(sequelize),
  EntryTag: defineEntryTag(sequelize),
};

// define associations //
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export default sequelize;
