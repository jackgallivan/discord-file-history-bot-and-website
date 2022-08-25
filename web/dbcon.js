const creds = require("../credentials");
const mysql = require("mysql2");
const pool = mysql.createPool({
  connectionLimit: 10,
  host: creds.mysql_host, // MySQL server address
  user: creds.mysql_usr, // MySQL server username
  password: creds.mysql_pw, // MySQL server password
  database: creds.mysql_db, // MySQL database name
});
const promisePool = pool.promise();

module.exports.pool = promisePool;
