import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/auth-context";
import { NotificationContext } from "../context/notification-context";
import { useNavigate } from "react-router-dom";

import {  VscAdd } from "react-icons/vsc";
import { MdLogout } from "react-icons/md";

const AdminHeader = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phone_number: ""
    });

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const { name, phone_number } = formData;
        if (!name || !phone_number) {
            showNotification("Пожалуйста, заполните все поля");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            showNotification(data.message);

            if (res.ok) {
                setFormData({ name: "", phone_number: "" });
                setTimeout(() => setShowModal(false), 1500);
            }
        } catch (err) {
            showNotification("Ошибка при отправке заявки");
        }
    };


    const onClickLogout = () => {
        logout();
        navigate("/");
    };

    const onClickUsers = () => {
        navigate("/users");
    };

    const onClickRequests = () => {
        navigate("/requests");
    };

    return (
        <>
            <header className="header">
                <div className="logo-text" onClick={() => navigate("/")}>
                    <label className="company-title">Панель</label>
                    <label className="company-name">администратора</label>
                </div>

                <div className="header-right">
                    <div className="header-button">
                        <button onClick={() => onClickUsers()}>Пользователи</button>
                    </div>

                    <div className="header-button">
                        <button onClick={() => onClickRequests()}>Заявки и заказы</button>
                    </div>

                    <div className="logo-button">
                        {isAuthenticated ? (
                            <MdLogout className="logo-from-react" onClick={() => onClickLogout()} />
                        ) : (
                            <VscAdd className="logo-from-react" onClick={() => navigate("/auth")} />
                        )}
                    </div>
                </div>
            </header>

            {showModal && (
                <div className="request-modal-overlay">
                    <div className="request-modal-container">
                        <span className="request-modal-close" onClick={() => setShowModal(false)}>&times;</span>
                        <div className="black-title">
                            <label>Оставить заявку</label>
                        </div>
                        <form className="request-modal-form" onSubmit={handleFormSubmit}>
                            <input
                                type="text"
                                placeholder="Ваше имя"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Телефон"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            />
                            <div className="right-row">
                                <div className="orange-button">
                                    <button type="submit">Отправить</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminHeader;
