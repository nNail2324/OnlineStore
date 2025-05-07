const { Router } = require("express");
const db = require("../db");

const router = Router();

// Получение списка всех пользователей
router.get("/", async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT 
                users.ID, 
                users.name, 
                users.surname, 
                users.phone_number, 
                users.street, 
                users.house_number,
                location_and_delivery.name AS city_name
            FROM users
            LEFT JOIN location_and_delivery ON users.city = location_and_delivery.ID
            WHERE users.role = "user"`
        );
        res.json(users);
    } catch (err) {
        console.error("Ошибка при получении пользователей:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
