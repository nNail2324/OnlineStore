import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Order = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/order/${orderId}`);
                if (!res.ok) throw new Error("Ошибка загрузки заказа");
                const data = await res.json();
                setOrderData(data);
            } catch (err) {
                console.error("❌ Ошибка загрузки:", err);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleCancelOrder = async () => {
        try {
            const res = await fetch(`/api/order/${orderId}/cancel`, {
                method: "PATCH",
            });
    
            if (!res.ok) throw new Error("Не удалось отменить заказ");
    
            const updated = await res.json();
            setOrderData((prev) => ({ ...prev, status: updated.status }));
        } catch (err) {
            console.error("Ошибка отмены заказа:", err);
            alert("Ошибка при отмене заказа");
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

                    <div className="delivery-label">
                        {orderData.delivery_method === "courier"
                            ? "Курьером"
                            : "Самовывоз"}
                    </div>

                    <div className="black-title">
                        <label>Статус заказа</label>
                    </div>
                    <div className="delivery-label">
                        <label>{orderData.status}</label>
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
                    <div className="delivery-label">
                        <label>{orderData.total_price.toLocaleString("ru-RU")} ₽</label>
                    </div>

                    <div className="right-row">
                        {orderData.status !== "Отменён" && (
                            <div className="white-button">
                                <button onClick={handleCancelOrder}>Отменить заказ</button>
                            </div>
                        )}
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

export default Order;
