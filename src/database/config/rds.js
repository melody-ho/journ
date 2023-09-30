import mysql2 from "mysql2";
import { Sequelize } from "sequelize";

const config = {
  HOST: process.env.RDS_HOST,
  PORT: process.env.RDS_PORT,
  USER: process.env.RDS_USER,
  PASSWORD: process.env.RDS_PASSWORD,
  DB: "journ-dev",
};

const rds = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: "mysql",
  dialectModule: mysql2,
});

export default rds;
