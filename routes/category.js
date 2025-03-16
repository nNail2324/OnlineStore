const { Router } = require("express");
const db = require("../db");  // Подключаем базу данных
const router = Router();

// Получение всех категорий
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM category");  // Асинхронный запрос
        res.json(rows);
    } catch (err) {
        console.error("Ошибка при получении категорий:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
