require("dotenv").config();
module.exports = {
  development: {
    username: "root",
    password: process.env.DB_PASSWORD,
    database: "zerov",
    host: "34.64.197.0",
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
    host: "34.64.197.0",
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: process.env.DB_PASSWORD,
    database: "zerov",
    host: "34.64.197.0",
    dialect: "mysql",
  },
};
