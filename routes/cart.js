const { Router } = require("express");
const db = require("../db");
const router = Router();

// Добавление товара в корзину
router.post("/add", async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;

        // Проверяем, есть ли товар уже в корзине
        const [existingItem] = await db.query(
            "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?",
            [user_id, product_id]
        );

        if (existingItem.length > 0) {
            // Увеличиваем количество
            const newQuantity = existingItem[0].quantity + quantity;
            await db.query(
                "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
                [newQuantity, user_id, product_id]
            );
        } else {
            // Добавляем новый товар
            await db.query(
                "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
                [user_id, product_id, quantity]
            );
        }

        res.json({ success: true, message: "Товар добавлен в корзину" });
    } catch (err) {
        console.error("Ошибка при добавлении товара в корзину:", err);
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
});

// Получение корзины пользователя
router.get("/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;

        const [cartItems] = await db.query(`
            SELECT c.product_id as ID, p.name, p.price, s.unit, c.quantity
            FROM cart c
            JOIN product p ON c.product_id = p.ID
            JOIN subcategory s ON p.subcategory_id = s.ID
            WHERE c.user_id = ?
        `, [user_id]);

        res.json(cartItems);
    } catch (err) {
        console.error("Ошибка при получении корзины:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Обновление количества товара
router.put("/update", async (req, res) => {
    try {
        const { user_id, product_id, change } = req.body;

        const [existingItem] = await db.query(
            "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?",
            [user_id, product_id]
        );

        if (existingItem.length === 0)
            return res.status(404).json({ message: "Товар не найден в корзине" });

        let newQuantity = existingItem[0].quantity + change;
        if (newQuantity < 1) newQuantity = 1;

        await db.query(
            "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
            [newQuantity, user_id, product_id]
        );

        const [updatedCart] = await db.query(`
            SELECT c.product_id as ID, p.name, p.price, s.unit, c.quantity
            FROM cart c
            JOIN product p ON c.product_id = p.ID
            JOIN subcategory s ON p.subcategory_id = s.ID
            WHERE c.user_id = ?
        `, [user_id]);

        res.json(updatedCart);
    } catch (err) {
        console.error("Ошибка при обновлении корзины:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Удаление товара из корзины
router.delete("/remove", async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        await db.query("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [user_id, product_id]);

        const [updatedCart] = await db.query(`
            SELECT c.product_id as ID, p.name, p.price, s.unit, c.quantity
            FROM cart c
            JOIN product p ON c.product_id = p.ID
            JOIN subcategory s ON p.subcategory_id = s.ID
            WHERE c.user_id = ?
        `, [user_id]);

        res.json(updatedCart);
    } catch (err) {
        console.error("Ошибка при удалении товара из корзины:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
