import React, { useState } from "react";
import { FaWhatsapp, FaTelegramPlane, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
    const [modalContent, setModalContent] = useState(null);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) { 
            closeModal();
        }
    };

    const openModal = (title, content) => {
        setModalContent({ title, content });
    };

    const closeModal = () => {
        setModalContent(null);
    };

    return (
        <>
            <footer className="footer">
                <div className="footer-column">
                    <div className="footer-title">
                        <label>Контактные данные</label>
                    </div>
                    <div className="contact-item">
                        <FaPhone className="icon" /> <span>+7 (987) 586-66-98</span>
                    </div>
                    <div className="contact-item">
                        <FaEnvelope className="icon" /> <span>ip-sharipov@bk.ru</span>
                    </div>
                    <div className="contact-item">
                        <FaMapMarkerAlt className="icon" /> <span>Чекмагуш, ул. Первомайская, 54</span>
                    </div>
                    <div className="contact-item">
                        <div className="network">
                            <div className="messenger" onClick={() => window.open('https://wa.me/+79875866698', '_blank')}>
                                <FaWhatsapp className="logo-react-description"/> <span>Whatsapp</span>
                            </div>

                            <div className="messenger" onClick={() => window.open('https://t.me/+79875866698', '_blank')}>
                                <FaTelegramPlane className="logo-react-description"/> <span>Telegram</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-column">
                    <div className="footer-title">
                        <label>Покупателям</label>
                    </div>
                    <div className="contact-item" onClick={() => openModal("О нас", 
                        "Мы работаем с 2008 года и знаем, какие материалы действительно нужны для строительства. " 
                        + "Здесь нет лишнего — только проверенные товары для ремонта дома, постройки бани или обустройства участка.")}>
                        <span>О нас</span>
                    </div>
                    <div className="contact-item" onClick={() => openModal("График работы", 
                        "Обеденный перерыв: 13:00-14:00\n"
                        + "Понедельник-Суббота: 9:00 - 18:00\n"
                        + "Воскресенье: выходной\n"
                        + "В праздничные дни уточнять информацию у продавцов")}>
                        <span>График работы</span>
                    </div>
                    <div className="contact-item" onClick={() => openModal("Доставка и оплата", 
                        "Доставка по селу Чекмагуш - бесплатная.\n Стоимости доставки можно посмотреть при оформлении заказа или уточняйть информацию у продавцов.\n\n"
                        + "Мы предлагаем несколько удобных способов оплаты:\n"
                        + "<strong>Банковская карта</strong> – принимаем Visa, MasterCard и Мир.\n"
                        + "<strong>Наличный расчет</strong> – возможен при получении заказа.\n"
                        + "<strong>Перевод на счет</strong> – реквизиты можно уточнить у продавца.")}>
                        <span>Доставка и оплата</span>
                    </div>
                </div>

                <div className="copyright">
                    <span>&copy; 2008-2025 ИП Шарипов Ирек Фларитович</span>
                </div>
            </footer>

            {modalContent && (
                <div className="modal" onClick={handleOverlayClick}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2 className="modal-title">{modalContent.title}</h2>
                        <p 
                            className="modal-text" 
                            dangerouslySetInnerHTML={{__html: modalContent.content.replace(/\n/g, '<br/>')}}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;
