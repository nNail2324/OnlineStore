import React, { useState, useCallback, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import AdminHeader from "./components/AdminHeader";
import Footer from "./components/Footer";
import { useRoutes } from "./pageRouter";
import { AuthContext } from "./context/auth-context";

import { NotificationProvider } from "./context/notification-context";
import Notification from "./components/Notification";
import NotificationWrapper from "./components/NotificationWrapper";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState("user");
  const [cart, setCart] = useState([]); 

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
  const login = useCallback((token, userId, role) => {
    setIsAuthenticated(true);
    setUserId(userId);
    setRole(role);
    localStorage.setItem("userId", userId);
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  
    fetchCart(userId); 
  }, []);
  
  // Логаут с очисткой токена и корзины
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserId(null);
    setRole("user"); // или null, как ты хочешь
    setCart([]);
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }, []);

  // Восстановление авторизации при загрузке приложения
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role"); 
  
    if (storedUserId && storedToken) {
      const numericUserId = parseInt(storedUserId, 10);
      setIsAuthenticated(true);
      setUserId(numericUserId);
      setRole(storedRole); 
      fetchCart(numericUserId);
    }
  }, []);
  
  const routes = useRoutes(isAuthenticated, role);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout, cart, setCart, role }}>
      <NotificationProvider>
        <BrowserRouter>
          {role === "user" ? <Header /> : <AdminHeader />}
          <div>{routes}</div>
          {role === "user" && <Footer />}
          <NotificationWrapper />
        </BrowserRouter>
      </NotificationProvider>
    </AuthContext.Provider>
  );
};

export default App;
