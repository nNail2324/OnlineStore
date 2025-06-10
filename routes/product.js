const { Router } = require("express");
const db = require("../db");
const router = Router();

// Получение товаров по ID подкатегории с атрибутами и изображениями
router.get("/subcategory/:subcategoryId", async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        
        // 1. Получаем основные данные о товарах
        const [products] = await db.query(`
            SELECT p.*, s.unit 
            FROM product p
            JOIN subcategory s ON p.subcategory_id = s.ID
            WHERE p.subcategory_id = ?
        `, [subcategoryId]);

        if (products.length === 0) return res.json([]);
        
        // 2. Получаем все атрибуты для этих товаров
        const productIds = products.map(p => p.ID);
        const [attributes] = await db.query(`
            SELECT product_id, attribute_name as name, attribute_value as value 
            FROM product_attributes 
            WHERE product_id IN (?)
        `, [productIds]);
        
        // 3. Получаем все изображения для этих товаров
        const [images] = await db.query(`
            SELECT product_id, path as url 
            FROM product_images 
            WHERE product_id IN (?)
        `, [productIds]);
        
        // 4. Группируем данные
        const attributesMap = attributes.reduce((acc, attr) => {
            if (!acc[attr.product_id]) acc[attr.product_id] = [];
            acc[attr.product_id].push({ name: attr.name, value: attr.value });
            return acc;
        }, {});
        
        const imagesMap = images.reduce((acc, img) => {
            if (!acc[img.product_id]) acc[img.product_id] = [];
            acc[img.product_id].push(img.url);
            return acc;
        }, {});
        
        // 5. Формируем результат
        const result = products.map(product => ({
            ...product,
            attributes: attributesMap[product.ID] || [],
            images: imagesMap[product.ID] || []
        }));
        
        res.json(result);
    } catch (err) {
        console.error("Ошибка при получении товаров:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение полной информации о товаре по ID (для карточки товара)
router.get("/card/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Получаем товар с unit из подкатегории
        const [productRows] = await db.query(`
            SELECT p.*, s.unit 
            FROM product p
            JOIN subcategory s ON p.subcategory_id = s.ID
            WHERE p.ID = ?
        `, [productId]);

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

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        await connection.query("DELETE FROM feedback WHERE product_id = ?", [id]);
        await connection.query("DELETE FROM product_attributes WHERE product_id = ?", [id]);
        await connection.query("DELETE FROM product_images WHERE product_id = ?", [id]);
        
        const [result] = await connection.query("DELETE FROM product WHERE ID = ?", [id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Товар не найден" });
        }

        await connection.commit();
        res.json({ success: true });

    } catch (err) {
        await connection.rollback();
        console.error("Ошибка при удалении товара:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    } finally {
        connection.release();
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

router.get("/search", async (req, res) => {
    const { q } = req.query;

    if (!q) return res.json([]);

    const words = q.trim().split(/\s+/);

    const likeConditions = words.map(() =>
        `(p.name LIKE ? OR p.description LIKE ? OR s.name LIKE ? OR pa.attribute_value LIKE ? OR pa.attribute_name LIKE ?)`
    ).join(' AND ');

    const likeValues = words.flatMap(word =>
        Array(5).fill(`%${word}%`)
    );

    try {
        const [rows] = await db.query(`
            SELECT p.*, s.unit
            FROM product p
            JOIN subcategory s ON p.subcategory_id = s.ID
            LEFT JOIN product_attributes pa ON pa.product_id = p.ID
            WHERE ${likeConditions}
            GROUP BY p.ID
        `, likeValues);

        res.json(rows);
    } catch (err) {
        console.error("Ошибка при поиске товаров:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.get("/suggest", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const words = q.trim().split(/\s+/);
    const likeConditions = words.map(() =>
        `(p.name LIKE ? OR s.name LIKE ?)`
    ).join(" AND ");
    const likeValues = words.flatMap((w) => [`%${w}%`, `%${w}%`]);

    try {
        const [rows] = await db.query(`
            SELECT p.ID, p.name
            FROM product p
            JOIN subcategory s ON s.ID = p.subcategory_id
            WHERE ${likeConditions}
            LIMIT 7
        `, likeValues);

        res.json(rows);
    } catch (err) {
        console.error("Ошибка при подсказках:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение изображений товара по ID
router.get("/images/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const [rows] = await db.query(
        "SELECT path FROM product_images WHERE product_id = ?",
        [productId]
      );
      res.json(rows);
    } catch (err) {
      console.error("Ошибка при получении изображений:", err);
      res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.post("/create", async (req, res) => {
    const { subcategory_id, name, price, description, stock, attributes, images } = req.body;

    if (!subcategory_id || !name || price === undefined || stock === undefined) {
        return res.status(400).json({ message: "Обязательные поля не заполнены" });
    }

    const connection = await db.getConnection(); // Для транзакции

    try {
        await connection.beginTransaction();

        // 1. Создание товара
        const [result] = await connection.query(
            `INSERT INTO product (subcategory_id, name, price, description, stock)
             VALUES (?, ?, ?, ?, ?)`,
            [subcategory_id, name, price, description || "", stock]
        );
        const productId = result.insertId;

        // 2. Добавление атрибутов
        if (attributes && Array.isArray(attributes)) {
            for (const attr of attributes) {
                await connection.query(
                    `INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
                     VALUES (?, ?, ?)`,
                    [productId, attr.name, attr.value]
                );
            }
        }

        // 3. Добавление изображений
        if (images && Array.isArray(images)) {
            for (const imgPath of images) {
                await connection.query(
                    `INSERT INTO product_images (product_id, path)
                     VALUES (?, ?)`,
                    [productId, imgPath]
                );
            }
        }

        await connection.commit();
        res.json({ success: true, productId });

    } catch (err) {
        await connection.rollback();
        console.error("Ошибка при создании товара:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    } finally {
        connection.release();
    }
});

router.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { name, price, description, stock, attributes, images } = req.body;

    if (!name || price === undefined || stock === undefined) {
        return res.status(400).json({ message: "Обязательные поля не заполнены" });
    }

    const connection = await db.getConnection(); // Используем транзакцию

    try {
        await connection.beginTransaction();

        // 1. Обновление основной информации о товаре
        await connection.query(
            `UPDATE product SET name = ?, price = ?, description = ?, stock = ? WHERE ID = ?`,
            [name, price, description || "", stock, id]
        );

        // 2. Удаление старых атрибутов
        await connection.query(`DELETE FROM product_attributes WHERE product_id = ?`, [id]);

        // 3. Добавление новых атрибутов
        if (Array.isArray(attributes)) {
            for (const attr of attributes) {
                await connection.query(
                    `INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
                     VALUES (?, ?, ?)`,
                    [id, attr.name, attr.value]
                );
            }
        }

        // 4. Удаление старых изображений
        await connection.query(`DELETE FROM product_images WHERE product_id = ?`, [id]);

        // 5. Добавление новых изображений
        if (Array.isArray(images)) {
            for (const img of images) {
                await connection.query(
                    `INSERT INTO product_images (product_id, path)
                     VALUES (?, ?)`,
                    [id, img]
                );
            }
        }

        await connection.commit();
        res.json({ success: true });

    } catch (err) {
        await connection.rollback();
        console.error("Ошибка при обновлении товара:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    } finally {
        connection.release();
    }
});

module.exports = router;