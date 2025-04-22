import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/auth-context";
import { NotificationContext } from "../context/notification-context";
import { useNavigate } from "react-router-dom";

import { VscAccount, VscHeart, VscAdd } from "react-icons/vsc";

let debounceTimeout;

const AdminHeader = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phone_number: ""
    });

    const [formStatus, setFormStatus] = useState(null);

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

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const { name, phone_number } = formData;
        if (!name || !phone_number) {
            showNotification("Пожалуйста, заполните все поля");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            showNotification(data.message);

            if (res.ok) {
                setFormData({ name: "", phone_number: "" });
                setTimeout(() => setShowModal(false), 1500);
            }
        } catch (err) {
            showNotification("Ошибка при отправке заявки");
        }
    };

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

    return (
        <>
            <header className="header">
                <div className="logo-text" onClick={() => navigate("/")}>
                    <label className="company-title">ИП Шарипов</label>
                    <label className="company-name">стройматериалы</label>
                </div>

                <div className="header-right">
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

                    <div className="white-button">
                        <button>Заявки</button>
                    </div>

                    <div className="white-button">
                        <button>Пользователи</button>
                    </div>

                    <div className="logo-button">
                        <VscHeart className="logo-from-react" onClick={() => navigate("/favorite")} />
                    </div>

                    <div className="logo-button">
                        {isAuthenticated ? (
                            <VscAccount className="logo-from-react" onClick={() => navigate("/profile")} />
                        ) : (
                            <VscAdd className="logo-from-react" onClick={() => navigate("/auth")} />
                        )}
                    </div>
                </div>
            </header>

            {showModal && (
                <div className="request-modal-overlay">
                    <div className="request-modal-container">
                        <span className="request-modal-close" onClick={() => setShowModal(false)}>&times;</span>
                        <div className="black-title">
                            <label>Оставить заявку</label>
                        </div>
                        <form className="request-modal-form" onSubmit={handleFormSubmit}>
                            <input
                                type="text"
                                placeholder="Ваше имя"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Телефон"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            />
                            <div className="right-row">
                                <div className="orange-button">
                                    <button type="submit">Отправить</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminHeader;
