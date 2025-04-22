const { Router } = require("express");
const db = require("../db");
const router = Router();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

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

router.patch("/:orderId/cancel", async (req, res) => {
    try {
        const { orderId } = req.params;

        const [check] = await db.query("SELECT status FROM orders WHERE ID = ?", [orderId]);
        if (!check.length) return res.status(404).json({ message: "Заказ не найден" });

        const currentStatus = check[0].status;
        if (currentStatus === "Отменён" || currentStatus === "Доставлен") {
            return res.status(400).json({ message: "Нельзя отменить этот заказ" });
        }

        await db.query("UPDATE orders SET status = 'Отменён' WHERE ID = ?", [orderId]);
        res.json({ status: "Отменён" });
    } catch (err) {
        console.error("Ошибка при отмене заказа:", err);
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

router.get("/:orderId/invoices", async (req, res) => {
    try {
        const { orderId } = req.params;

        if (isNaN(orderId)) {
            return res.status(400).json({ message: "Некорректный ID заказа" });
        }

        const [orderInfo] = await db.query("SELECT * FROM orders WHERE ID = ?", [orderId]);
        const [items] = await db.query(`
            SELECT oi.product_id, oi.quantity, oi.price, p.name, s.unit
            FROM order_items oi
            JOIN product p ON oi.product_id = p.ID
            JOIN subcategory s ON p.subcategory_id = s.ID
            WHERE oi.order_id = ?`, [orderId]);

        if (orderInfo.length === 0) {
            return res.status(404).json({ message: "Заказ не найден" });
        }

        const invoiceDir = path.join(process.cwd(), "invoices");
        if (!fs.existsSync(invoiceDir)) {
            fs.mkdirSync(invoiceDir, { recursive: true });
        }

        const invoicePath = path.join(invoiceDir, `invoice-${orderId}.pdf`);
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(invoicePath);
        const fontPath = path.join(__dirname, "../client/src/font/Inter-Medium.otf");

        doc.pipe(writeStream);
        doc.registerFont("Inter-Medium", fontPath);
        doc.font("Inter-Medium");

        doc.fontSize(20).text(`Накладная для заказа №${orderId}`, { align: "center" }).moveDown();

        items.forEach((item, idx) => {
            doc
                .fontSize(12)
                .text(`${idx + 1}. ${item.name} — ${item.quantity} ${item.unit} по ${item.price} ₽`);
        });

        doc.moveDown();
        doc.text(`Итого: ${orderInfo[0].total_price} ₽`, { align: "right" });
        doc.text(`Статус: ${orderInfo[0].status}`, { align: "right" });

        doc.end();

        writeStream.on("finish", () => {
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=invoice-${orderId}.pdf`);

            res.sendFile(invoicePath, (err) => {
                if (err) {
                    console.error("Ошибка при отправке PDF:", err);
                } else {
                    fs.unlink(invoicePath, (err) => {
                        if (err) console.error("Не удалось удалить файл:", err);
                    });
                }
            });
        });

        writeStream.on("error", (err) => {
            console.error("Ошибка записи PDF:", err);
            res.status(500).json({ message: "Ошибка при генерации PDF" });
        });

    } catch (err) {
        console.error("Ошибка генерации накладной:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


module.exports = router;
