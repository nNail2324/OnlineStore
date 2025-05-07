const { Router } = require("express");
const db = require("../db");
const router = Router();

router.get("/", async (req, res) => {
    try {
        const [requests] = await db.query(`
            SELECT ID, name, phone_number, created_at
            FROM requests
            ORDER BY created_at DESC
        `);

        res.json(requests);
    } catch (err) {
        console.error("Ошибка при получении заявок:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.post('/create', async (req, res) => {
    const { name, phone_number } = req.body;

    if (!name || !phone_number) {
        return res.status(400).json({ message: "Все поля обязательны" });
    }

    try {
        const sql = `INSERT INTO requests (name, phone_number) VALUES (?, ?)`;
        await db.query(sql, [name, phone_number]);

        res.status(201).json({ message: "Заявка успешно отправлена" });
    } catch (err) {
        console.error("Ошибка при создании заявки:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
