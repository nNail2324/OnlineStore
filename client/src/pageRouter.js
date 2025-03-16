import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Profile from "./components/Profile";
import MainPage from "./components/MainPage";
import Category from "./components/Category";
import Basket from "./components/Basket";
import Favorite from "./components/Favorite";
import AuthPage from "./components/AuthPage";

export const useRoutes = (isAuthenticated) => {
    if (isAuthenticated) {
        return (
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/basket" element={<Basket />} />
                <Route path="/favorite" element={<Favorite />} />
                <Route path="/category/:image" element={<Category />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        );
    }
    return (
        <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/category/:image" element={<Category />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};
