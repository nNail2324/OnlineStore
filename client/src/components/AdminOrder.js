import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NotificationContext } from "../context/notification-context";

const AdminOrder = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    
    const { showNotification } = useContext(NotificationContext);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/order/${orderId}`);
                if (!res.ok) throw new Error("Ошибка загрузки заказа");
                const data = await res.json();
                setOrderData(data);
                setNewStatus(data.status); 
            } catch (err) {
                console.error("❌ Ошибка загрузки:", err);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleChangeOrderStatus = async (status) => {
        try {
            const res = await fetch(`/api/order/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error("Не удалось изменить статус заказа");

            const updated = await res.json();
            setOrderData((prev) => ({ ...prev, status: updated.status }));
        } catch (err) {
            console.error("Ошибка изменения статуса:", err);
            showNotification("Ошибка при изменении статуса");
        }
    };

    const handleDownloadInvoice = () => {
        window.open(`/api/order/${orderId}/invoices`, "_blank");
    };

    if (!orderData) return 
        <div className="loading-error">
           Загрузка...
        </div>

    return (
        <div className="body-page">
            <div className="name"><label>Заказ №{orderId}</label></div>

            {orderData.items.map((item) => (
                <div className="type" key={item.product_id}>
                    <div className="basket-column">
                        <div className="delivery-column">
                            <div className="orange-title">
                                <label>{item.name}</label>
                            </div>

                            <div className="orange-button">
                                <button onClick={() => navigate(`/product/${item.product_id}`)}>Перейти</button>
                            </div>
                        </div>

                        <div className="summary-column">
                            <div className="black-title">
                                <label>{item.price.toLocaleString("ru-RU")} ₽</label>
                            </div>

                            <div className="black-text">
                                <label>{item.quantity} {item.unit}.</label>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="basket-column">
                <div className="delivery-column">
                    <div className="black-title">
                        <label>Контактные данные</label>
                    </div>
                    <div className="delivery-label">
                        <label>{orderData.contact_name}</label>
                        <label>{orderData.contact_phone}</label>
                        <label>{orderData.delivery_address}</label>
                    </div>
                    
                    <div className="black-title">
                        <label>Способ доставки</label>
                    </div>

                    <div className="black-text">
                        {orderData.delivery_method === "courier"
                            ? "Курьером"
                            : "Самовывоз"}
                    </div>

                    <div className="black-title">
                        <label>Статус заказа</label>
                    </div>
                    <div className="left-row">
                        <div className="radio-group">
                            <input
                                type="radio"
                                value="В пути"
                                id="transit"
                                checked={newStatus === "В пути"}
                                onChange={(e) => { setNewStatus(e.target.value); handleChangeOrderStatus(e.target.value); }} />
                            <label htmlFor="transit">В пути</label>
                        </div>

                        <div className="radio-group">
                            <input
                                type="radio"
                                value="Доставлен"
                                id="delivered"
                                checked={newStatus === "Доставлен"}
                                onChange={(e) => { setNewStatus(e.target.value); handleChangeOrderStatus(e.target.value); }} />
                            <label htmlFor="delivered">Доставлен</label>
                        </div>

                        <div className="radio-group">
                            <input
                                type="radio"
                                value="Отменён"
                                id="cancelled"
                                checked={newStatus === "Отменён"}
                                onChange={(e) => { setNewStatus(e.target.value); handleChangeOrderStatus(e.target.value); }} />
                            <label htmlFor="cancelled">Отменён</label>
                        </div>
                    </div>
                </div>

                <div className="summary-column">
                    {orderData.delivery_method === "courier" && (
                        <div>
                            <div className="black-title">
                                <label>Стоимость доставки</label>
                            </div>
                            <div className="black-text">
                                <label>
                                    {orderData.delivery_price === 0
                                        ? "Бесплатно"
                                        : `${orderData.delivery_price.toLocaleString("ru-RU")} ₽`}
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="black-title">
                        <label>Общая сумма к оплате</label>
                    </div>
                    <div className="black-text">
                        <label>{orderData.total_price.toLocaleString("ru-RU")} ₽</label>
                    </div>

                    <div className="right-row">
                        <div className="gray-button">
                            <button onClick={handleDownloadInvoice}>Скачать накладную</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrder;
