import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

import { VscHeart } from "react-icons/vsc";
import { VscHeartFilled } from "react-icons/vsc";

const ProductCard = () => {
    const { id } = useParams();
    const { userId } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();

    

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/product/card/${id}`);
                
                if (!response.ok) {
                    throw new Error("Товар не найден");
                }
                
                const data = await response.json();
                setProduct(data);

                if (userId && data?.ID) {
                    const checkFavorite = async () => {
                        try {
                            const res = await fetch("http://localhost:5000/api/favorite/check", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ user_id: userId, product_id: data.ID }),
                            });
                            const result = await res.json();
                            setIsFavorite(result.isFavorite); // true или false
                        } catch (e) {
                            console.error("Ошибка при проверке избранного:", e);
                        }
                    };
                
                    checkFavorite();
                }
                
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleQuantityChange = (value) => {
        const newQuantity = quantity + value;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!userId) {
            alert("Вы не авторизованы!");
            return;
        }
        console.log("Добавляем в корзину:", { userId, productId: product.ID, quantity });

        try {
            const response = await fetch("http://localhost:5000/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: userId, product_id: product.ID, quantity }),
            });

            const data = await response.json();
            if (data.success) {
                alert(`${product.name} добавлен в корзину!`);
            } else {
                alert("Ошибка при добавлении товара.");
            }
        } catch (error) {
            console.error("Ошибка при добавлении товара в корзину:", error);
        }
    };

    const toggleFavorite = async () => {
        if (!userId) {
            alert("Вы не авторизованы!");
            return;
        }
    
        try {
            const endpoint = isFavorite ? "remove" : "add";
            const method = isFavorite ? "DELETE" : "POST";
    
            const res = await fetch(`http://localhost:5000/api/favorite/${endpoint}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, product_id: product.ID }),
            });
    
            if (!res.ok) throw new Error("Ошибка изменения избранного");
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error("Ошибка при изменении избранного:", error);
        }
    };

    if (loading) return <div>Загрузка...</div>;
if (error) return <div>Ошибка: {error}</div>;
if (!product) return null; // Безопасность от undefined/null

    return (
        <div className="body-page">
            <div className="name">
                <label>{product.name}</label>
            </div>
            
            <div className="line">
                <div className="image-product">
                </div>
                
                <div className="char">
                    <div className="title">
                        <label>Характеристики</label>
                    </div>
                    <div className="product-desc">
                        {product.attributes && product.attributes.map((attr, index) => (
                            <div className="black-title" key={index}>
                                <label>{attr.attribute_name}: {attr.attribute_value}</label>
                            </div>
                        ))}
                    </div>
                    
                    <div className="title">
                        <label>Цена</label>
                    </div>
                    <div className="product-desc">
                        <div className="black-title">
                            <label>{product.price} руб.</label>
                        </div>
                        <div className="left-row">
                            <div className="quantity-button">
                                <button onClick={() => handleQuantityChange(-1)}>-</button>
                                <input 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    min="1"
                                />
                                <button onClick={() => handleQuantityChange(1)}>+</button>
                            </div>
                            <div className="orange-button">
                                <button onClick={handleAddToCart}>Добавить в корзину</button>
                            </div>
                            {isFavorite ? (
                                        <VscHeartFilled onClick={toggleFavorite} className="logo-heart" />
                                    ) : (
                                        <VscHeart onClick={toggleFavorite} className="logo-heart" />
                                    )}                            
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="char">
                <div className="title">
                    <label>Описание</label>
                </div>
                <div className="black-text" style={{fontSize: "20px"}}>
                    <label>{product.description}</label>
                </div>
            </div>

            <div className="char">
                <div className="title">
                    <label>Отзывы</label>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
