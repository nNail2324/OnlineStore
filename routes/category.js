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

// Получение категории по image
router.get("/image/:image", async (req, res) => {
    try {
        const { image } = req.params;
        const [rows] = await db.query("SELECT * FROM category WHERE image = ?", [image]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "Категория не найдена" });
        }
    } catch (err) {
        console.error("Ошибка при получении категории:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;