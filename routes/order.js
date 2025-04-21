const { Router } = require("express");
const db = require("../db");
const router = Router();

router.post("/create", async (req, res) => {
    try {
        const { user_id, delivery_method } = req.body;

        const [cartItems] = await db.query(`
            SELECT c.product_id, c.quantity, p.price
            FROM cart c
            JOIN product p ON c.product_id = p.ID
            WHERE c.user_id = ?
        `, [user_id]);

        if (cartItems.length === 0) {
            return res.status(400).json({ message: "Корзина пуста" });
        }

        const total_price = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const delivery_price = delivery_method === "courier" ? 500 : 0; // например
        const final_price = total_price + delivery_price;

        const [orderResult] = await db.query(
            "INSERT INTO orders (user_id, total_price, delivery_method, delivery_price, status) VALUES (?, ?, ?, ?, 'В обработке')",
            [user_id, final_price, delivery_method, delivery_price]
        );

        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            await db.query(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        await db.query("DELETE FROM cart WHERE user_id = ?", [user_id]);

        res.status(201).json({ orderId });
    } catch (err) {
        console.error("Ошибка при создании заказа:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.get("/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;

        const [orderInfo] = await db.query(
            "SELECT * FROM orders WHERE id = ?",
            [orderId]
        );

        const [items] = await db.query(
            `SELECT oi.product_id, oi.quantity, oi.price, p.name, s.unit
             FROM order_items oi
             JOIN product p ON oi.product_id = p.ID
             JOIN subcategory s ON p.subcategory_id = s.ID
             WHERE oi.order_id = ?`,
            [orderId]
        );

        if (orderInfo.length === 0) return res.status(404).json({ message: "Заказ не найден" });

        res.json({
            ...orderInfo[0],
            items
        });
    } catch (err) {
        console.error("Ошибка получения заказа:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
