require("dotenv").config();
module.exports = {
  development: {
    username: "admin",
    password: process.env.DB_PASSWORD,
    database: "zerov",
    host: "database-1.cool8w9ibmyq.ap-northeast-2.rds.amazonaws.com",
    dialect: "mysql",
    timezone: "+09:00",
    dateStrings: "true",
    pool: {
      max: 1000,
      min: 0,
      acquire: 30000,
      idle: 1000,
    },
  },
  test: {
    username: "admin",
    password: process.env.DB_PASSWORD,
    database: "zerov",
    host: "database-1.cool8w9ibmyq.ap-northeast-2.rds.amazonaws.com",
    dialect: "mysql",
    timezone: "+09:00",
    pool: {
      max: 1000,
      min: 0,
      acquire: 30000,
      idle: 1000,
    },
  },
  production: {
    username: "admin",
    password: process.env.DB_PASSWORD,
    database: "zerov",
    host: "database-1.cool8w9ibmyq.ap-northeast-2.rds.amazonaws.com",
    dialect: "mysql",
    timezone: "+09:00",
    pool: {
      max: 1000,
      min: 0,
      acquire: 30000,
      idle: 1000,
    },
  },
};
