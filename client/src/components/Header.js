import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/auth-context";
import { NotificationContext } from "../context/notification-context";
import { useNavigate } from "react-router-dom";
import { VscAccount, VscHeart, VscAdd, VscCallIncoming } from "react-icons/vsc";
import { BsBasket  } from "react-icons/bs";


const Header = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const navigate = useNavigate();
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);

    const [searchValue, setSearchValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone_number: ""
    });

    const debounceTimeout = useRef(null);

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
        setSuggestions([]);
        navigate(`/search?q=${encodeURIComponent(name)}`);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const { name, phone_number } = formData;
        if (!name || !phone_number) {
            showNotification("Пожалуйста, заполните все поля");
            return;
        }

        try {
            const res = await fetch("/api/request/create", {
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
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!searchValue.trim()) {
            setSuggestions([]);
            return;
        }

        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/product/suggest?q=${encodeURIComponent(searchValue)}`
                );
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error("Ошибка при получении подсказок:", err);
            }
        }, 300);

        return () => clearTimeout(debounceTimeout.current);
    }, [searchValue]);

    return (
        <>
            <header className="header">
                <div className="logo-text" onClick={() => navigate("/")}>
                    <label className="company-title">ИП Шарипов</label>
                    <label className="company-name">стройматериалы</label>
                </div>

                <div className="mobile-buttons">
                    <div className="mobile-button">
                        <VscCallIncoming 
                            className="logo-from-react"
                            onClick={() => setShowModal(true)} 
                        />
                    </div>

                    <div className="mobile-button">
                        <BsBasket  
                            className="logo-from-react" 
                            onClick={() => navigate("/basket")}
                        />
                    </div>

                    <div className="mobile-button">
                        <VscHeart 
                            className="logo-from-react" 
                            onClick={() => navigate("/favorite")} 
                        />
                    </div>

                    <div className="mobile-button">
                        {isAuthenticated ? (
                            <VscAccount 
                                className="logo-from-react" 
                                onClick={() => navigate("/profile")} 
                            />
                        ) : (
                            <VscAdd 
                                className="logo-from-react" 
                                onClick={() => navigate("/auth")} 
                            />
                        )}
                    </div>
                </div>

                <div className="header-right">
                    <div className="search" ref={searchRef}>
                        <input
                            type="text"
                            placeholder="Поиск"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onFocus={() => searchValue.trim() && setSuggestions(suggestions)}
                        />

                        {searchValue && (
                            <span 
                                className="clear-icon" 
                                onClick={() => {
                                    setSearchValue("");
                                    setSuggestions([]);
                                }}
                            >
                                &times;
                            </span>
                        )}

                        <button onClick={handleSearch}>Найти</button>

                        {suggestions.length > 0 && (
                            <ul 
                                className="suggestions-list"
                                ref={suggestionsRef}
                            >
                                {suggestions.map((item) => (
                                    <li 
                                        key={item.ID} 
                                        onClick={() => handleSuggestionClick(item.name)}
                                    >
                                        {item.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="header-button">
                        <button onClick={() => setShowModal(true)}>Оставить заявку</button>
                    </div>

                    <div className="header-button">
                        <button
                            onClick={() => {
                                if (isAuthenticated) {
                                    navigate("/basket");
                                } else {
                                    showNotification("Требуется авторизация!");
                                }
                            }}
                        >
                            Корзина
                        </button>
                    </div>

                    <div className="logo-button">
                        <VscHeart 
                            className="logo-from-react" 
                            onClick={() => {
                                if (isAuthenticated) {
                                    navigate("/favorite");
                                } else {
                                    showNotification("Требуется авторизация!");
                                }
                            }}
                        />
                    </div>

                    <div className="logo-button">
                        {isAuthenticated ? (
                            <VscAccount 
                                className="logo-from-react" 
                                onClick={() => navigate("/profile")} 
                            />
                        ) : (
                            <VscAdd 
                                className="logo-from-react" 
                                onClick={() => navigate("/auth")} 
                            />
                        )}
                    </div>
                </div>
            </header>

            {showModal && (
                <div className="request-modal-overlay">
                    <div className="request-modal-container">
                        <span 
                            className="request-modal-close" 
                            onClick={() => setShowModal(false)}
                        >
                            &times;
                        </span>
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

export default Header;