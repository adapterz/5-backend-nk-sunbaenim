/* eslint-disable */
const mysql = require("mysql2");
require("dotenv").config();

const mysqlConnect = mysql.createPool({
      host: process.env.host,
      user: process.env.user,
      password: process.env.password,
      database: process.env.database
});

module.exports = mysqlConnect.promise();
