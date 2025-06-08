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
        const titlePath = path.join(__dirname, "../client/src/font/Inter-Bold.otf");

        doc.pipe(writeStream);
        doc.registerFont("Inter-Medium", fontPath);
        doc.registerFont("Inter-Bold", titlePath);
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
        doc.moveDown(3);

        doc.font("Inter-Bold").fontSize(20).text(`Накладная №${orderId}`, { align: "center" });
        doc.moveDown(1);
        doc.font("Inter-Medium");

        // Таблица товаров
        const tableMargin = doc.page.margins.left;
        const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const colWidths = [30, tableWidth - 330, 50, 50, 60, 80];
        const headerHeight = 20;
        const rowHeight = 20;

        // Заголовки таблицы
        const headers = ["№", "Наименование", "Ед. изм.", "Кол-во", "Цена", "Сумма"];
        const tableTop = doc.y;
        
        // Рисуем верхнюю границу таблицы
        doc.moveTo(tableMargin, tableTop).lineTo(tableMargin + tableWidth, tableTop).stroke();
        
        // Заполняем заголовки
        headers.forEach((header, i) => {
            doc.text(header, 
                tableMargin + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + (colWidths[i]/2),
                tableTop + (headerHeight - 12)/2, // Центрирование по вертикали
                { 
                    width: colWidths[i], 
                    align: "center",
                    lineBreak: false 
                }
            );
            
            // Вертикальные линии между колонками
            if (i < headers.length - 1) {
                const xPos = tableMargin + colWidths.slice(0, i+1).reduce((a, b) => a + b, 0);
                doc.moveTo(xPos, tableTop).lineTo(xPos, tableTop + headerHeight).stroke();
            }
        });

        // Нижняя граница заголовков
        doc.moveTo(tableMargin, tableTop + headerHeight)
           .lineTo(tableMargin + tableWidth, tableTop + headerHeight)
           .stroke();

        // Строки таблицы
        let currentY = tableTop + headerHeight;
        items.forEach((item, idx) => {
            const row = [
                `${idx + 1}`,
                item.name,
                item.unit,
                `${item.quantity}`,
                `${item.price.toLocaleString("ru-RU")} ₽`,
                `${(item.quantity * item.price).toLocaleString("ru-RU")} ₽`
            ];
            
            // Заполняем данные
            row.forEach((text, i) => {
                const textOptions = {
                    width: colWidths[i] - 10,
                    align: i === 1 ? "left" : "center",
                    lineBreak: i === 1
                };
                
                const xPos = tableMargin + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 
                            (i === 1 ? 5 : colWidths[i]/2 - doc.widthOfString(text, textOptions)/2);
                
                doc.text(text, 
                    xPos,
                    currentY + (rowHeight - 12)/2, // Центрирование по вертикали
                    textOptions
                );
                
                // Вертикальные линии между колонками
                if (i < row.length - 1) {
                    const lineX = tableMargin + colWidths.slice(0, i+1).reduce((a, b) => a + b, 0);
                    doc.moveTo(lineX, currentY).lineTo(lineX, currentY + rowHeight).stroke();
                }
            });
            
            // Горизонтальная линия между строками
            doc.moveTo(tableMargin, currentY + rowHeight)
               .lineTo(tableMargin + tableWidth, currentY + rowHeight)
               .stroke();
            
            currentY += rowHeight;
        });

        // Нижняя граница таблицы
        doc.moveTo(tableMargin, currentY).lineTo(tableMargin + tableWidth, currentY).stroke();
        doc.y = currentY + 15;

        // Итоговая информация
        doc.fontSize(12);
        
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
        doc.y += 15;
        doc.text(`Итого: ${order.total_price.toLocaleString("ru-RU")} ₽`, 
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
            const filename = `Накладная №${orderId}.pdf`;
            res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);

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
