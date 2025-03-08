import { Button, Divider, Form, Input, message, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { callForgotPassword, callLogin } from '../../services/api';
import './login.scss';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { doLoginAction } from '../../redux/account/accountSlice';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

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
            localStorage.setItem("user", JSON.stringify(res.data.user));
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
            console.log(data.data.access_token);
            if (data?.data.access_token) {
                localStorage.setItem('access_token', data.data.access_token);
                dispatch(doLoginAction(data.data.user));
                message.success('Đăng nhập bằng Google thành công!');
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("user", JSON.stringify(data.data.user));
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
                            <div className="heading">
                                <h2 className="text text-large">Đăng Nhập</h2>
                                <Divider />
                            </div>
                            <Form name="basic" onFinish={onFinish} autoComplete="off">
                                <Form.Item labelCol={{ span: 24 }} label="Email" name="username" rules={[{ required: true, message: 'Email không được để trống!' }]}>
                                    <Input />
                                </Form.Item>

                                <Form.Item labelCol={{ span: 24 }} label="Mật khẩu" name="password" rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}>
                                    <Input.Password />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={isSubmit}>
                                        Đăng nhập
                                    </Button>
                                </Form.Item>

                                <Divider>Hoặc</Divider>

                                {/* Nút đăng nhập bằng Google */}
                                <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => message.error('Đăng nhập Google thất bại')} />

                                <p className="text text-normal">
                                    Chưa có tài khoản?
                                    <span>
                                        <Link to="/register"> Đăng Ký </Link>
                                    </span>
                                </p>
                                <p className="text text-normal">
                                    Quên mật khẩu?
                                    <span onClick={handleForgotPassword} style={{ color: 'blue', cursor: 'pointer' }}> Đặt Lại </span>
                                </p>
                                <br />
                                <p className="text" style={{ color: '#9d9d9d' }}>
                                    p/s: Để test, sử dụng tài khoản guest@gmail.com/123456
                                </p>
                            </Form>
                        </section>
                    </div>
                </main>
            </div>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;
