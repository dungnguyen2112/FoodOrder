import React, { useCallback, useEffect, useState, useMemo, memo } from 'react';
import { RobotOutlined, SendOutlined, CloseOutlined } from '@ant-design/icons';
import { Input, Button, Spin } from 'antd';
import axios from 'axios';

const Chatbot = memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { text: 'Xin chào! Tôi có thể giúp gì cho bạn?', sender: 'bot' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = React.useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:8080/api/v1/chat",
                { prompt: input },
                { headers: { "Content-Type": "application/json" } }
            );

            setMessages(prev => [...prev, { text: response.data, sender: 'bot' }]);
        } catch (error) {
            console.error('Error fetching response:', error);
            setMessages(prev => [...prev, {
                text: 'Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.',
                sender: 'bot'
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [input]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    }, [handleSendMessage]);

    const styles = useMemo(() => ({
        container: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#ff4d4f',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1001,
            transition: 'all 0.3s ease',
        },
        chatInterface: {
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '350px',
            height: '500px',
            borderRadius: '12px',
            backgroundColor: 'white',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }
    }), []);

    return (
        <>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={styles.container}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
            >
                <RobotOutlined style={{ fontSize: '28px' }} />
            </div>

            {isOpen && (
                <div style={styles.chatInterface}>
                    {/* Chat Header */}
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#ff4d4f',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <RobotOutlined style={{ fontSize: '20px' }} />
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Trợ lý ảo</span>
                        </div>
                        <CloseOutlined
                            onClick={() => setIsOpen(false)}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>

                    {/* Chat Messages */}
                    <div style={{
                        flex: 1,
                        padding: '15px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        backgroundColor: '#f7f7f7'
                    }}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    backgroundColor: msg.sender === 'user' ? '#ff4d4f' : 'white',
                                    color: msg.sender === 'user' ? 'white' : 'black',
                                    padding: '10px 15px',
                                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    maxWidth: '75%',
                                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                                    wordBreak: 'break-word'
                                }}
                            >
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{
                                alignSelf: 'flex-start',
                                backgroundColor: 'white',
                                padding: '10px 15px',
                                borderRadius: '18px 18px 18px 4px',
                                maxWidth: '75%',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                            }}>
                                <Spin size="small" /> Đang nhập...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div style={{
                        padding: '15px',
                        borderTop: '1px solid #e8e8e8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: 'white'
                    }}>
                        <Input
                            placeholder="Nhập tin nhắn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{ flex: 1, borderRadius: '20px', padding: '10px 15px' }}
                            disabled={isLoading}
                        />
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSendMessage}
                            style={{
                                backgroundColor: '#ff4d4f',
                                borderColor: '#ff4d4f',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 0
                            }}
                            disabled={isLoading || !input.trim()}
                        />
                    </div>
                </div>
            )}
        </>
    );
});

export default Chatbot; 