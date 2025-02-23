const mysql = require("mysql2");
const config = require("config");

const pool = mysql.createPool({
    host: config.get("host"),
    user: config.get("user"),
    database: config.get("database"),
    password: config.get("password")
}).promise();

module.exports = pool;
