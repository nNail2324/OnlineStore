import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AdminCategory = () => {
    const { image } = useParams();
    const [categoryName, setCategoryName] = useState("");
    const [subcategories, setSubcategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategoryAndSubcategories = async () => {
            try {
                console.log(`Запрашиваем данные категории: ${image}`);
    
                // Получаем категорию по image
                const categoryResponse = await fetch(`http://localhost:5000/api/category/image/${image}`);
                if (!categoryResponse.ok) throw new Error("Категория не найдена");
    
                const categoryData = await categoryResponse.json();
                console.log(`Категория найдена: ${categoryData.name} (ID: ${categoryData.ID})`);
    
                // Запрашиваем подкатегории с количеством товаров
                const subcategoriesUrl = `http://localhost:5000/api/subcategory/${categoryData.ID}`;
                console.log(`Запрос на подкатегории: ${subcategoriesUrl}`);
    
                const subcategoriesResponse = await fetch(subcategoriesUrl);
                if (!subcategoriesResponse.ok) throw new Error("Подкатегории не найдены");
    
                const subcategoriesData = await subcategoriesResponse.json();
                console.log(`Найдено подкатегорий: ${subcategoriesData.length}`);
    
                setCategoryName(categoryData.name);
                setSubcategories(subcategoriesData);
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
                setCategoryName("Ошибка загрузки");
            }
        };
    
        fetchCategoryAndSubcategories();
    }, [image]);
    
    const onClickSubcategory = (subcategoryId) => {
        navigate(`/subcategory/${subcategoryId}`);
    };

    return (
        <div className="body-page">
            <div className="left-row">
                <div className="name">
                    <label>{categoryName}</label>
                </div>

                <div className="white-button">
                    <button>Добавить товар</button>
                </div>
            </div>
            <div className="types">
                {subcategories.map((subcategory) => (
                    <div 
                        className="category" 
                        key={subcategory.ID} 
                        onClick={() => onClickSubcategory(subcategory.ID)}
                    >
                        <div className="category-title">
                            <label>{subcategory.name}</label>
                            <label>{subcategory.product_count}</label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminCategory;