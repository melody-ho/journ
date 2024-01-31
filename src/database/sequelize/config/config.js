module.exports = {
  development: {
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT,
    username: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB,
    dialect: "mysql",
    dialectModule: require("mysql2"),
  },
};
