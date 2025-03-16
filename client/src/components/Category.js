import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Category = () => {
    const { name } = useParams(); // Получаем параметр из URL
    const [categoryName, setCategoryName] = useState("");

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                // Получаем все категории
                const response = await fetch("http://localhost:5000/api/category");
                const data = await response.json();

                // Находим категорию по совпадению с image
                const foundCategory = data.find((category) => category.image === name);

                if (foundCategory) {
                    setCategoryName(foundCategory.name); // Устанавливаем название категории
                } else {
                    setCategoryName("Категория не найдена");
                }
            } catch (error) {
                console.error("Ошибка при загрузке категории:", error);
                setCategoryName("Ошибка загрузки");
            }
        };

        fetchCategory();
    }, [name]);

    return (
        <div className="body-page">
            <div className="name">
                <label>{categoryName}</label>
            </div>
            <div className="types">
                <div className="type">
                    <div className="orange-title">
                        <label>Уголок стальной 25x25</label>
                    </div>
                    <div className="black-title">
                        <label>120 руб./м</label>
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
                <div className="type">
                    <div className="orange-title">
                        <label>Уголок стальной 25x25</label>
                    </div>
                    <div className="black-title">
                        <label>120 руб./м</label>
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
                <div className="type">
                    <div className="orange-title">
                        <label>Уголок стальной 25x25</label>
                    </div>
                    <div className="black-title">
                        <label>120 руб./м</label>
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
            </div>
        </div>
    )
}

export default Category;
