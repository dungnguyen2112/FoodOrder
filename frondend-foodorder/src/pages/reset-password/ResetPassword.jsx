import { Button, Form, Input, message, notification } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { callResetPassword } from '../../services/api';
import './reset-password.scss';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            message.error('Token không hợp lệ!');
            navigate('/login');
        }
    }, [token, navigate]);

    const onFinish = async (values) => {
        setIsSubmitting(true);
        const res = await callResetPassword(token, values.newPassword);
        setIsSubmitting(false);

        if (res) {
            message.success('Đặt lại mật khẩu thành công! Hãy đăng nhập.');
            navigate('/login');
        } else {
            notification.error({
                message: 'Lỗi',
                description: res.message || 'Không thể đặt lại mật khẩu!',
                duration: 5,
            });
        }
    };

    return (
        <div className="reset-password-container" style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
        }}>
            <h2>Đặt lại mật khẩu</h2>
            <Form onFinish={onFinish}>
                <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Nhập mật khẩu mới!' }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                        Xác nhận
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ResetPassword;
