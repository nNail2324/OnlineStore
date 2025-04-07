import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth-context";
import { useNavigate } from "react-router-dom";

import { FaPen } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { PiPasswordBold } from "react-icons/pi";

const Profile = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const { userId } = useContext(AuthContext);
    const navigate = useNavigate();
    const [userData, setUserData] = useState({});
    const [isEditing, setIsEditing] = useState(null); // Хранит редактируемое поле

    useEffect(() => {
        if (!userId) return;

        const fetchProfile = async () => {
            try {
                console.log("Загружаем данные профиля для userId:", userId);
                const response = await fetch(`http://localhost:5000/api/profile/${userId}`);
                if (!response.ok) throw new Error("Ошибка при получении данных");

                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            }
        };
        fetchProfile();
    }, [userId]);

    const handleEditClick = (field) => {
        setIsEditing(field); // Включаем редактирование конкретного поля
    };

    const handleChange = (e, field) => {
        setUserData((prev) => ({
            ...prev,
            [field]: e.target.value, // Обновляем значение в стейте
        }));
    };

    const handleSave = async (field) => {
        try {
            const response = await fetch(`http://localhost:5000/api/profile/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    field,
                    value: userData[field],
                }),
            });

            if (!response.ok) throw new Error("Ошибка при сохранении данных");

            console.log(`✅ Поле ${field} успешно обновлено`);
            setIsEditing(null); // Выключаем режим редактирования
        } catch (error) {
            console.error("Ошибка при сохранении данных:", error);
        }
    };

    const onClickLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="body-page">
            <div className="name">
                <label>Личный кабинет</label>
            </div>
            <div className="char">
                <div className="title">
                    <label>Личные данные</label>
                </div>
                <div className="form-profile">
                    {[
                        { label: "Имя", field: "name" },
                        { label: "Фамилия", field: "surname" },
                        { label: "Номер телефона", field: "phone_number" },
                        { label: "Населенный пункт", field: "city" },
                        { label: "Улица", field: "street" },
                        { label: "Номер дома", field: "house_number" },
                    ].map(({ label, field }) => (
                        <div className="input-group" key={field}>
                            <label>{label}</label>
                            <div className={`input-with-edit ${isEditing === field ? "active" : ""}`}>
                                <input
                                    type="text"
                                    value={userData?.[field] || ""}
                                    disabled={isEditing !== field}
                                    onChange={(e) => handleChange(e, field)}
                                />
                                {isEditing === field ? (
                                    <label onClick={() => handleSave(field)} className="edit-button">Сохранить</label>
                                ) : (
                                    <FaPen onClick={() => handleEditClick(field)} style={{ cursor: "pointer" }} className="edit-button"/>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="left-row">
                <div className="edit-button">
                    <label>Изменить пароль</label>
                </div>
                <PiPasswordBold className="orange-text" style={{fontSize: "20px"}}/>
            </div>

            <div className="left-row">
                <div className="edit-button">
                    <label onClick={onClickLogout}>Выйти</label>
                </div>
                <MdLogout className="orange-text" style={{fontSize: "20px"}}/>
            </div>

            <div className="char">
                <div className="title">
                    <label>Мои заказы</label>
                </div>
            </div>
        </div>
    );
};

export default Profile;
