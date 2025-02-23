const db = require("../db");

const User = {
  create: (phone_number, password, name, surname, city, street, house_number, callback) => {
    const sql = "INSERT INTO users (phone_number, password, name, surname, city, street, house_number) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [phone_number, password, name, surname, city, street, house_number], (err, result) => {
      if (err) return callback(err);
      callback(null, result.insertId);
    });
  },

  findByNumber: (phone_number, callback) => {
    const sql = "SELECT * FROM users WHERE phone_number = ?";
    db.query(sql, [phone_number], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]); 
    });
  },
};

module.exports = User;
