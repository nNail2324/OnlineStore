const { Router } = require("express");
const db = require("../db");
const router = Router();

// Получение товаров по ID подкатегории
router.get("/subcategory/:subcategoryId", async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        const [rows] = await db.query("SELECT * FROM product WHERE subcategory_id = ?", [subcategoryId]);
        res.json(rows);
    } catch (err) {
        console.error("Ошибка при получении товаров:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение полной информации о товаре по ID (для карточки товара)
router.get("/card/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Получаем основную информацию о товаре
        const [productRows] = await db.query("SELECT * FROM product WHERE ID = ?", [productId]);
        
        if (productRows.length === 0) {
            return res.status(404).json({ message: "Товар не найден" });
        }
        
        // Получаем атрибуты товара
        const [attributeRows] = await db.query(
            "SELECT attribute_name, attribute_value FROM product_attributes WHERE product_id = ?",
            [productId]
        );
        
        const product = {
            ...productRows[0],
            attributes: attributeRows
        };
        
        res.json(product);
    } catch (err) {
        console.error("Ошибка при получении товара:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.get("/feedback/:productId", async (req, res) => {
    try {
        const { productId } = req.params;

        const [rows] = await db.query(
            `SELECT f.description, f.mark, f.created_at, u.name AS username 
             FROM feedback f
             JOIN users u ON f.user_id = u.ID
             WHERE f.product_id = ?
             ORDER BY f.created_at DESC`,
            [productId]
        );

        res.json(rows);
    } catch (err) {
        console.error("Ошибка при получении отзывов:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.post("/feedback", async (req, res) => {
    try {
        const { user_id, product_id, mark, description } = req.body;

        if (!user_id || !product_id || !description || mark === undefined) {
            return res.status(400).json({ message: "Заполните все поля" });
        }

        await db.query(
            `INSERT INTO feedback (user_id, product_id, mark, description, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [user_id, product_id, mark, description]
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Ошибка при добавлении отзыва:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


module.exports = router;