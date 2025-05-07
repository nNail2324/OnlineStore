import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

let debounceTimeout;

const AdminMainPage = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);

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

    useEffect(() => {
        if (!searchValue.trim()) {
            setSuggestions([]);
            return;
        }

        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/product/suggest?q=${encodeURIComponent(searchValue)}`);
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error("Ошибка при получении подсказок:", err);
            }
        }, 300);
    }, [searchValue]);

    const onClickCategory = (image) => {
        navigate(`/category/${image}`);
    };

    const handleSearch = () => {
        if (searchValue.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
            setSuggestions([]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleSuggestionClick = (name) => {
        setSearchValue(name);
        navigate(`/search?q=${encodeURIComponent(name)}`);
        setSuggestions([]);
    };

    return (
        <div className="body-page">
            <div className="title-row">
                <div className="name">
                    <label>Категории</label>
                </div>
                <div className="search">
                    <input
                        type="text"
                        placeholder="Поиск"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />

                    {searchValue && (
                        <span className="clear-icon" onClick={() => {
                            setSearchValue("");
                            setSuggestions([]);
                        }}>
                            &times;
                        </span>
                    )}

                    <button onClick={handleSearch}>Найти</button>

                    {suggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {suggestions.map((item) => (
                                <li key={item.ID} onClick={() => handleSuggestionClick(item.name)}>
                                    {item.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="types">
                {categories.map((category) => (
                    <div
                        className="category"
                        key={category.ID}
                        onClick={() => onClickCategory(category.image)}
                    >
                        <div className="black-title">
                            <label>{category.name}</label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminMainPage;