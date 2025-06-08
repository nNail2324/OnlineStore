const { Router } = require("express");
const db = require("../db");
const router = Router();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

router.get("/", async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.ID, o.user_id, o.total_price, o.delivery_method, o.delivery_price, o.status, o.created_at, u.name, u.surname, u.phone_number
            FROM orders o
            JOIN users u ON o.user_id = u.ID
            ORDER BY o.created_at DESC
        `);

        res.json(orders);
    } catch (err) {
        console.error("Ошибка при получении заказов:", err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.post("/create", async (req, res) => {
    try {
        const { user_id, delivery_method } = req.body;

        // Получаем корзину пользователя
        const [cartItems] = await db.query(`
            SELECT c.product_id, c.quantity, p.price
            FROM cart c
            JOIN product p ON c.product_id = p.ID
            WHERE c.user_id = ?
        `, [user_id]);

        if (cartItems.length === 0) {
            return res.status(400).json({ message: "Корзина пуста" });
        }

        // Получаем профиль пользователя и название города
        const [userProfileRows] = await db.query(`
            SELECT u.name, u.surname, u.phone_number, u.street, u.house_number, l.name AS city_name, l.delivery_price
            FROM users u
            LEFT JOIN location_and_delivery l ON u.city = l.ID
            WHERE u.ID = ?
        `, [user_id]);

        if (userProfileRows.length === 0) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const userProfile = userProfileRows[0];

        if (!userProfile.city_name) {
            return res.status(400).json({ message: "Город пользователя не задан" });
        }

        // Формируем итоговую стоимость
        const total_price = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const delivery_price = delivery_method === "courier" ? userProfile.delivery_price : 0;
        const final_price = total_price + delivery_price;

        // Формируем полный адрес
        const delivery_address = `${userProfile.city_name}, ${userProfile.street}, дом ${userProfile.house_number}`;

        // Создаем заказ
        const [orderResult] = await db.query(`
            INSERT INTO orders 
            (user_id, total_price, delivery_method, delivery_price, status, contact_name, contact_phone, delivery_address) 
            VALUES (?, ?, ?, ?, 'В обработке', ?, ?, ?)
        `, [
            user_id,
            final_price,
            delivery_method,
            delivery_price,
            `${userProfile.name} ${userProfile.surname}`,
            userProfile.phone_number,
            delivery_address
        ]);

        const orderId = orderResult.insertId;

        // Переносим товары из корзины в order_items
        for (const item of cartItems) {
            await db.query(`
                INSERT INTO order_items (order_id, product_id, quantity, price) 
                VALUES (?, ?, ?, ?)
            `, [orderId, item.product_id, item.quantity, item.price]);
        }

        // Очищаем корзину
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

router.patch("/:orderId/status", async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;  // Новый статус, передаваемый в теле запроса

        const [check] = await db.query("SELECT status FROM orders WHERE ID = ?", [orderId]);
        if (!check.length) return res.status(404).json({ message: "Заказ не найден" });

        const currentStatus = check[0].status;
        if (currentStatus === "Отменён") {
            return res.status(400).json({ message: "Невозможно изменить статус этого заказа" });
        }

        // Обновление статуса заказа
        await db.query("UPDATE orders SET status = ? WHERE ID = ?", [status, orderId]);
        res.json({ status });
    } catch (err) {
        console.error("Ошибка при изменении статуса:", err);
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

        const order = orderInfo[0];
        const invoiceDir = path.join(process.cwd(), "invoices");
        if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

        const invoicePath = path.join(invoiceDir, `Накладная №${orderId}.pdf`);
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(invoicePath);
        const fontPath = path.join(__dirname, "../client/src/font/Inter-Medium.otf");
        const titlePath = path.join(__dirname, "../client/src/font/Inter-Bold.otf")

        doc.pipe(writeStream);
        doc.registerFont("Inter-Medium", fontPath);
        doc.registerFont("Inter-Bold", titlePath)
        doc.font("Inter-Medium");

        // Заголовок и дата
        doc.fontSize(10).text(`${new Date(order.created_at).toLocaleDateString("ru-RU")}`, { align: "right" });
        doc.moveDown(1);

        // От кого и Кому
        doc.fontSize(10);
        doc.text("От кого: ", { continued: true });
        doc.text("ИП Шарипов Ирек Фларитович", { underline: true, continued: false });

        doc.text("Кому: ", { continued: true });
        doc.text(order.contact_name, { underline: true, continued: false });
        doc.moveDown(3); // Уменьшен отступ

        doc.font("Inter-Bold").fontSize(20).text(`Накладная №${orderId}`, { align: "center" }); // Уменьшен размер шрифта
        doc.moveDown(1);

        // Таблица товаров (на всю ширину с учетом margin)
        const tableMargin = doc.page.margins.left;
        const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const colWidths = [30, tableWidth - 330, 50, 50, 60, 80]; // Подобраны пропорционально

        // Рисуем границы таблицы
        const drawTableBorders = (yStart, yEnd) => {
            const lineY = yStart - 10;
            const lineHeight = yEnd - yStart + 25;
            
            // Внешние границы
            doc.rect(tableMargin, lineY, tableWidth, lineHeight).stroke();
            
            // Горизонтальные линии
            doc.moveTo(tableMargin, lineY + 20).lineTo(tableMargin + tableWidth, lineY + 20).stroke();
            
            // Вертикальные линии между колонками
            let xPos = tableMargin;
            for (let i = 0; i < colWidths.length - 1; i++) {
                xPos += colWidths[i];
                doc.moveTo(xPos, lineY).lineTo(xPos, lineY + lineHeight).stroke();
            }
        };

        const tableTop = doc.y;
        
       // Заголовки таблицы
        doc.fontSize(12);
        const headers = ["№", "Наименование", "Ед. изм.", "Кол-во", "Цена", "Сумма"];
        headers.forEach((header, i) => {
            doc.text(header, 
                tableMargin + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 2, // +2 небольшой отступ от границы
                tableTop + 5, // +5 для вертикального выравнивания
                { 
                    width: colWidths[i] - 4, // Уменьшаем ширину на 4 для отступов
                    align: "center",
                    lineBreak: false 
                }
            );
        });

        // Строки таблицы
        let itemY = tableTop + 20;
        items.forEach((item, idx) => {
            const row = [
                `${idx + 1}`,
                item.name,
                item.unit,
                `${item.quantity}`,
                `${item.price.toLocaleString("ru-RU")} ₽`,
                `${(item.quantity * item.price).toLocaleString("ru-RU")} ₽`
            ];
            
            row.forEach((text, i) => {
                const options = {
                    width: colWidths[i] - 10,
                    align: i === 1 ? "left" : "center",
                    lineBreak: i === 1
                };
                
                // Точный расчет позиции для каждого элемента
                const xPos = tableMargin + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + (i === 1 ? 5 : colWidths[i]/2 - doc.widthOfString(text, options)/2);
                const yPos = itemY + 5; // +5 для вертикального выравнивания
                
                doc.text(text, xPos, yPos, options);
            });
            itemY += 20;
        });

        // Рисуем границы таблицы
        drawTableBorders(tableTop, itemY - 20);
        doc.y = itemY + 10;

        // Итоговая информация
        const lineHeight = 2;
        
        // 1. Стоимость доставки
        doc.text(`Стоимость доставки: ${order.delivery_price.toLocaleString("ru-RU")} ₽`, 
            tableMargin, 
            doc.y, 
            { 
                width: tableWidth,
                align: 'left',
                lineBreak: false
            }
        );
        
        // 2. Итого
        doc.y += lineHeight;
        doc.fontSize(12).text(`Итого: ${order.total_price.toLocaleString("ru-RU")} ₽`, 
            tableMargin, 
            doc.y, 
            { 
                width: tableWidth,
                align: 'left',
                lineBreak: false
            }
        );

        doc.end();

        writeStream.on("finish", () => {
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=invoice-${orderId}.pdf`);

            res.sendFile(invoicePath, (err) => {
                if (err) console.error("Ошибка при отправке PDF:", err);
                else fs.unlink(invoicePath, (err) => {
                    if (err) console.error("Не удалось удалить файл:", err);
                });
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
