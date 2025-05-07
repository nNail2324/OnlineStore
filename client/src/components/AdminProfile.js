import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AdminProfile = () => {
    const navigate = useNavigate();
    const { profile_id } = useParams(); // Получаем ID пользователя из URL
    const [userData, setUserData] = useState({});
    const [locations, setLocations] = useState([]);
    const [orders, setOrders] = useState([]);

    // Загрузка данных пользователя
    useEffect(() => {
        if (!profile_id) return;

        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/profile/${profile_id}`);
                if (!response.ok) throw new Error("Ошибка при получении данных профиля");
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error("Ошибка загрузки профиля:", error);
            }
        };
        fetchProfile();
    }, [profile_id]);

    // Загрузка населённых пунктов
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/locations");
                if (!res.ok) throw new Error("Ошибка при получении населённых пунктов");
                const data = await res.json();
                setLocations(data);
            } catch (err) {
                console.error("Ошибка при получении населённых пунктов:", err);
            }
        };
        fetchLocations();
    }, []);

    // Загрузка заказов пользователя
    useEffect(() => {
        if (!profile_id) return;

        const fetchOrders = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/profile/${profile_id}/orders`);
                if (!response.ok) throw new Error("Ошибка при получении заказов");
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                console.error("Ошибка загрузки заказов:", err);
            }
        };
        fetchOrders();
    }, [profile_id]);

    const onClickOrder = (orderId) => {
        navigate(`/order/${orderId}`);
    };

    return (
        <div className="body-page">
            <div className="name">
                <label>Личный кабинет пользователя</label>
            </div>

            <div className="char">
                <div className="bold-text">
                    <label>Личные данные</label>
                </div>

                <div className="form-profile">
                    {[ 
                        { label: "Имя", field: "name" }, 
                        { label: "Фамилия", field: "surname" }, 
                        { label: "Номер телефона", field: "phone_number" }, 
                        { label: "Населенный пункт", field: "city", isSelect: true }, 
                        { label: "Улица", field: "street" }, 
                        { label: "Номер дома", field: "house_number" }
                    ].map(({ label, field, isSelect }) => (
                        <div className="input-group" key={field}>
                            <label>{label}</label>
                            <div className="input-with-edit">
                                {isSelect ? (
                                    <input
                                        type="text"
                                        value={
                                            Array.isArray(locations)
                                                ? locations.find((loc) => loc.ID === Number(userData[field]))?.name || ""
                                                : ""
                                        }
                                        disabled
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={userData?.[field] || ""}
                                        disabled
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="types">
                <div className="bold-text">
                    <label>Заказы</label>
                </div>

                {orders.length === 0 ? (
                    <div className="black-text">
                        <label>У пользователя пока нет заказов</label>
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
                                                {order.delivery_method === "courier" ? "Курьером" : "Самовывоз"}
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

export default AdminProfile;
