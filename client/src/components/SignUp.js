import React, { Component } from "react";
import { useHttp  } from "../hooks/http";

class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            phone_number: "",
            password: "",
            confirm_password: "",
            surname: "",
            name: "",
            city: "",
            street: "",
            house_number: "",
        };
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        return (
            <div className="body-page">
                <div className="authentication">
                    <div className="name">
                        <label>Регистрация</label>
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
                            placeholder="Пароли должны совпадать"
                            value={this.state.password}
                            onChange={this.handleChange}
                        />

                        <label htmlFor="confirm_password">Повторите пароль</label>
                        <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            placeholder="Пароли должны совпадать"
                            value={this.state.confirm_password}
                            onChange={this.handleChange}
                        />

                        <label htmlFor="surname">Фамилия</label>
                        <input
                            type="text"
                            id="surname"
                            name="surname"
                            placeholder="Используйте русские буквы"
                            value={this.state.surname}
                            onChange={this.handleChange}
                        />

                        <label htmlFor="name">Имя</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Используйте русские буквы"
                            value={this.state.name}
                            onChange={this.handleChange}
                        />

                        <label htmlFor="city">Город/Населенный пункт</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            placeholder="Используйте русские буквы"
                            value={this.state.city}
                            onChange={this.handleChange}
                        />

                        <label htmlFor="street">Улица</label>
                        <input
                            type="text"
                            id="street"
                            name="street"
                            placeholder="Используйте русские буквы"
                            value={this.state.street}
                            onChange={this.handleChange}
                        />

                        <label htmlFor="house_number">Номер дома</label>
                        <input
                            type="text"
                            id="house_number"
                            name="house_number"
                            placeholder="Используйте русские буквы"
                            value={this.state.house_number}
                            onChange={this.handleChange}
                        />

                        <div className="center-row">
                            <div className="orange-button">
                                <button type="submit">Зарегистрироваться</button>
                            </div>
                        </div>
                    </form>

                    <div className="center-row">
                        <div className="black-text">
                            <label>Войти</label>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default SignUp;