import React, { useEffect } from "react";

const Notification = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Автоматически закрыть через 3 сек

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`notification`}>
            <span>{message}</span>
        </div>
    );
};

export default Notification;
