import React, { createContext, useState, useCallback } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message) => {
        setNotification({ message});
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    }, []);

    const clearNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return (
        <NotificationContext.Provider value={{ notification, showNotification, clearNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
