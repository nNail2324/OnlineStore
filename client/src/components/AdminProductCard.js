import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { NotificationContext } from "../context/notification-context";

import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import { FaStar, FaRegStar } from "react-icons/fa";

const AdminProductCard = () => {
    const { id } = useParams();
    const { userId } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    const [reviews, setReviews] = useState([]);

    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/product/card/${id}`);
                if (!response.ok) throw new Error("Товар не найден");
                const data = await response.json();
                setProduct(data);

                if (userId && data?.ID) {
                    const res = await fetch("/api/favorite/check", {
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
                const res = await fetch(`/api/product/feedback/${id}`);
                const data = await res.json();
                setReviews(data);
            } catch (err) {
                console.error("Ошибка при загрузке отзывов:", err);
            }
        };

        fetchProduct();
        fetchReviews();
    }, [id, userId]);

    useEffect(() => {
        const fetchImages = async () => {
          try {
            const res = await fetch(`/api/product/images/${id}`);
            const data = await res.json();
            setImages(data);
          } catch (err) {
            console.error("Ошибка при загрузке изображений:", err);
          }
        };
      
        fetchImages();
      }, [id]);

    
    const averageRating =
    reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.mark, 0) / reviews.length
        : 0;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };
    
    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (loading) return 
        <div className="loading-error">
            Загрузка...
        </div>
    if (error) return <div>Ошибка: {error}</div>;
    if (!product) return null;

    return (
        <div className="body-page">
            <div className="line">
                <div className="image-product-slider">
                    {images.length > 0 ? (
                        <>
                        <div className="slider-window">
                            <div
                            className="slider-track"
                            style={{
                                transform: `translateX(-${currentImageIndex * 100}%)`,
                            }}
                            >
                            {images.map((img, i) => (
                                <div className="slide" key={i}>
                                <img
                                    src={`/images/${img.path}`}
                                    alt={product.name}
                                />
                                </div>
                            ))}
                            </div>
                        </div>

                        <div className="slider-dots">
                            {images.map((_, i) => (
                            <span
                                key={i}
                                className={`dot ${i === currentImageIndex ? "active" : ""}`}
                                onClick={() => setCurrentImageIndex(i)}
                            />
                            ))}
                        </div>
                        </>
                    ) : (
                        <div style={{ padding: "10px" }}>Изображение отсутствует</div>
                    )}
                </div>

                <div className="attribute-block">
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

                    <div className="card-label">
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
                            <label>{product.price.toLocaleString("ru-RU")} руб./{product.unit}.</label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="types">
                <div className="card-label">
                    <label>Описание</label>
                </div>
                <div className="description-text" >
                    <label>{product.description}</label>
                </div>
            </div>

            <div className="types">
                <div className="card-label">
                    <label>Отзывы</label>
                </div>

                <div className="feedback">
                    {reviews.length === 0 ? (
                        <div className="black-text"></div>
                    ) : (
                        reviews.map((rev, idx) => {
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

export default AdminProductCard;
