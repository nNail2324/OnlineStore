import React, { Component } from "react";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            phone_number: "",
            password: ""
        };
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = (event) => {
        event.preventDefault();
        console.log("Отправка данных:", this.state);
    };

    render() {
        return (
            <div className="body-page">
                <div className="authentication">
                    <div className="name">
                        <label>Вход</label>
                    </div>
                    <form className="form-authentication" onSubmit={this.handleSubmit}>
                        <label htmlFor="phone_number">Номер телефона</label>
                        <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            placeholder="+7*********"
                            value={this.state.phone_number}
                            onChange={this.handleChange}
                        />

                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Не менее 8 знаков"
                            value={this.state.password}
                            onChange={this.handleChange}
                        />

                        <div className="center-row">
                            <div className="orange-button">
                                <button type="submit">Войти</button>
                            </div>
                        </div>
                    </form>

                    <div className="center-row">
                        <div className="black-text">
                            <label>Зарегистрироваться</label>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
