import React, { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const onClickLogout = () => {
        logout()
        navigate("/auth")
    }

    return(
        <div className="body-page">
                <div className="name">
                    <label>Личные данные</label>
                </div>
                <div className="char">
                    <div className="left-row">
                        <div className="title">
                            <label>Шарипов Наиль</label>
                        </div>
                        <div className="white-button">
                            <button onClick={onClickLogout}>Выйти</button>
                        </div>
                    </div>
                    <div className="product-desc">
                        <div className="black-title">
                            <label>Номер телефона:</label>
                        </div>
                        <div className="black-title">
                            <label>Электронная почта:</label>
                        </div>
                        <div className="black-title">
                            <label>Город/Населенный пункт:</label>
                        </div>
                        <div className="black-title">
                            <label>Улица:</label>
                        </div>
                        <div className="black-title">
                            <label>Дом:</label>
                        </div>
                    </div>
                    <div className="left-row">
                        <div className="white-button">
                            <button>Редактировать</button>
                        </div>
                        <div className="white-button">
                            <button>Изменить пароль</button>
                        </div>
                    </div>
                </div>
                
                <div className="char">
                    <div className="title">
                        <label>Мои заказы</label>
                    </div>
                    <div className="products">
                        <div className="order-item">
                            <div className="black-title">
                                <label>09.09.2023</label>
                            </div>
                            <div className="title">
                                <label>647</label>
                            </div>
                            <div className="orange-title">
                                <label>Доставлен</label>
                            </div>
                        </div>
                        <div className="order-item">
                            <div className="black-title">
                                <label>14.11.2024</label>
                            </div>
                            <div className="title">
                                <label>589</label>
                            </div>
                            <div className="orange-title">
                                <label>Доставлен</label>
                            </div>
                        </div>
                        <div className="order-item">
                            <div className="black-title">
                                <label>17.11.2024</label>
                            </div>
                            <div className="title">
                                <label>346</label>
                            </div>
                            <div className="orange-title">
                                <label>Доставлен</label>
                            </div>
                        </div>
                        <div className="order-item">
                            <div className="black-title">
                                <label>25.12.2024</label>
                            </div>
                            <div className="title">
                                <label>312</label>
                            </div>
                            <div className="orange-title">
                                <label>В пути</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default Profile;
