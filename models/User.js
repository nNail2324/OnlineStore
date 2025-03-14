const db = require("../db");

const User = {
  create: (phone_number, password, name = "", surname = "", city = "", street = "", house_number = 0) => {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO users (phone_number, password, name, surname, city, street, house_number) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(sql, [phone_number, password, name, surname, city, street, house_number], (err, result) => {
        if (err) {
          console.error("Ошибка при добавлении пользователя в базу данных:", err);
          return reject(err);
        }
        console.log("Пользователь успешно добавлен в базу данных с ID:", result.insertId);
        resolve(result.insertId);
      });
    });
  },

  findByNumber: (phone_number) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM users WHERE phone_number = ?";
      db.query(sql, [phone_number], (err, results) => {
        if (err) {
          console.error("Ошибка при поиске пользователя:", err);
          return reject(err);
        }
        resolve(results[0]);
      });
    });
  },
};

module.exports = User;
