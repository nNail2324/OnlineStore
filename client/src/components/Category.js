import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Category = () => {
    const { image } = useParams(); // Получаем image категории из URL
    const [categoryName, setCategoryName] = useState("");
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchCategoryAndProducts = async () => {
            try {
                // Получаем данные о категории по image
                const categoryResponse = await fetch(`http://localhost:5000/api/category/image/${image}`);
                if (!categoryResponse.ok) {
                    throw new Error("Категория не найдена");
                }
                const categoryData = await categoryResponse.json();
    
                setCategoryName(categoryData.name); // Устанавливаем название категории
    
                // Получаем товары по ID категории
                const productsResponse = await fetch(`http://localhost:5000/api/products/${categoryData.ID}`);
                if (!productsResponse.ok) {
                    throw new Error("Товары не найдены");
                }
                const productsData = await productsResponse.json();
                setProducts(productsData);
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
                setCategoryName("Ошибка загрузки");
            }
        };
    
        fetchCategoryAndProducts();
    }, [image]);

    return (
        <div className="body-page">
            <div className="name">
                <label>{categoryName}</label>
            </div>
            <div className="types">
                {products.map((product) => (
                    <div className="type" key={product.ID}>
                        <div className="orange-title">
                            <label>{product.name}</label>
                        </div>
                        <div className="black-title">
                            <label>{product.price} &#8381;</label>
                        </div>
                        <div className="left-row">
                            <div className="orange-button">
                                <button>Перейти</button>
                            </div>
                            <div className="add-button">
                                <button>+</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Category;