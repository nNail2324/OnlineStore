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

    const candidate = await User.findByNumber(phone_number);
    if (candidate) {
      return res.status(400).json({ message: "Такой пользователь уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await User.create(phone_number, hashedPassword);

    // Получим нового пользователя для role
    const newUser = await User.findByNumber(phone_number);

    const token = jwt.sign(
      { userId: newUser.ID },
      config.get("jwtToken"),
      { expiresIn: "1h" }
    );

    console.log("Пользователь успешно создан и залогинен с ID:", newUser.ID);

    res.status(201).json({ token, userId: newUser.ID, role: newUser.role });
  } catch (e) {
    console.error("Ошибка на сервере при регистрации:", e);
    res.status(500).json({ message: "Ошибка сервера. Попробуйте снова." });
  }
});


// Вход
router.post("/login", async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Ошибка валидации",
          errors: errors.array(),
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
        { userId: user.ID },
        config.get("jwtToken"),
        { expiresIn: "1h" }
      );

      console.log("Логин успешен! userId:", user.ID);
      res.json({ token, userId: user.ID, role: user.role });
    } catch (e) {
      console.error("Ошибка на сервере:", e);
      res.status(500).json({ message: "Ошибка сервера. Попробуйте снова." });
    }
  }
);

module.exports = router;