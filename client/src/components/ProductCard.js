import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import { FaStar, FaRegStar } from "react-icons/fa";

const ProductCard = () => {
    const { id } = useParams();
    const { userId } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState("");
    const [reviewMark, setReviewMark] = useState(5);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/product/card/${id}`);
                if (!response.ok) throw new Error("Товар не найден");
                const data = await response.json();
                setProduct(data);

                if (userId && data?.ID) {
                    const res = await fetch("http://localhost:5000/api/favorite/check", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: userId, product_id: data.ID }),
                    });
                    const result = await res.json();
                    setIsFavorite(result.isFavorite);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/product/feedback/${id}`);
                const data = await res.json();
                setReviews(data);
            } catch (err) {
                console.error("Ошибка при загрузке отзывов:", err);
            }
        };

        fetchProduct();
        fetchReviews();
    }, [id, userId]);

    const handleQuantityChange = (value) => {
        const newQuantity = quantity + value;
        if (newQuantity >= 1) setQuantity(newQuantity);
    };

    const handleAddToCart = async () => {
        if (!userId) {
            alert("Вы не авторизованы!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

    const submitFeedback = async () => {
        if (!userId) {
            alert("Вы не авторизованы!");
            return;
        }
        if (!reviewText.trim()) return;

        try {
            const res = await fetch("http://localhost:5000/api/product/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    product_id: id,
                    mark: reviewMark,
                    description: reviewText,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setReviewText("");
                setReviewMark(5);
                const refreshed = await fetch(`http://localhost:5000/api/product/feedback/${id}`);
                setReviews(await refreshed.json());
            } else {
                alert("Ошибка при отправке отзыва");
            }
        } catch (err) {
            console.error("Ошибка отправки отзыва:", err);
        }
    };
    
    const averageRating =
    reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.mark, 0) / reviews.length
        : 0;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!product) return null;

    return (
        <div className="body-page">
            <div className="line">
                <div className="image-product">
                    {/* Здесь может быть изображение */}
                </div>

                <div className="types">
                    <div className="name">
                        <label>{product.name}</label>
                    </div>
                    {reviews.length > 0 && (
                        <div className="left-row" >
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star}>
                                    {star <= Math.round(averageRating) ? (
                                        <FaStar color="gold" size={17} />
                                    ) : (
                                        <FaRegStar color="gray" size={17} />
                                    )}
                                </span>
                            ))}
                            <span className="black-text">
                                {reviews.length} отзывов
                            </span>
                        </div>
                    )}

                    <div className="bold-text">
                        <label>Характеристики</label>
                    </div>
                    <div className="characteristics">
                        {product.attributes?.map((attr, index) => (
                            <div key={index} className="spec-line">
                                <span className="spec-label">{attr.attribute_name}</span>
                                <span className="spec-dots" />
                                <span className="spec-value">{attr.attribute_value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="characteristics">
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

            <div className="types">
                <div className="bold-text">
                    <label>Описание</label>
                </div>
                <div className="description-text" >
                    <label>{product.description}</label>
                </div>
            </div>

            <div className="types">
                <div className="bold-text">
                    <label>Отзывы</label>
                </div>

                <div className="types">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} onClick={() => setReviewMark(star)} style={{ cursor: "pointer" }}>
                                {star <= reviewMark ? (
                                    <FaStar color="gold" size={24} />
                                ) : (
                                    <FaRegStar color="gray" size={24} />
                                )}
                            </span>
                        ))}
                        <div className="black-text">
                            {reviewMark === 0 ? "— не выбрано" : `${reviewMark} / 5`}
                        </div>
                    </div>

                    <textarea className="input-feedback"
                        rows="4"
                        placeholder="Написать отзыв"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />
                    
                    <div className="black-button">
                        <button onClick={submitFeedback} >Отправить отзыв</button>
                    </div>
                </div>

                <div className="feedback">
    {reviews.length === 0 ? (
        <div className="black-text">
            <label>Отзывов пока нет</label>
        </div>
    ) : (
        reviews.map((rev, idx) => {
            // Получаем первую букву имени
            const firstLetter = rev.username ? rev.username.charAt(0).toUpperCase() : 'A';
            
            return (
                <div key={idx} className="characteristics">
                    <div className="review-header">
                        <div className="user-avatar">
                            {firstLetter}
                        </div>
                        <div className="user-info">
                            <div className="black-title">
                                <label>{rev.username}</label>
                            </div>
                            <div className="date-text">
                                {formatDate(rev.created_at)}
                            </div>
                        </div>
                    </div>
                    <div className="left-row">
                        {[...Array(5)].map((_, i) => (
                            i < rev.mark ? <FaStar key={i} color="gold" style={{fontSize: "20px"}} /> : <FaRegStar key={i} color="gray" style={{fontSize: "20px"}}/>
                        ))}
                    </div>
                    <div className="black-text">
                        <label>{rev.description}</label>
                    </div>
                </div>
            );
        })
    )}
</div>
            </div>
        </div>
    );
};

export default ProductCard;
