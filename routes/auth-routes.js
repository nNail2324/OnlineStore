const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const router = Router();

router.post(
    "/register",
    [
        check("phone_number", "Некорректный номер телефона").isMobilePhone(),
        check("password", "Минимальная длина пароля 8 символов").isLength({ min: 8 }),
    ],
    async (req, res) => {
        try {
            console.log("Body", req.body);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log("Validation errors:", errors.array());
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Некорректные данные при регистрации",
                });
            }

            const { phone_number, password, name, surname, city, street, house_number } = req.body;

            const candidate = await User.findByNumber(phone_number);
            console.log("Проверка существующего пользователя:", candidate);

            if (candidate) {
                console.log("Ошибка: Такой пользователь уже существует");
                return res.status(400).json({ message: "Такой пользователь уже существует" });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            await User.create(phone_number, hashedPassword, name, surname, city, street, house_number);
            console.log("Пользователь успешно добавлен!");

            return res.status(201).json({ message: "Пользователь зарегистрирован" });
        } catch (error) {
            console.error("Ошибка регистрации:", error);
            return res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
        }
    }
);

router.post(
    "/login",
    [
        check("phone_number", "Некорректный номер телефона").isMobilePhone(),
        check("password", "Минимальная длина пароля 8 символов").isLength({ min: 8 }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Некорректные данные при входе в систему",
                });
            }

            const { phone_number, password } = req.body;

            const user = await User.findByNumber(phone_number);

            if (!user) {
                return res.status(400).json({ message: "Пользователь не найден" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Неверный пароль" });
            }

            const token = jwt.sign(
                { userId: user.id }, 
                config.get("jwtSecret"), 
                { expiresIn: "1h" });

            res.json({ token, userId: user.id });
        } catch (error) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
        }
    }
);

module.exports = router;
