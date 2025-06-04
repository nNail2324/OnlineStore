import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { NotificationContext } from "../context/notification-context";

import { BsCartCheck } from "react-icons/bs";
import { VscArrowRight } from "react-icons/vsc";

const Basket = () => {
    const { userId } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [cart, setCart] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [deliveryMethod, setDeliveryMethod] = useState("pickup");
    const [addressError, setAddressError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return;

        const fetchCart = async () => {
            try {
                const response = await fetch(`/api/cart/${userId}`);
                if (!response.ok) throw new Error("Ошибка при получении корзины");
                const data = await response.json();
                setCart(data);
            } catch (error) {
                console.error("❌ Ошибка загрузки корзины:", error);
            }
        };

        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`/api/profile/${userId}`);
                if (!response.ok) throw new Error("Ошибка получения профиля");
                const data = await response.json();
                setUserProfile(data);
            } catch (error) {
                console.error("❌ Ошибка загрузки профиля:", error);
            }
        };

        fetchCart();
        fetchUserProfile();
    }, [userId]);

    useEffect(() => {
        if (userProfile) {
            const { phone_number, name, surname, city, street, house_number } = userProfile;
            if (!phone_number || !name || !surname || !city || !street || !house_number) {
                setAddressError("❗ Адрес не указан в профиле. Оформление доставки невозможно.");
            } else {
                setAddressError("");
            }
        } else {
            setAddressError("");
        }
    }, [deliveryMethod, userProfile]);

    const removeFromCart = async (productId) => {
        try {
            const response = await fetch("/api/cart/remove", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, product_id: productId }),
            });

            if (!response.ok) throw new Error("Ошибка при удалении товара");

            const data = await response.json();
            setCart(data);
        } catch (error) {
            console.error("❌ Ошибка удаления товара:", error);
        }
    };

    const updateQuantity = async (productId, change) => {
        try {
            const response = await fetch("/api/cart/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, product_id: productId, change }),
            });

            if (!response.ok) throw new Error("Ошибка при обновлении количества");

            const data = await response.json();
            setCart(data);
        } catch (error) {
            console.error("❌ Ошибка обновления количества:", error);
        }
    };

    const onClickOrder = async () => {
        // Проверка обязательных полей профиля
        if (!userProfile || !userProfile.phone_number || !userProfile.name || !userProfile.surname ||
            !userProfile.city || !userProfile.street || !userProfile.house_number) {
            showNotification("Заполните личные данные в профиле для оформления заказа");
            return;
        }
    
        try {
            const response = await fetch("/api/order/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    delivery_method: deliveryMethod
                })
            });
    
            if (!response.ok) {
                showNotification("Ошибка при оформлении заказа");
                return;
            }
    
            showNotification("Заказ успешно оформлен");
            const { orderId } = await response.json();
            console.log("OrderID", orderId);
            navigate(`/order/${orderId}`);
        } catch (error) {
            console.error("❌ Ошибка при оформлении заказа:", error);
            showNotification("Ошибка при оформлении заказа");
        }
    };
        

    const totalSum = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const deliveryPrice = deliveryMethod === "courier" ? userProfile?.delivery_price || 0 : 0;
    const finalTotal = totalSum + deliveryPrice;

    return (
        <div className="body-page">
            <div className="name">
                <label>Корзина</label>
            </div>

            <div className="types">
                {cart.length === 0 ? (
                    <div className="type">
                        <div className="bold-text">
                            <label>Ваша корзина пока пуста</label>
                        </div>
                        <div className="black-text">
                            <label>Чтобы пополнить список, воспользуйтесь поиском или каталогом</label>
                        </div>
                    </div>
                ) : (
                    cart.map((product) => (
                        <div className="type" key={product.ID}>
                            <div className="basket-column">
                                <div className="delivery-column">
                                    <div className="orange-title">
                                        <label>{product.name}</label>
                                    </div>

                                    <div className="left-row">
                                        <div className="orange-button">
                                            <button onClick={() => navigate(`/product/${product.ID}`)}>Перейти</button>
                                        </div>
                                        <div className="add-button">
                                            <button onClick={() => removeFromCart(product.ID)}>&times;</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="summary-column">
                                    <div className="black-title">
                                        <label>{product.price.toLocaleString("ru-RU")} &#8381;/{product.unit}.</label>
                                    </div>
                                    
                                    <div className="quantity-button">
                                        <button onClick={() => updateQuantity(product.ID, 1)}>+</button>
                                        <input type="text" value={product.quantity} readOnly />
                                        <button onClick={() => updateQuantity(product.ID, -1)}>-</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {cart.length > 0 && (
                <div className="basket-column">
                    <div className="delivery-column">
                        <div className="black-title">
                            <label>Контактные данные</label>
                        </div>
                        {userProfile && userProfile.phone_number && userProfile.name && userProfile.surname && userProfile.city && userProfile.street && userProfile.house_number ? (
                            <div className="delivery-label">
                                <label>{userProfile.name} {userProfile.surname}</label>
                                <label>{userProfile.phone_number}</label>
                                <label>{userProfile.location_name}, ул. {userProfile.street}, д. {userProfile.house_number}</label>
                            </div>
                        ) : (
                            <div className="black-text">
                                <label>Чтобы оформить заказ необходимо заполнить все поля в личном кабинете</label>
                            </div>
                        )}

                        <div className="black-title">
                            <label>Выберите способ доставки</label>
                        </div>

                        <div className="left-row">
                            <div className="radio-group">
                                <input
                                    type="radio"
                                    value="pickup"
                                    id="pickup"
                                    checked={deliveryMethod === "pickup"}
                                    onChange={(e) => setDeliveryMethod(e.target.value)} />
                                <label htmlFor="pickup">Самовывоз</label>
                            </div>

                            <div className="radio-group">
                                <input
                                    type="radio"
                                    value="courier"
                                    id="courier"
                                    checked={deliveryMethod === "courier"}
                                    onChange={(e) => setDeliveryMethod(e.target.value)} />
                                <label htmlFor="courier">Курьер</label>
                            </div>
                        </div>
                    </div>

                    <div className="summary-column">
                        {deliveryMethod === "courier" && (
                            <div>
                                <div className="black-title">
                                    <label>Стоимость доставки</label>
                                </div>
                                <div className="delivery-label">
                                    <label>
                                        {deliveryPrice === 0
                                            ? "Бесплатно"
                                            : `${deliveryPrice.toLocaleString("ru-RU")} ₽`}
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="black-title">
                            <label>Общая сумма к оплате</label>
                        </div>
                        <div className="delivery-label">
                            <label>{finalTotal.toLocaleString("ru-RU")} ₽</label>
                        </div>

                        <div className="right-row" >
                            <div className="white-button" >
                                <button onClick={onClickOrder}>Оформить заказ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Basket;
