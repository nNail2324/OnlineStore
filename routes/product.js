const { Router } = require("express");
const db = require("../db");
const router = Router();

// Получение продуктов по категории
router.get("/products/:category", async (req, res) => {
    try {
        const { category } = req.params;
        const [rows] = await db.promise().query(
            "SELECT * FROM product WHERE category = ?",
            [category]
        );
        res.json(rows);
    } catch (err) {
        console.error("Ошибка при получении товаров:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
