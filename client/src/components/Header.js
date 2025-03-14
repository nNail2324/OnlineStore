import React, { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { useNavigate } from "react-router-dom";

import { VscAccount } from "react-icons/vsc";
import { VscHeart } from "react-icons/vsc";
import { FaTruckArrowRight } from "react-icons/fa6";
import { VscAdd } from "react-icons/vsc";

const Header = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const onClickLogo = () => {
        navigate("/")
    }

    const onClickBasket = () => {
        navigate("/basket")
    }

    const onClickFavorite = () => {
        navigate("/favorite")
    }

    const onClickProfile = () => {
        navigate("/profile")
    }

    const onClickAuth = () => {
        navigate("/auth")
    }

    return (
        <header className="header">
            <div className="logo-search">
                <div className="logo" onClick={onClickLogo}>
                    <FaTruckArrowRight className="logo-react"/>
                    <label>стройматериалы</label>
                </div>
                <div className="search">
                    <input type="text" placeholder="Поиск" />
                </div>
            </div>
            <div className="center-row">
                <div className="orange-button">
                    <button>Обратная связь</button>
                </div>
                    <div className="orange-button">
                            <button onClick={onClickBasket}>Корзина</button>
                    </div>
                    <div className="logo-button">
                            <VscHeart className="logo-from-react" onClick={onClickFavorite} />
                    </div>
                    <div className="logo-button">
                        {isAuthenticated ? (
                            <VscAccount className="logo-from-react" onClick={onClickProfile} />
                        ) : (
                            <VscAdd className="logo-from-react" onClick={onClickAuth} />
                        )}
                </div>
                </div>
        </header>
    )
  }
  
  export default Header;

