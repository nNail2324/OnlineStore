import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const district = [
        "Чекмагушевский", "Кушнаренковский", "Буздякский", 
        "Илишевский", "Бакалинский", "Благоварский",
        "Шаранский"
    ];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/category");
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Ошибка при загрузке категорий:", error);
            }
        };

        const fetchLocations = async () => {
            try {
                const res = await fetch("/api/locations");
                const data = await res.json();
                setLocations(data);
            } catch (error) {
                console.error("Ошибка при загрузке локаций:", error);
            }
        };

        fetchCategories();
        fetchLocations();

        // Автопереключение слайдов каждые 5 секунд
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev === 0 ? 1 : 0));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const onClickCategory = (image) => {
        navigate(`/category/${image}`);
    };

    return (
        <div className="body-page">
            {/* Баннер-слайдер */}
            <div className="banner-slider">
                {/* Слайд с каталогом */}
                <div 
                    className={`banner-slide ${currentSlide === 0 ? 'active' : ''}`}
                    style={{ backgroundImage: "url('../image/banner.jpg')" }}
                >
                    <div className="banner-overlay">
                        <label>Каталог товаров</label>
                    </div>
                </div>
                
                {/* Слайд с городами */}
                <div className={`banner-slide cities-slide ${currentSlide === 1 ? 'active' : ''}`}>
                    <div className="cities-content">
                        <div className="city-label">
                            <label>Доставка по районам</label>
                        </div>

                        <div className="cities-grid">
                            {district.map((city, index) => (
                                <div key={index} className="city-tag">{city}</div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Точки навигации */}
                <div className="banner-dots">
                    {[0, 1].map((index) => (
                        <button
                            key={index}
                            className={`banner-dot ${currentSlide === index ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
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
