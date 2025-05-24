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
        } else {
            console.log("Token received:", token.substring(0, 10) + "...");
        }
    }, [token, navigate]);

    const onFinish = async (values) => {
        console.log("Submitting with token:", token.substring(0, 10) + "...");
        setIsSubmitting(true);

        try {
            const res = await callResetPassword(token, values.newPassword);
            console.log("API Response:", res);

            if (res === 'Đặt lại mật khẩu thành công!') {
                message.success('Đặt lại mật khẩu thành công! Hãy đăng nhập.');
                navigate('/login');
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: res?.message || 'Không thể đặt lại mật khẩu!',
                    duration: 5,
                });
            }
        } catch (error) {
            console.error("Reset password error:", error);

            const errorMsg = error.response?.data || 'Token không hợp lệ hoặc đã hết hạn!';
            notification.error({
                message: 'Lỗi xác thực',
                description: errorMsg,
                duration: 5,
            });

            // Redirect to login after a delay
            setTimeout(() => {
                message.info('Chuyển hướng về trang đăng nhập...');
                navigate('/login');
            }, 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="reset-password-container" style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div className="form-container">
                <h2>Đặt lại mật khẩu</h2>
                <Form
                    name="reset-password-form"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới của bạn" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isSubmitting}
                            block
                        >
                            Xác nhận
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default ResetPassword;
