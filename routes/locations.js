const express = require("express");
const router = express.Router();
const db = require("../db"); // Путь к твоей базе данных

// Маршрут для получения списка населённых пунктов
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT ID, name FROM location_and_delivery");
        console.log("Полученные данные:", rows);
        res.json(rows); // Вернём данные в формате JSON
    } catch (err) {
        console.error("Ошибка при получении списка населённых пунктов:", err);
        res.status(500).json({ message: "Ошибка сервера" }); // Вернём ошибку в формате JSON
    }
});


module.exports = router;
