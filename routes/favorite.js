const { Router } = require("express");
const db = require("../db");
const router = Router();

// Добавить в избранное
router.post("/add", async (req, res) => {
    const { user_id, product_id } = req.body;
    try {
        // Проверяем, есть ли уже в избранном
        const [existing] = await db.query(
            "SELECT * FROM favorite WHERE user_id = ? AND product_id = ?",
            [user_id, product_id]
        );

        if (existing.length > 0) {
            return res.json({ success: false, message: "Товар уже в избранном" });
        }

        await db.query("INSERT INTO favorite (user_id, product_id) VALUES (?, ?)", [user_id, product_id]);
        res.json({ success: true, message: "Добавлено в избранное" });
    } catch (err) {
        console.error("❌ Ошибка добавления в избранное:", err);
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
});

// Получить избранные товары пользователя
router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;
    try {
        const [favorites] = await db.query(`
            SELECT p.ID, p.name, p.price
            FROM favorite f
            JOIN product p ON f.product_id = p.ID
            WHERE f.user_id = ?
        `, [user_id]);

        res.json(favorites);
    } catch (err) {
        console.error("❌ Ошибка получения избранного:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Удалить из избранного
router.delete("/remove", async (req, res) => {
    const { user_id, product_id } = req.body;
    try {
        await db.query("DELETE FROM favorite WHERE user_id = ? AND product_id = ?", [user_id, product_id]);

        // Возвращаем обновлённый список
        const [updatedFavorites] = await db.query(`
            SELECT p.ID, p.name, p.price
            FROM favorite f
            JOIN product p ON f.product_id = p.ID
            WHERE f.user_id = ?
        `, [user_id]);

        res.json(updatedFavorites);
    } catch (err) {
        console.error("❌ Ошибка удаления из избранного:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.post("/check", async (req, res) => {
    const { user_id, product_id } = req.body;
    try {
        const [rows] = await db.query(
            "SELECT * FROM favorite WHERE user_id = ? AND product_id = ?",
            [user_id, product_id]
        );
        res.json({ isFavorite: rows.length > 0 });
    } catch (err) {
        console.error("Ошибка при проверке избранного:", err);
        res.status(500).json({ isFavorite: false });
    }
});


module.exports = router;
