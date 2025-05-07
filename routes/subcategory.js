const { Router } = require("express");
const db = require("../db");
const router = Router();

// Добавление подкатегории
router.post("/create", async (req, res) => {
    try {
        const { category_id, name, unit } = req.body;

        if (!category_id || !name || !unit) {
            return res.status(400).json({ message: "Не все поля заполнены" });
        }

        const [result] = await db.query(
            "INSERT INTO subcategory (category_id, name, unit) VALUES (?, ?, ?)",
            [category_id, name, unit]
        );

        res.status(201).json({ subcategoryId: result.insertId });
    } catch (error) {
        console.error("Ошибка при добавлении подкатегории:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение подкатегорий по ID категории с количеством товаров
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(`
            SELECT s.*, COUNT(p.ID) as product_count 
            FROM subcategory s
            LEFT JOIN product p ON s.ID = p.subcategory_id
            WHERE s.category_id = ?
            GROUP BY s.ID
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Подкатегории не найдены" });
        }

        res.json(rows);
    } catch (err) {
        console.error("Ошибка при получении подкатегорий:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение одной подкатегории по ID
router.get("/single/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT * FROM subcategory WHERE ID = ?", [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Подкатегория не найдена" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Ошибка при получении подкатегории:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
