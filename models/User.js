const db = require("../db");

const User = {
  create: (phone_number, password, name, surname, city, street, house_number) => {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO users (phone_number, password, name, surname, city, street, house_number) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(sql, [phone_number, password, name, surname, city, street, house_number], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  },

  findByNumber: (phone_number) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM users WHERE phone_number = ?";
      db.query(sql, [phone_number], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]); // Возвращаем пользователя, если найден
      });
    });
  },
};

module.exports = User;
