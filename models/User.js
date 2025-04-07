const db = require("../db");

const User = {
    create: async (phone_number, password, name = "", surname = "", city = "", street = "", house_number = 0) => {
        try {
            const sql = "INSERT INTO users (phone_number, password, name, surname, city, street, house_number) VALUES (?, ?, ?, ?, ?, ?, ?)";
            const [result] = await db.execute(sql, [phone_number, password, name, surname, city, street, house_number]);
            console.log("Пользователь успешно добавлен с ID:", result.insertId);
            return result.insertId;
        } catch (err) {
            console.error("Ошибка при добавлении пользователя в базу данных:", err.message);
            throw err;
        }
    },

    findByNumber: async (phone_number) => {
        try {
            const sql = "SELECT * FROM users WHERE phone_number = ?";
            console.log("SQL-запрос на поиск пользователя:", sql);
            const [results] = await db.execute(sql, [phone_number]);
    
            console.log("Результаты поиска пользователя:", results);
            
            if (results.length === 0) {
                console.log("❌ Пользователь не найден");
                return null;
            }
    
            console.log("✅ Найденный пользователь:", results[0]);  
            return results[0]; 
        } catch (err) {
            console.error("Ошибка при поиске пользователя:", err.message);
            throw err;
        }
    },
    
};

module.exports = User;
