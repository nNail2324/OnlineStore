const { Router } = require("express");
const db = require("../db");
const router = Router();

// Получение данных пользователя
router.get("/:profile_id", async (req, res) => {
    try {
    const { profile_id } = req.params;
    const [rows] = await db.query(
        "SELECT name, surname, phone_number, city, street, house_number FROM users WHERE ID = ?", [profile_id]
    );
    
    if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "Пользователь не найден" });
    }
    
    res.json(rows[0]);

    } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Обновление данных пользователя
router.post("/update", async (req, res) => {
    try {
        const { userId, field, value } = req.body;
        if (!userId || !field || value === undefined) {
            return res.status(400).json({ message: "Неверные входные данные" });
        }

        await db.query(`UPDATE users SET ${field} = ? WHERE ID = ?`, [value, userId]);
        res.json({ success: true, message: "Данные успешно обновлены" });
    } catch (err) {
        console.error("Ошибка обновления данных:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;

