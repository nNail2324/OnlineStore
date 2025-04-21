import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { VscChromeClose } from "react-icons/vsc";

const Order = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/order/${orderId}`);
                if (!res.ok) throw new Error("Ошибка загрузки заказа");
                const data = await res.json();
                setOrderData(data);
            } catch (err) {
                console.error("❌ Ошибка загрузки:", err);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (!orderData) return <div>Загрузка...</div>;

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

                            <div className="black-title">
                                <label>{item.quantity} {item.unit}.</label>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="basket-column">
                <div className="delivery-column">
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
                    <div className="black-text">
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
                    <div className="black-text">
                        <label>{orderData.total_price.toLocaleString("ru-RU")} ₽</label>
                    </div>

                    <div className="right-row" >
                        <div className="white-button" >
                            <button>Отменить заказ</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Order;
