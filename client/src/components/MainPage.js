import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import sheet_materials from "../image/sheet_materials.png";
import bulk_mixtures from "../image/bulk_mixtures.png";
import metal_meterials from "../image/metal_meterials.png";
import wall_materials from "../image/wall_materials.png";
import reinforced_concrete from "../image/reinforced_concrete.png";

const images = {
    sheet_materials,
    bulk_mixtures,
    metal_meterials,
    wall_materials,
    reinforced_concrete,
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
                            {/* <img src={images[category.image]} alt={category.name} /> */}
                            <label>{category.name}</label>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default MainPage;
