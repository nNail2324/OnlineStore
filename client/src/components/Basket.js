import React from "react";

class Basket extends React.Component {
    constructor(props) {
        super(props);
        this.state = { count: 1 };
    }

    increment = () => {
        this.setState({ count: this.state.count + 1 });
    }

    decrement = () => {
        if (this.state.count > 1) {
            this.setState({ count: this.state.count - 1 });
        }
    }
    render() {
        return (
            <div className="body-page">
                <div className="name">
                    <label>Корзина</label>
                </div>
                <div className="types">
                    <div className="type">
                        <div className="orange-title">
                            <label>Уголок стальной 25x25</label>
                        </div>
                        <div className="black-title">
                            <label>120 руб./м</label>
                        </div>
                        <div className="quantity-button">
                            <button id="plus" onClick={this.increment}>+</button>
                            <input type="text" placeholder="1" id="print" value={this.state.count}/>
                            <button id="minus" onClick={this.decrement}>-</button>
                        </div>
                        <div className="left-row">
                            <div className="orange-button">
                                <button>Перейти</button>
                            </div>
                            <div className="add-button">
                                <button>&times;</button>
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
                        <div className="quantity-button">
                            <button id="plus" onClick={this.increment}>+</button>
                            <input type="text" placeholder="1" id="print" value={this.state.count}/>
                            <button id="minus" onClick={this.decrement}>-</button>
                        </div>
                        <div className="left-row">
                            <div className="orange-button">
                                <button>Перейти</button>
                            </div>
                            <div className="add-button">
                                <button>&times;</button>
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
                        <div className="quantity-button">
                            <button id="plus">+</button>
                            <input type="text" placeholder="1" id="print" />
                            <button id="minus">-</button>
                        </div>
                        <div className="left-row">
                            <div className="orange-button">
                                <button>Перейти</button>
                            </div>
                            <div className="add-button">
                                <button>&times;</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="char">
                    <div className="column">
                        <div className="product-desc">
                            <div>
                                <div className="black-title">
                                    <label>Адрес доставки</label>
                                </div>
                                <div className="black-text">
                                    <label>с. Чекмагуш, ул. Луговая, д. 6</label>
                                </div>
                            </div>
                            <div>
                                <div className="black-title">
                                    <label>Тип доставки</label>
                                </div>
                                <div className="black-text">
                                    <label>Самовывоз</label>
                                </div>
                            </div>
                            
                        </div>
                    <div className="product-desc" style={{textAlign: "right"}}>
                            <div>
                                <div className="black-title">
                                    <label>Общая сумма к оплате</label>
                                </div>
                                <div className="black-text">
                                    <label>3750 &#8381;</label>
                                </div>
                            </div>
                    </div>
                    </div>
                </div>
                <div className="right-row">
                    <div className="black-text">
                        <label>Наличными</label>
                    </div>
                    <div className="white-button">
                        <button>Заказать</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Basket;
