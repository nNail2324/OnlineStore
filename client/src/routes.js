import React from "react"
import { Route, Routes, Navigate } from "react-router-dom"
import Profile from "./components/Profile"
import MainPage from "./components/MainPage"
import Login from "./components/Login"
import SignUp from "./components/SignUp"
import Category from "./components/Category"
import Basket from "./components/Basket"
import Favorite from "./components/Favorite"

export const useRoutes = (isAuthenticated) => {
    if (isAuthenticated) {
        return (
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/basket" element={<Basket />} />
                <Route path="/favorite" element={<Favorite />} />
                <Route path="/category" element={<Category />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        )
    }
    return (
        <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/category" element={<Category />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}
