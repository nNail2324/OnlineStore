import React, { useState, useContext } from "react";
import { useHttp } from "../hooks/http";
import { AuthContext } from "../context/auth-context";

const AuthPage = () => {
  const auth = useContext(AuthContext);
  const { loading, request, error, clearError } = useHttp();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [form, setForm] = useState({
    phone_number: "",
    password: "",
    confirm_password: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    phone_number: "",
    password: "",
    confirm_password: "",
  });
  const [generalError, setGeneralError] = useState("");

  const changeHandler = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

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
        const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/register";
        const data = await request(`http://localhost:5000${endpoint}`, "POST", { ...form });

        if (isLoginMode) {
            auth.login(data.token, data.userId);
        } else {
            console.log("Регистрация успешна:", data.message);
        }
    } catch (e) {
        console.error("Ошибка с сервера:", e);

        if (e.errors) {
            const errors = {};
            e.errors.forEach((err) => {
                errors[err.param] = err.msg;
            });
            setValidationErrors(errors);
        }

        if (e.message) {
            console.log("Ошибка для отображения:", e.message);
            setGeneralError(e.message); // Должно обновлять generalError
        }
    }
};


  const switchModeHandler = () => {
    setIsLoginMode((prevMode) => !prevMode);
    setForm({
      phone_number: "",
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

  return (
    <div className="body-page">
      <div className="authentication">
        <div className="name">
          <label>{isLoginMode ? "Вход" : "Регистрация"}</label>
        </div>
        <div className="general-error">{generalError}</div>
        <form className="form-authentication">
          <label htmlFor="phone_number">Номер телефона</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            placeholder="+7XXX-XXX-XX-XX"
            value={form.phone_number}
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
              <div className="error-message">{validationErrors.confirm_password}</div>
            </>
          )}

          <div className="auth-button">
            <button
              type="button"
              disabled={loading}
              onClick={authHandler}
            >
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