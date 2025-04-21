import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/category");
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Ошибка при загрузке категорий:", error);
            }
        };

        fetchCategories();
    }, []);

    const onClickCategory = (image) => {
        navigate(`/category/${image}`);
    };

    return (
        <div className="body-page">
            <div className="banner">
                <label>Каталог товаров</label>
            </div>
            <div className="products">
                {categories.map((category) => (
                    <div
                        className="item"
                        key={category.ID}
                        onClick={() => onClickCategory(category.image)}
                    >
                        <div className="center-row">
                            <label>{category.name}</label>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default MainPage;
