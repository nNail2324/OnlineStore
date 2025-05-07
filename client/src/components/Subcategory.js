import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { NotificationContext } from "../context/notification-context";

const Subcategory = () => {
    const { id } = useParams();
    const { userId } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [products, setProducts] = useState([]);
    const [subcategoryName, setSubcategoryName] = useState("");
    const [unit, setUnit] = useState("");
    const navigate = useNavigate();


    useEffect(() => {
        const fetchSubcategoryAndProducts = async () => {
            try {
                // Получаем подкатегорию
                const subcategoryResponse = await fetch(`http://localhost:5000/api/subcategory/single/${id}`);
                if (!subcategoryResponse.ok) {
                    throw new Error("Подкатегория не найдена");
                }
                const subcategoryData = await subcategoryResponse.json();
                setSubcategoryName(subcategoryData.name);
                setUnit(subcategoryData.unit);

                // Получаем товары
                const productsResponse = await fetch(`http://localhost:5000/api/product/subcategory/${id}`);
                if (!productsResponse.ok) {
                    throw new Error("Товары не найдены");
                }
                const productsData = await productsResponse.json();
                setProducts(productsData);
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
                setSubcategoryName("Ошибка загрузки");
            }
        };

        fetchSubcategoryAndProducts();
    }, [id]);

    const onClickCard = (productId) => {
        navigate(`/product/${productId}`);
    };

    const addToCart = async (product) => {
        if (!userId) {
            alert("Вы не авторизованы!");
            return;
        }
        console.log("Отправляем userId в корзину:", userId);
        try {
            const response = await fetch("http://localhost:5000/api/cart/add", {
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
                showNotification("Ошибка при добавлении товара.");
            }
        } catch (error) {
            console.error("Ошибка при добавлении товара в корзину:", error);
        }
    };

    return (
        <div className="body-page">
            <div className="name">
                <label>{subcategoryName}</label>
            </div>
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
                                    <label>{product.price.toLocaleString("ru-RU")} &#8381;/{unit}.</label>
                                </div>

                                <div className="black-text">
                                    <label>На складе: {product.stock} шт.</label>
                                </div>
                            </div>
                        </div>
                       
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Subcategory;
