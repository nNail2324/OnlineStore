import React, { useContext } from "react";
import Notification from "./Notification";
import { NotificationContext } from "../context/notification-context";

const NotificationWrapper = () => {
    const { notification, clearNotification } = useContext(NotificationContext);

    if (!notification) return null;

    return (
        <Notification
            message={notification.message}
            type={notification.type}
            onClose={clearNotification}
        />
    );
};

export default NotificationWrapper;
