import React, { useState, useCallback, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useRoutes } from "./pageRouter";
import { AuthContext } from "./context/auth-context";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [cart, setCart] = useState([]); // ✅ Добавляем состояние корзины

  // Функция загрузки корзины
  const fetchCart = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${userId}`);
      if (!response.ok) throw new Error("Ошибка при загрузке корзины");
      const data = await response.json();
      setCart(data);
      console.log("Корзина загружена:", data);
    } catch (error) {
      console.error("Ошибка при получении корзины:", error);
    }
  };

  // Логин с сохранением токена и загрузкой корзины
  const login = useCallback((token, userId) => {
    setIsAuthenticated(true);
    setUserId(userId);
    localStorage.setItem("userId", userId);
    localStorage.setItem("token", token);
    
    fetchCart(userId); // ✅ Загружаем корзину при входе
  }, []);

  // Логаут с очисткой токена и корзины
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserId(null);
    setCart([]); // ✅ Очищаем корзину при выходе
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
  }, []);

  // Восстановление авторизации при загрузке приложения
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("token");

    console.log("Загружаем userId из localStorage:", storedUserId);
    console.log("Загружаем token из localStorage:", storedToken);

    if (storedUserId && storedToken) {
      const numericUserId = parseInt(storedUserId, 10); // ✅ Преобразуем в число
      setIsAuthenticated(true);
      setUserId(numericUserId);
      fetchCart(numericUserId); // ✅ Загружаем корзину
    }
  }, []);

  const routes = useRoutes(isAuthenticated);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout, cart, setCart }}>
      <BrowserRouter>
        <Header />
        <div>{routes}</div>
        <Footer />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
