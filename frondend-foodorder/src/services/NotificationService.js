import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const useNotification = (username) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Kết nối WebSocket với server Spring Boot
        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            // Đăng ký kênh nhận thông báo riêng của admin
            stompClient.subscribe(`/user/${username}/notify`, (message) => {
                const newNotification = JSON.parse(message.body);
                setNotifications((prev) => [newNotification, ...prev]);
            });
        });

        return () => {
            if (stompClient) stompClient.disconnect();
        };
    }, [username]);

    return notifications;
};

export default useNotification;
