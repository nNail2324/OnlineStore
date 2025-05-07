import React, { useState, useEffect, useContext } from "react";
import { NotificationContext } from "../context/notification-context";
import { useNavigate } from "react-router-dom";

const AdminRequest = () => {
    const [requests, setRequests] = useState([]);
    const [orders, setOrders] = useState([]);
    const [requestSearch, setRequestSearch] = useState("");
    const [orderSearch, setOrderSearch] = useState("");
    const { showNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [requestsRes, ordersRes] = await Promise.all([
                    fetch("/api/request"),
                    fetch("/api/order"),
                ]);

                if (!requestsRes.ok || !ordersRes.ok) {
                    throw new Error("Ошибка при загрузке данных");
                }

                const requestsData = await requestsRes.json();
                const ordersData = await ordersRes.json();

                setRequests(requestsData);
                setOrders(ordersData);
            } catch (error) {
                console.error("Ошибка при загрузке заявок и заказов:", error);
                showNotification("Ошибка загрузки данных");
            }
        };
        fetchData();
    }, [showNotification]);

    const handleOrderClick = (orderId) => {
        navigate(`/order/${orderId}`);
    };

    const filteredRequests = requests.filter((request) => {
        const name = (request.name || "").toLowerCase();
        const phone = (request.phone_number || "").toLowerCase();
        const search = requestSearch.toLowerCase();
        return name.includes(search) || phone.includes(search);
    });

    const filteredOrders = orders.filter((order) => {
        const status = (order.status || "").toLowerCase();
        const id = order.ID.toString();
        const totalPrice = order.total_price.toString();
        const search = orderSearch.toLowerCase();
        return (
            status.includes(search) ||
            id.includes(search) ||
            totalPrice.includes(search)
        );
    });
    

    return (
        <div className="body-page">
            <div className="title-row">
                <div className="name"><label>Заявки и заказы</label></div>
            </div>

            {/* Секция заявок */}
            <div className="bold-text">
                <label>Входящие запросы</label>
            </div>

            {/* Поиск по заявкам */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Поиск по имени или телефону..."
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="types">
                {filteredRequests.length === 0 ? (
                    <div className="black-title">Нет заявок</div>
                ) : (
                    filteredRequests.map((request) => (
                        <div className="type" key={request.ID}>
                            <div className="basket-column">
                                <div className="delivery-column">
                                    <div className="black-title">
                                        <label>{request.name}</label>
                                    </div>
                                    <div className="black-text">
                                        <label>{request.phone_number}</label>
                                    </div>
                                </div>
                                <div className="summary-column">
                                    <div className="black-text">
                                        <label>{new Date(request.created_at).toLocaleString("ru-RU")}</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="request-titile">
                <label>Заказы</label>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Поиск по номеру заказа или статусу..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="types">
                {filteredOrders.length === 0 ? (
                    <div className="black-title">Нет заказов</div>
                ) : (
                    filteredOrders.map((order) => (
                        <div className="type" key={order.ID} onClick={() => handleOrderClick(order.ID)}>
                            <div className="basket-column">
                                <div className="delivery-column">
                                    <div className="black-title">
                                        <label>Заказ №{order.ID}</label>
                                    </div>
                                    <div className="black-text">
                                        <label>Статус: {order.status}</label>
                                    </div>
                                </div>
                                <div className="summary-column">
                                    <div className="black-title">
                                        <label>{order.total_price.toLocaleString("ru-RU")} ₽</label>
                                    </div>
                                    <div className="black-text">
                                        <label>{new Date(order.created_at).toLocaleString("ru-RU")}</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminRequest;
