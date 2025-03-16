const { Router } = require("express");
const db = require("../db");
const router = Router();

// Получение товаров по ID категории
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT * FROM product WHERE ID_category = ?", [id]);

        // Форматируем цену, убирая копейки, если они равны 00
        const formattedRows = rows.map((product) => {
            const price = parseFloat(product.price).toFixed(2); // Преобразуем в строку с двумя знаками после запятой
            return {
                ...product,
                price: price.endsWith(".00") ? price.slice(0, -3) : price, // Убираем .00, если они есть
            };
        });

        res.json(formattedRows);
    } catch (err) {
        console.error("Ошибка при получении товаров:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;