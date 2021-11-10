const creds = require('../credentials')
const mysql = require('mysql2')
const pool = mysql.createPool({
	connectionLimit: 10,
	host: creds.mysql_host,
	user: creds.mysql_usr,
	password: creds.mysql_pw,
	database: creds.mysql_db
})

module.exports.pool = pool