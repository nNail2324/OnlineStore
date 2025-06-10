import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AdminCategory = () => {
    const { image } = useParams();
    const [categoryName, setCategoryName] = useState("");
    const [categoryId, setCategoryId] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [newSubcategoryName, setNewSubcategoryName] = useState("");
    const [newSubcategoryUnit, setNewSubcategoryUnit] = useState("");
    const navigate = useNavigate();

    const units = ["шт", "кг", "т", "м", "м²"];

    useEffect(() => {
        const fetchCategoryAndSubcategories = async () => {
            try {
                const categoryResponse = await fetch(`/api/category/image/${image}`);
                if (!categoryResponse.ok) throw new Error("Категория не найдена");

                const categoryData = await categoryResponse.json();
                setCategoryName(categoryData.name);
                setCategoryId(categoryData.ID);

                const subcategoriesResponse = await fetch(`/api/subcategory/${categoryData.ID}`);
                if (!subcategoriesResponse.ok) throw new Error("Подкатегории не найдены");

                const subcategoriesData = await subcategoriesResponse.json();
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

    const onAddSubcategory = async () => {
        if (!newSubcategoryName || !newSubcategoryUnit) {
            alert("Пожалуйста, заполните все поля");
            return;
        }

        try {
            const response = await fetch("/api/subcategory/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category_id: categoryId,
                    name: newSubcategoryName,
                    unit: newSubcategoryUnit
                })
            });

            if (!response.ok) throw new Error("Ошибка при создании подкатегории");

            const newSubcategory = await response.json();
            alert("Подкатегория добавлена!");

            setNewSubcategoryName("");
            setNewSubcategoryUnit("");

            // Обновляем список подкатегорий
            const updatedResponse = await fetch(`/api/subcategory/${categoryId}`);
            const updatedData = await updatedResponse.json();
            setSubcategories(updatedData);
        } catch (error) {
            console.error("Ошибка при добавлении подкатегории:", error);
        }
    };

    const onDeleteSubcategory = async (subcategoryId, e) => {
        e.stopPropagation(); // Предотвращаем всплытие события, чтобы не срабатывал onClickSubcategory
        
        if (!window.confirm("Вы уверены, что хотите удалить эту подкатегорию?")) {
            return;
        }

        try {
            const response = await fetch(`/api/subcategory/${subcategoryId}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Ошибка при удалении подкатегории");

            alert("Подкатегория удалена!");
            
            // Обновляем список подкатегорий
            const updatedResponse = await fetch(`/api/subcategory/${categoryId}`);
            const updatedData = await updatedResponse.json();
            setSubcategories(updatedData);
        } catch (error) {
            console.error("Ошибка при удалении подкатегории:", error);
            alert("Не удалось удалить подкатегорию");
        }
    };

    return (
        <div className="body-page">
            <div className="title-row">
                <div className="name">
                    <label>{categoryName}</label>
                </div>
            </div>

            <div className="type">
                <div className="black-title">
                    <label>Подкатегория</label>
                </div>

                <div className="admin-form">
                    <input
                        type="text"
                        placeholder="Название подкатегории"
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                    />
                    <select
                        value={newSubcategoryUnit}
                        onChange={(e) => setNewSubcategoryUnit(e.target.value)}
                    >
                        <option value="">Выберите единицу измерения</option>
                        {units.map((unit) => (
                            <option key={unit} value={unit}>
                                {unit}
                            </option>
                        ))}
                    </select>
                    <div className="admin-button">
                        <button onClick={onAddSubcategory}>Добавить</button>
                    </div>
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
                        <div className="white-button">
                            <button onClick={(e) => onDeleteSubcategory(subcategory.ID, e)}>Удалить</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminCategory;