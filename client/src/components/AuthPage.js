import React, { useState, useContext } from "react";
import { useHttp } from "../hooks/http";
import { AuthContext } from "../context/auth-context";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { loading, request } = useHttp();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [form, setForm] = useState({
    phone_number: "",  // Начальное значение пустое
    password: "",
    confirm_password: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    phone_number: "",
    password: "",
    confirm_password: "",
  });
  const [generalError, setGeneralError] = useState("");

  // Валидация формы
  const validateForm = () => {
    const errors = {};

    if (!form.phone_number.match(/^\+7\d{10}$/)) {
      errors.phone_number = "Некорректный номер телефона";
    }

    if (form.password.length < 8) {
      errors.password = "Пароль должен содержать минимум 8 символов";
    }

    if (!isLoginMode && form.password !== form.confirm_password) {
      errors.confirm_password = "Пароли не совпадают";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Обработка входа/регистрации
  const authHandler = async () => {
    setValidationErrors({
      phone_number: "",
      password: "",
      confirm_password: "",
    });
    setGeneralError("");

    if (!validateForm()) {
      return;
    }

    try {
      const endpoint = isLoginMode
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";
      const data = await request(endpoint, "POST", { ...form });
      console.log("Ответ от сервера:", data);

      if (data.message) {
        setGeneralError(data.message);
        return;
      }

      auth.login(data.token, data.userId, data.role);
      navigate("/");  // Переход на главную страницу
    } catch (e) {
      setGeneralError(e.message || "Ошибка сервера. Попробуйте снова.");
    }
  };

  // Переключение между режимами "Вход" и "Регистрация"
  const switchModeHandler = () => {
    setIsLoginMode((prevMode) => !prevMode);
    setForm({
      phone_number: "",  // Начальное значение пустое
      password: "",
      confirm_password: "",
    });
    setValidationErrors({
      phone_number: "",
      password: "",
      confirm_password: "",
    });
    setGeneralError("");
  };

  // Обработка ввода с проверкой префикса +7
  const changeHandler = (event) => {
    const { name, value } = event.target;

    // Если это поле телефона и пытаются удалить "+7", возвращаем старое значение
    if (name === "phone_number" && !value.startsWith("+7")) {
        return;
    }

    setForm({ ...form, [name]: value });
  };

  // Добавляем префикс +7 при фокусе
  const handleFocus = () => {
    if (form.phone_number === "") {
        setForm({ ...form, phone_number: "+7" });
    }
  };

// Убираем префикс +7 при потере фокуса, если он единственный
const handleBlur = () => {
  if (form.phone_number === "+7") {
      setForm({ ...form, phone_number: "" });
  }
};

  return (
    <div className="body-page">
      <div className="authentication">
        <div className="name">
          <label>{isLoginMode ? "Вход" : "Регистрация"}</label>
        </div>
        {generalError && <div className="general-error">{generalError}</div>}
        <form className="form-authentication">
          <label htmlFor="phone_number">Номер телефона</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            placeholder="+7XXX-XXX-XX-XX"
            value={form.phone_number}
            onFocus={handleFocus}
            onBlur={handleBlur}  
            onChange={changeHandler}
          />
          <div className="error-message">{validationErrors.phone_number}</div>

          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Минимум 8 символов"
            value={form.password}
            onChange={changeHandler}
          />
          <div className="error-message">{validationErrors.password}</div>

          {!isLoginMode && (
            <>
              <label htmlFor="confirm_password">Повторите пароль</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                placeholder="Пароли должны совпадать"
                value={form.confirm_password}
                onChange={changeHandler}
              />
              <div className="error-message">
                {validationErrors.confirm_password}
              </div>
            </>
          )}

          <div className="auth-button">
            <button type="button" disabled={loading} onClick={authHandler}>
              {isLoginMode ? "Войти" : "Зарегистрироваться"}
            </button>
          </div>
        </form>

        <div className="center-row">
          <div className="auth-label">
            <label onClick={switchModeHandler}>
              {isLoginMode ? "Зарегистрироваться" : "Войти"}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;