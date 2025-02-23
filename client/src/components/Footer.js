import React from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";

import whatsapp from '../image/whatsapp.svg'
import telegram from '../image/telegram.svg'

class Footer extends React.Component {
    render() {
        return (
            <footer className="footer">
                <div className="description">
                    <label>КОНТАКТНЫЕ ДАННЫЕ</label>
                </div>
                <div className="network">
                    <FaWhatsapp className="logo-react-description"/>
                    <FaTelegramPlane className="logo-react-description"/>
                </div>
            </footer>
        );
    }
}

export default Footer;
