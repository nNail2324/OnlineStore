import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { NotificationContext } from "../context/notification-context";

const Favorite = () => {
    const { userId } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [favorites, setFavorites] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!userId) return;

            try {
                const response = await fetch(`/api/favorite/${userId}`);
                if (!response.ok) throw new Error("Ошибка при получении избранного");

                const data = await response.json();
                setFavorites(data);
            } catch (error) {
                console.error("❌ Ошибка загрузки избранного:", error);
            }
        };

        fetchFavorites();
    }, [userId]);

    const addToCart = async (product) => {
        if (!userId) {
            showNotification("Требуется авторизация");
            return;
        }

        try {
            const response = await fetch("/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, product_id: product.ID, quantity: 1 }),
            });

            const data = await response.json();
            if (data.success) {
                showNotification(`${product.name} добавлен в корзину!`);
            } else {
                showNotification("Ошибка при добавлении в корзину.");
            }
        } catch (error) {
            console.error("❌ Ошибка добавления в корзину:", error);
        }
    };

    const removeFromFavorites = async (productId) => {
        if (!userId) return;

        try {
            const response = await fetch("/api/favorite/remove", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, product_id: productId }),
            });

            if (!response.ok) throw new Error("Ошибка при удалении из избранного");

            // Обновляем список
            const updated = favorites.filter(item => item.ID !== productId);
            setFavorites(updated);
        } catch (error) {
            console.error("❌ Ошибка удаления из избранного:", error);
        }
    };

    return (
        <div className="body-page">
            <div className="name">
                <label>Отложенные</label>
            </div>

            <div className="types">
                {favorites.length === 0 ? (
                    <div className="type">
                        <div className="bold-text">
                            <label>Ваш список отложенных товаров пуст</label>
                        </div>
                        <div className="black-text">
                            <label>Добавьте товары в отложенные, чтобы не потерять интересующие товары</label>
                        </div>
                    </div>
                ) : (
                    favorites.map((product) => (
                        <div className="type" key={product.ID}>
                            <div className="basket-column">
                                <div className="delivery-column">
                                    <div className="orange-title">
                                        <label>{product.name}</label>
                                    </div>

                                    <div className="left-row">
                                        <div className="white-button">
                                            <button onClick={() => navigate(`/product/${product.ID}`)}>Перейти</button>
                                        </div>
                                        <div className="add-button">
                                            <button onClick={() => addToCart(product)}>+</button>
                                        </div>
                                        <div className="add-button">
                                            <button onClick={() => removeFromFavorites(product.ID)}>&times;</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="summary-column">
                                    <div className="black-title">
                                        <label>{product.price.toLocaleString("ru-RU")} &#8381;/{product.unit}</label>
                                    </div>

                                    <div className="black-text">
                                        <label>На складе: {product.stock} шт.</label>
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

export default Favorite;
