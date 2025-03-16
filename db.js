const mysql = require("mysql2/promise");  // Используем промис-обертку
const config = require("config");

const db = mysql.createPool({
    host: config.get("host"),
    user: config.get("user"),
    password: config.get("password"),
    database: config.get("database"),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

db.getConnection()
    .then(() => console.log("Успешное подключение к базе данных"))
    .catch((err) => {
        console.error("Ошибка подключения к базе данных:", err);
        process.exit(1);
    });

module.exports = db;
