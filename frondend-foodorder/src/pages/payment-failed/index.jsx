import React, { useEffect, useState } from 'react';
import { Result, Button, Typography } from 'antd';
import { FrownOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Text, Title } = Typography;

const PaymentFailed = () => {
    const location = useLocation();
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Lấy thông báo lỗi từ URL nếu có
        const params = new URLSearchParams(location.search);
        const error = params.get('error');
        if (error) {
            setErrorMessage(error);
        }
    }, [location]);

    return (
        <div style={{ padding: '50px 0', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
            <Result
                status="error"
                title="Thanh toán thất bại"
                subTitle="Đã xảy ra lỗi trong quá trình thanh toán của bạn."
                icon={<FrownOutlined />}
                extra={[
                    <Button type="primary" key="history">
                        <Link to="/history">Xem lịch sử đơn hàng</Link>
                    </Button>,
                    <Button key="home">
                        <Link to="/">Quay lại trang chủ</Link>
                    </Button>
                ]}
            />

            {errorMessage && (
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <Title level={5}>Chi tiết lỗi:</Title>
                    <Text type="danger">{errorMessage}</Text>
                </div>
            )}

            <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Text>
                    Bạn có thể thử lại sau hoặc liên hệ với chúng tôi nếu cần hỗ trợ.
                </Text>
            </div>
        </div>
    );
};

export default PaymentFailed; 