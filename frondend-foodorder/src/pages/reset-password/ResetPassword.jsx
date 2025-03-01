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
        <div className="reset-password-container">
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
