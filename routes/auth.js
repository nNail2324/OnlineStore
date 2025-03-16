const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const router = Router();

// Регистрация
router.post("/register", async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    console.log("Запрос на регистрацию:", phone_number, password);

    const candidate = await User.findByNumber(phone_number);
    console.log("Проверка пользователя:", candidate);

    if (candidate) {
      console.log("Пользователь уже существует");
      return res.status(400).json({ message: "Такой пользователь уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await User.create(phone_number, hashedPassword);
    console.log("Пользователь создан с ID:", userId);

    const token = jwt.sign(
      { userId },
      config.get("jwtToken"),
      { expiresIn: "1h" }
    );

    res.status(201).json({ token, userId });
  } catch (e) {
    console.error("Ошибка на сервере при регистрации:", e.message);
    res.status(500).json({ message: "Ошибка сервера. Попробуйте снова." });
  }
});

// Вход
router.post(
  "/login",
  async (req, res) => {
    try {
      const { phone_number, password } = req.body;
      console.log("Запрос на вход:", phone_number);

      const user = await User.findByNumber(phone_number);
      console.log("Найденный пользователь:", user);

      if (!user) {
        console.log("Пользователь не найден");
        return res.status(400).json({ message: "Пользователь не найден" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Совпадение пароля:", isMatch);

      if (!isMatch) {
        console.log("Неверный пароль");
        return res.status(400).json({ message: "Неверный пароль" });
      }

      const token = jwt.sign(
        { userId: user.id },
        config.get("jwtToken"),
        { expiresIn: "1h" }
      );

      res.json({ token, userId: user.id });
    } catch (e) {
      console.error("Ошибка на сервере:", e.message);
      res.status(500).json({ message: "Ошибка сервера. Попробуйте снова." });
    }
  }
);


module.exports = router;
