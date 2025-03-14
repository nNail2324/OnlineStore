const mysql = require("mysql2");
const config = require("config");

const db = mysql.createConnection({
  host: config.get("host"),
  user: config.get("user"),
  password: config.get("password"),
  database: config.get("database"),
});

db.connect((err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err);
    process.exit(1);
  }
  console.log("Успешное подключение к базе данных");
});

module.exports = db;
