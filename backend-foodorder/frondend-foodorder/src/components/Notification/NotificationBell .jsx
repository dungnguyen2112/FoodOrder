import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "./NotificationBell.scss";

const NotificationBell = ({ username }) => { // Nhận username từ props
    const [notifications, setNotifications] = useState([]);
    const user = useSelector(state => state.account.user);

    useEffect(() => {
        if (!username) return; // Kiểm tra nếu không có username thì thoát

        // Tạo WebSocket kết nối
        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(str), // Debug thông tin WebSocket
            reconnectDelay: 5000, // Tự động reconnect sau 5s nếu mất kết nối
            onConnect: () => {
                console.log("🔗 STOMP Connected!");

                // Đăng ký nhận tin nhắn từ kênh cá nhân
                stompClient.subscribe(`/user/${username}/notify`, (message) => {
                    console.log("📩 Nhận thông báo mới:", message.body);
                    const newNotification = JSON.parse(message.body);
                    setNotifications((prev) => [newNotification, ...prev]);
                });
            },
            onDisconnect: () => console.log("❌ STOMP Disconnected"),
        });


        stompClient.activate(); // Kích hoạt kết nối STOMP

        return () => {
            if (stompClient.active) {
                stompClient.deactivate(); // Ngắt kết nối STOMP
            }
        };
    }, [username]);

    return (
        <div>
            <h3>Thông báo</h3>
            <ul>
                {notifications.map((notif, index) => (
                    <li key={index}>{notif.message}</li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationBell;
