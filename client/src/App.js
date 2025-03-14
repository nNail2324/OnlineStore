import React, { useState, useCallback } from "react";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useRoutes } from "./routes";
import { AuthContext } from "./context/auth-context";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  const login = useCallback((token, userId) => {
    setIsAuthenticated(true);
    setUserId(userId);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserId(null);
  }, []);

  const routes = useRoutes(isAuthenticated);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      <BrowserRouter>
        <Header isAuthenticated={isAuthenticated} />
        <div>{routes}</div>
        <Footer />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;