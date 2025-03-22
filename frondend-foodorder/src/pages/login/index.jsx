import { Button, Divider, Form, Input, message, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { callForgotPassword, callLogin } from '../../services/api';
import './login.scss';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { doLoginAction } from '../../redux/account/accountSlice';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Lock, Mail } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        const { username, password } = values;
        setIsSubmit(true);
        const res = await callLogin(username, password);
        setIsSubmit(false);
        if (res?.data) {
            localStorage.setItem('access_token', res.data.access_token);
            dispatch(doLoginAction(res.data.user));
            message.success('Đăng nhập tài khoản thành công!');
            localStorage.setItem("isAuthenticated", "true");
            // localStorage.setItem("user", JSON.stringify(res.data.user));
            navigate('/');
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 5,
            });
        }
    };

    const handleForgotPassword = async () => {
        const email = prompt('Nhập email của bạn để đặt lại mật khẩu:');
        if (!email) return;

        const res = await callForgotPassword(email);
        if (res) {
            message.success('Kiểm tra email để đặt lại mật khẩu!');
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message || 'Không thể gửi email!',
                duration: 5,
            });
        }
    };

    const handleGoogleLoginSuccess = async (response) => {
        try {
            const res = await fetch('http://localhost:8080/api/v1/auth/google-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.credential }),
            });

            const data = await res.json();
            if (data?.data.access_token) {
                localStorage.setItem('access_token', data.data.access_token);
                dispatch(doLoginAction(data.data.user));
                message.success('Đăng nhập bằng Google thành công!');
                localStorage.setItem("isAuthenticated", "true");
                // localStorage.setItem("user", JSON.stringify(data.data.user));
                navigate('/');
            } else {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            notification.error({
                message: 'Đăng nhập thất bại',
                description: error.message,
                duration: 5,
            });
        }
    };

    return (
        <GoogleOAuthProvider clientId="454969516364-5j0vmvl2ghh1rie2klb543o6kj8vh90j.apps.googleusercontent.com">
            <div className="login-page">
                <main className="main">
                    <div className="container">
                        <section className="wrapper">
                            <div className="logo-container">
                                <div size={48} className="food-icon" />
                            </div>
                            <div className="heading">
                                <h2 className="text text-large">Chào mừng bạn trở lại!</h2>
                                <p className="text-subtitle">Đăng nhập để đặt món ăn yêu thích của bạn</p>
                                <Divider />
                            </div>
                            <Form
                                name="basic"
                                onFinish={onFinish}
                                autoComplete="off"
                                layout="vertical"
                                className="login-form"
                            >
                                <Form.Item
                                    label="Email"
                                    name="username"
                                    rules={[{ required: true, message: 'Email không được để trống!' }]}
                                >
                                    <Input
                                        prefix={<Mail size={16} className="site-form-item-icon" />}
                                        placeholder="Nhập email của bạn"
                                        className="input-field"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Mật khẩu"
                                    name="password"
                                    rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                                >
                                    <Input.Password
                                        prefix={<Lock size={16} className="site-form-item-icon" />}
                                        placeholder="Nhập mật khẩu"
                                        className="input-field"
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isSubmit}
                                        className="login-button"
                                        block
                                    >
                                        Đăng nhập ngay
                                    </Button>
                                </Form.Item>

                                <Divider>Hoặc tiếp tục với</Divider>

                                <div className="google-login-container">
                                    <GoogleLogin
                                        onSuccess={handleGoogleLoginSuccess}
                                        onError={() => message.error('Đăng nhập Google thất bại')}
                                        shape="pill"
                                    />
                                </div>

                                <div className="action-links">
                                    <p className="text text-normal">
                                        Chưa có tài khoản?
                                        <Link to="/register" className="register-link"> Đăng ký ngay </Link>
                                    </p>
                                    <p className="text text-normal">
                                        Quên mật khẩu?
                                        <span onClick={handleForgotPassword} className="reset-link"> Đặt lại </span>
                                    </p>
                                </div>

                                <div className="demo-account">
                                    <p className="text-tip">
                                        Để trải nghiệm nhanh, hãy đăng nhập với: guest@gmail.com/123456
                                    </p>
                                </div>
                            </Form>
                        </section>
                    </div>
                </main>
            </div>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;