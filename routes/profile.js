const { Router } = require("express");
const db = require("../db");
const router = Router();
const bcrypt = require("bcryptjs");

// Получение данных пользователя с названием города и ценой доставки
router.get("/:profile_id", async (req, res) => {
    try {
        const { profile_id } = req.params;
        const [rows] = await db.query(
            `SELECT 
                users.name, 
                users.surname, 
                users.phone_number, 
                users.city, 
                users.street, 
                users.house_number,
                location_and_delivery.name AS location_name,
                location_and_delivery.delivery_price
            FROM users
            LEFT JOIN location_and_delivery ON users.city = location_and_delivery.ID
            WHERE users.ID = ?`,
            [profile_id]
        );
        
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        
        res.json(rows[0]);

    } catch (err) {
        console.error("Ошибка при получении данных профиля:", err);
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

// Смена пароля
router.post("/change-password", async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ message: "Неверные данные запроса" });
        }

        // Получаем текущий хеш пароля пользователя
        const [rows] = await db.query("SELECT password FROM users WHERE ID = ?", [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: "Неверный текущий пароль" });
        }

        // Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password = ? WHERE ID = ?", [hashedPassword, userId]);

        res.json({ success: true, message: "Пароль успешно обновлён" });
    } catch (err) {
        console.error("Ошибка смены пароля:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение заказов пользователя
router.get("/:profile_id/orders", async (req, res) => {
    try {
        const { profile_id } = req.params;
        const [orders] = await db.query(
            `SELECT o.ID, o.status, o.created_at, o.total_price, o.delivery_method
             FROM orders o
             WHERE o.user_id = ?
             ORDER BY o.created_at DESC`,
            [profile_id]
        );

        for (let order of orders) {
            const [items] = await db.query(
                `SELECT oi.product_id, oi.quantity, oi.price, p.name AS product_name, s.name AS subcategory_name
                 FROM order_items oi
                 JOIN product p ON oi.product_id = p.ID
                 JOIN subcategory s ON p.subcategory_id = s.ID
                 WHERE oi.order_id = ?`,
                [order.ID]
            );
            order.items = items;
        }

        res.json(orders);
    } catch (err) {
        console.error("Ошибка при получении заказов:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;

