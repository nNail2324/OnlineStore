import React, { useState, useCallback, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useRoutes } from "./pageRouter";
import { AuthContext } from "./context/auth-context";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  // Логин с сохранением токена
  const login = useCallback((token, userId) => {
    setIsAuthenticated(true);
    setUserId(userId);
    localStorage.setItem("userId", userId);
    localStorage.setItem("token", token);
  }, []);

  // Логаут с очисткой токена
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserId(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
  }, []);

  // Восстановление авторизации при загрузке приложения
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("token");
  
    if (storedUserId && storedToken) {
      setIsAuthenticated(true);  // Добавляем принудительное обновление состояния
      setUserId(storedUserId);
    }
  }, []);

  const routes = useRoutes(isAuthenticated);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      <BrowserRouter>
        <Header />
        <div>{routes}</div>
        <Footer />
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App;
