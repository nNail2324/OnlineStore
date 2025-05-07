import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth-context";
import { useNavigate } from "react-router-dom";
import { FaPen } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { PiPasswordBold } from "react-icons/pi";

const Profile = () => {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useContext(AuthContext);
    const { userId } = useContext(AuthContext);
    const [userData, setUserData] = useState({});
    const [isEditing, setIsEditing] = useState(null);
    const [locations, setLocations] = useState([]);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [orders, setOrders] = useState([]);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Загрузка данных пользователя
    useEffect(() => {
        if (!userId) return;

        const fetchProfile = async () => {
            try {
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

    // Загрузка населённых пунктов
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/locations");
                if (!res.ok) {
                    throw new Error(`Ошибка при получении данных: ${res.statusText}`);
                }
                const data = await res.json();
                setLocations(data);
            } catch (err) {
                console.error("Ошибка при получении населённых пунктов:", err);
                alert("Не удалось получить населённые пункты. Попробуйте позже.");
            }
        };
        fetchLocations();
    }, []);

    // Загрузка заказов пользователя
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/profile/${userId}/orders`);
                if (!response.ok) throw new Error("Ошибка при получении заказов");
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                console.error("Ошибка загрузки заказов:", err);
            }
        };

        if (userId) {
            fetchOrders();
        }
    }, [userId]);

    const handleEditClick = (field) => {
        setIsEditing(field);
    };

    const handleChange = (e, field) => {
        setUserData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleSave = async (field) => {
        try {
            const response = await fetch(`http://localhost:5000/api/profile/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    field,
                    value: userData[field],
                }),
            });

            if (!response.ok) throw new Error("Ошибка при сохранении данных");
            console.log(`Поле ${field} успешно обновлено`);
            setIsEditing(null);
        } catch (error) {
            console.error("Ошибка при сохранении данных:", error);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async () => {
        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (newPassword !== confirmPassword) {
            alert("Новый пароль и подтверждение не совпадают");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/profile/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    currentPassword,
                    newPassword,
                }),
            });

            if (!response.ok) throw new Error("Ошибка при смене пароля");

            alert("Пароль успешно изменён");
            setShowPasswordForm(false);
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error("Ошибка смены пароля:", error);
            alert("Не удалось изменить пароль. Проверьте введённые данные.");
        }
    };

    const onClickLogout = () => {
        logout();
        navigate("/");
    };

    const onClickOrder = (orderId) => {
        navigate(`/order/${orderId}`);
    };    

    return (
        <div className="body-page">
            <div className="name">
                <label>Личный кабинет</label>
            </div>

            <div className="char">
                <div className="bold-text">
                    <label>Личные данные</label>
                </div>

                <div className="form-profile">
                    {[{ label: "Имя", field: "name" }, { label: "Фамилия", field: "surname" }, { label: "Номер телефона", field: "phone_number" }, { label: "Населенный пункт", field: "city", isSelect: true }, { label: "Улица", field: "street" }, { label: "Номер дома", field: "house_number" }].map(({ label, field, isSelect }) => (
                        <div className="input-group" key={field}>
                            <label>{label}</label>
                            <div className={`input-with-edit ${isEditing === field ? "active" : ""}`}>
                                {isSelect ? (
                                    isEditing === field ? (
                                        <select value={userData[field] || ""} onChange={(e) => handleChange(e, field)}>
                                            <option value="">Выберите населённый пункт</option>
                                            {Array.isArray(locations) &&
                                                locations.map((loc) => (
                                                    <option key={loc.ID} value={loc.ID}>
                                                        {loc.name}
                                                    </option>
                                                ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={
                                                Array.isArray(locations)
                                                    ? locations.find((loc) => loc.ID === Number(userData[field]))?.name || ""
                                                    : ""
                                            }
                                            disabled
                                        />
                                    )
                                ) : (
                                    <input
                                        type="text"
                                        value={userData?.[field] || ""}
                                        disabled={isEditing !== field}
                                        onChange={(e) => handleChange(e, field)}
                                    />
                                )}
                                {isEditing === field ? (
                                    <label onClick={() => handleSave(field)} className="edit-button">
                                        Сохранить
                                    </label>
                                ) : (
                                    <FaPen onClick={() => handleEditClick(field)} style={{ cursor: "pointer" }} className="edit-button" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="left-row">
                <div className="edit-button" onClick={() => setShowPasswordForm((prev) => !prev)}>
                    <label>Изменить пароль</label>
                </div>
                <PiPasswordBold className="orange-icon" />
            </div>

            {showPasswordForm && (
                <div className="form-profile" style={{ paddingTop: "0px" }}>
                    <div className="input-group">
                        <div className="input-with-edit active">
                            <input
                                type="password"
                                name="currentPassword"
                                placeholder="Текущий пароль"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <div className="input-with-edit active">
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="Новый пароль"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <div className="input-with-edit active">
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Подтвердите пароль"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                            />
                        </div>
                    </div>
                    <div className="edit-button" onClick={handlePasswordSubmit}>
                        <label>Сохранить пароль</label>
                    </div>
                </div>
            )}

            <div className="left-row">
                <div className="edit-button" onClick={onClickLogout}>
                    <label>Выйти</label>
                </div>
                <MdLogout className="orange-icon" />
            </div>

            <div className="types">
                <div className="bold-text">
                    <label>Мои заказы</label>
                </div>
                {orders.length === 0 ? (
                <div className="black-text">
                    <label>У вас пока нет заказов</label>
                </div>
                ) : (
                <div className="orders-container">
                    {orders.map((order) => (
                    <div className="order-item" key={order.ID} onClick={() => onClickOrder(order.ID)}>
                        <div className="basket-column">
                            <div className="delivery-column">
                                <div className="name">
                                    <label>{order.ID}</label>
                                </div>
                                <div className="black-title">
                                    <label>{order.total_price.toLocaleString("ru-RU")} руб.</label>
                                </div>

                                <div className="black-text">
                                        <label>
                                            {order.delivery_method === "courier"
                                                ? "Курьером"
                                                : "Самовывоз"}
                                        </label>
                                    </div>
                                </div>
                            
                            <div className="summary-column">
                                <div className="black-text">
                                    <label>{new Date(order.created_at).toLocaleString()}</label>
                                </div>
                                
                                <div className="orange-text">
                                    <label>{order.status}</label>
                                </div>
                            </div>
                        </div>

                    </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

export default Profile;
