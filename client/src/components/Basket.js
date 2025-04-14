import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context"; // Импорт контекста

const Basket = () => {
    const { userId } = useContext(AuthContext); // Получаем userId из контекста
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            console.error("Ошибка: userId отсутствует");
            return;
        }

        const fetchCart = async () => {
            try {
                console.log("🔄 Загружаем корзину для userId:", userId);
                const response = await fetch(`http://localhost:5000/api/cart/${userId}`);
                if (!response.ok) throw new Error("Ошибка при получении корзины");

                const data = await response.json();
                setCart(data);
            } catch (error) {
                console.error("❌ Ошибка загрузки корзины:", error);
            }
        };

        fetchCart();
    }, [userId]); // Перезагружать корзину при изменении userId

    const removeFromCart = async (productId) => {
        if (!userId) return;
        try {
            console.log(`🗑 Удаление товара ${productId} из корзины пользователя ${userId}`);
            const response = await fetch("http://localhost:5000/api/cart/remove", {
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
        if (!userId) return;
        try {
            console.log(`🔄 Изменение количества товара ${productId} у пользователя ${userId}`);
            const response = await fetch("http://localhost:5000/api/cart/update", {
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

    const totalSum = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);

    return (
        <div className="body-page">
            <div className="name">
                <label>Корзина</label>
            </div>

            <div className="types">
                {cart.length === 0 ? (
                    <div className="type">
                        <div class="bold-text">
                            <label>Ваша корзина пока пуста</label>
                        </div>
                        <div class="black-text">
                            <label>Чтобы пополнить список, воспользуйтесь поиском или каталогом.</label>
                        </div>
                    </div>
                    
                    ) : (
                        cart.map((product) => (
                            <div className="type" key={product.ID}>
                                <div className="orange-title">
                                    <label>{product.name}</label>
                                </div>
                                <div className="black-title">
                                    <label>{product.price} &#8381;</label>
                                </div>
                                <div className="quantity-button">
                                    <button onClick={() => updateQuantity(product.ID, 1)}>+</button>
                                    <input type="text" value={product.quantity} readOnly />
                                    <button onClick={() => updateQuantity(product.ID, -1)}>-</button>
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
                        ))
                )}
            </div>
            {cart.length > 0 && (
                <div>
                    <div className="basket-column">
                        <div className="delivery-column">
                            <div class="black-title">
                                <label>Общая сумма к оплате</label>
                            </div>
                            <div class="black-text">
                                <label>{totalSum.toLocaleString()} &#8381;</label>
                            </div>
                        </div>
                        <div class="summary-column">
                            <div class="black-title">
                                <label>Общая сумма к оплате</label>
                            </div>
                            <div class="black-text">
                                <label>{totalSum.toLocaleString()} &#8381;</label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Basket;
