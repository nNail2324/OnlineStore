import React from "react";
import { VscAccount } from "react-icons/vsc";
import { VscHeart } from "react-icons/vsc";
import { FaTruckArrowRight } from "react-icons/fa6";
import { VscAdd } from "react-icons/vsc";

class Header extends React.Component {
    
    render() {
        const { isAuthenticated } = this.props

        return (
                 <header className="header">
                    <div className="logo-search">
                        <div className="logo">
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
                                    <button>Корзина</button>
                            </div>
                            <div className="logo-button">
                                    <VscHeart className="logo-from-react"/>
                            </div>
                            <div className="logo-button">
                                {isAuthenticated ? (
                                    <VscAccount className="logo-from-react" />
                                ) : (
                                    <VscAdd className="logo-from-react" />
                                )}
                        </div>
                        </div>
                </header>
        );
    }
}

export default Header;
