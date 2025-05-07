import React, { useState, useEffect, useContext } from "react";
import { NotificationContext } from "../context/notification-context";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const { showNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/users");
                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error("Ошибка при загрузке пользователей:", error);
                showNotification("Ошибка загрузки пользователей");
            }
        };
        fetchUsers();
    }, [showNotification]);

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
    };

    // Фильтрация пользователей
    const filteredUsers = users.filter((user) => {
        const fullName = `${user.name || ""} ${user.surname || ""}`.toLowerCase();
        const phone = (user.phone_number || "").toLowerCase();
        const search = searchValue.toLowerCase();
        return fullName.includes(search) || phone.includes(search);
    });

    return (
        <div className="body-page">
            <div className="title-row">
                <div className="name">
                    <label>Пользователи</label>
                </div>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Поиск по имени или телефону..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="types">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div className="type" key={user.ID} onClick={() => handleUserClick(user.ID)}>
                            <div className="basket-column">
                                <div className="delivery-column">
                                    <div className="black-title">
                                        <label>
                                            {user.name && user.surname
                                                ? `${user.name} ${user.surname}`
                                                : "Не указан"}
                                        </label>
                                    </div>
                                    <div className="black-text">
                                        <label>{user.phone_number || "Не указан"}</label>
                                    </div>
                                </div>

                                <div className="summary-column">
                                    <div className="black-text">
                                        <label>
                                            {user.city_name && user.street && user.house_number
                                                ? `${user.city_name}, ${user.street}, д ${user.house_number}`
                                                : "Не указан"}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>
                        <div className="black-title">
                            <label>Пользователи не найдены</label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
