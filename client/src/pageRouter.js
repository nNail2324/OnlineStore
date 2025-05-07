import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import Profile from "./components/Profile";
import MainPage from "./components/MainPage";
import Category from "./components/Category";
import Subcategory from "./components/Subcategory";
import ProductCard from "./components/ProductCard";
import Basket from "./components/Basket";
import Favorite from "./components/Favorite";
import AuthPage from "./components/AuthPage";
import Order from "./components/Order"
import Search from "./components/Search"

import AdminCategory from "./components/AdminCategory";
import AdminSubcategory from "./components/AdminSubcategory";
import AdminMainPage from "./components/AdminMainPage";
import AdminProductCard from "./components/AdminProductCard"
import AdminUsers from "./components/AdminUsers";
import AdminProfile from "./components/AdminProfile";
import AdminOrder from "./components/AdminOrder";
import AdminRequest from "./components/AdminRequest";
import AdminSearch from "./components/AdminSearch";

export const useRoutes = (isAuthenticated, role) => {
    if (isAuthenticated && role === "user" ) {
        return (
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/basket" element={<Basket />} />
                <Route path="/favorite" element={<Favorite />} />
                <Route path="/category/:image" element={<Category />} />
                <Route path="/subcategory/:id" element={<Subcategory />} />
                <Route path="/product/:id" element={<ProductCard />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/order/:orderId" element={<Order />} />
                <Route path="/search" element={<Search />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        );
    }
    
    if (isAuthenticated && role === "admin") {
        return (
            <Routes>
                <Route path="/" element={<AdminMainPage />} />
                <Route path="/category/:image" element={<AdminCategory />} />
                <Route path="/subcategory/:id" element={<AdminSubcategory />} />
                <Route path="/product/:id" element={<AdminProductCard />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/users" element={<AdminUsers/>} />
                <Route path="/requests" element={<AdminRequest/>} />
                <Route path="/profile/:profile_id" element={<AdminProfile />} />
                <Route path="/order/:orderId" element={<AdminOrder />} />
                <Route path="/search" element={<AdminSearch />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/category/:image" element={<Category />} />
            <Route path="/subcategory/:id" element={<Subcategory />} />
            <Route path="/product/:id" element={<ProductCard />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/search" element={<Search />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};
