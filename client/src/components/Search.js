import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { NotificationContext } from "../context/notification-context";

const Search = () => {
    const { userId } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get("q");

    const [products, setProducts] = useState([]);
    const [unit, setUnit] = useState(""); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;

            setLoading(true);
            try {
                const response = await fetch(`/api/product/search?q=${query}`);
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error("Ошибка при поиске:", err);
            }
            setLoading(false);
        };

        fetchResults();
    }, [query]);

    const onClickCard = (productId) => {
        navigate(`/product/${productId}`);
    };

    const addToCart = async (product) => {
        if (!userId) {
            showNotification("Требуется авторизация!");
            return;
        }

        try {
            const response = await fetch("/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: userId, product_id: product.ID, quantity: 1 }),
            });

            const data = await response.json();
            if (data.success) {
                showNotification(`${product.name} добавлен в корзину!`);
            } else {
                showNotification("Ошибка при добавлении в корзину.");
            }
        } catch (error) {
            console.error("Ошибка при добавлении товара в корзину:", error);
        }
    };

    return (
        <div className="body-page">
            <div className="name">
                <label>Результаты поиска</label>
            </div>

            {loading ? (
                <div className="loading-error">
                    Загрузка...
                </div>
            ) : products.length === 0 ? (
                <div className="type">
                    <div className="black-title">
                        <label>По вашему запросу ничего не найдено</label>
                    </div>
                    <div className="black-text">
                        <label>Попробуйте поискать товар вручную</label>
                    </div>
                </div>
            ) : (
                <div className="types">
                    {products.map((product) => (
                        <div className="type" key={product.ID}>
                            <div className="basket-column">
                                <div className="delivery-column">
                                    <div className="orange-title">
                                        <label>{product.name}</label>
                                    </div>
                                    <div className="left-row">
                                        <div className="orange-button">
                                            <button onClick={() => onClickCard(product.ID)}>Перейти</button>
                                        </div>
                                        <div className="add-button">
                                            <button onClick={() => addToCart(product)}>+</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="summary-column">
                                    <div className="black-title">
                                        <label>
                                            {product.price.toLocaleString("ru-RU")} &#8381;/{product.unit || "шт"}.
                                        </label>
                                    </div>
                                    <div className="black-text">
                                        <label>На складе: {product.stock} шт.</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search;
