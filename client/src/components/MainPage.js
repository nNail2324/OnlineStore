import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import brick from "../image/brick.png";
import cement from "../image/cement.png";
import profile from "../image/profile.png";
import armature from "../image/armature.png";
import sand from "../image/sand.png";
import corner from "../image/corner.png";
import block from "../image/block.png";

const images = {
    brick,
    cement,
    profile,
    armature,
    sand,
    corner,
    block,
};

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

    const handleCategoryClick = (name) => {
        navigate(`/category/${name}`);
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
                        key={category.id} 
                        onClick={() => handleCategoryClick(category.image)} 
                    >
                        <img src={images[category.image]} alt={category.name} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MainPage;
