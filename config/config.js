require("dotenv").config();
module.exports = {
  development: {
    username: "root",
    password: process.env.DB_PASSWORD,
    database: "zerov",
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "+09:00",
    dateStrings: "true",
    pool: {
      max: "1000",
      min: "0",
      acquire: "30000",
      idle: "1000",
    },
  },
  test: {
    username: "root",
    password: process.env.DB_PASSWORD,
    database: "zerov",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: process.env.DB_PASSWORD,
    database: "zerov",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
