import { Button, Divider, Form, Input, message, notification, Modal } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { callForgotPassword, callLogin, callVerifyGoogleWithPin } from '../../services/api';
import './login.scss';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { doLoginAction } from '../../redux/account/accountSlice';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Lock, Mail, Key } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);
    const [isPinSubmitting, setIsPinSubmitting] = useState(false);
    const dispatch = useDispatch();
    const [isPinModalVisible, setIsPinModalVisible] = useState(false);
    const [pinForm] = Form.useForm();
    const [tempUserData, setTempUserData] = useState(null);

    const onFinish = async (values) => {
        const { username, password } = values;
        setIsSubmit(true);
        try {
            const res = await callLogin(username, password);

            if (res?.data) {
                // Check if user has role ID 1 (admin)
                if (res.data.user && res.data.user.roleId === 1) {
                    // For all admin users, always require PIN verification
                    setIsSubmit(false);
                    notification.info({
                        message: 'Xác thực bảo mật',
                        description: 'Vui lòng nhập mã PIN để hoàn tất đăng nhập',
                        duration: 5,
                    });
                    // Store the user data temporarily and show PIN modal
                    setTempUserData({
                        ...res.data,
                        _credentials: { username, password }
                    });
                    setIsPinModalVisible(true);
                } else {
                    // For other roles, complete login normally
                    completeLogin(res.data);
                }
            } else {
                setIsSubmit(false);
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                    duration: 5,
                });
            }
        } catch (error) {
            setIsSubmit(false);
            notification.error({
                message: 'Đăng nhập thất bại',
                description: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đăng nhập',
                duration: 5,
            });
        }
    };

    const handlePinVerification = async () => {
        try {
            const values = await pinForm.validateFields();
            const { pin } = values;

            if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
                notification.error({
                    message: 'Mã PIN không hợp lệ',
                    description: 'Mã PIN phải có đúng 6 chữ số',
                    duration: 5,
                });
                return;
            }

            setIsPinSubmitting(true);

            if (tempUserData) {
                if (tempUserData._googleAuth) {
                    // Handle Google login PIN verification
                    try {
                        const res = await callVerifyGoogleWithPin(tempUserData._googleToken, pin);

                        if (res?.data && res.data.access_token) {
                            completeLogin(res.data);
                            setIsPinModalVisible(false);
                            pinForm.resetFields();
                        } else {
                            notification.error({
                                message: 'Xác thực thất bại',
                                description: res?.data?.message || 'Mã PIN không chính xác',
                                duration: 5,
                            });
                        }
                    } catch (error) {
                        notification.error({
                            message: 'Xác thực thất bại',
                            description: error.response?.data?.message || 'Mã PIN không chính xác',
                            duration: 5,
                        });
                    }
                } else {
                    // Handle regular login PIN verification
                    const { username, password } = tempUserData._credentials;
                    try {
                        const res = await callLogin(username, password, pin);

                        if (res?.data && res.data.access_token) {
                            completeLogin(res.data);
                            setIsPinModalVisible(false);
                            pinForm.resetFields();
                        } else {
                            notification.error({
                                message: 'Xác thực thất bại',
                                description: res?.data?.message || 'Mã PIN không chính xác',
                                duration: 5,
                            });
                        }
                    } catch (error) {
                        notification.error({
                            message: 'Xác thực thất bại',
                            description: error.response?.data?.message || 'Mã PIN không chính xác',
                            duration: 5,
                        });
                    }
                }
            }

            setIsPinSubmitting(false);
        } catch (error) {
            setIsPinSubmitting(false);
            notification.error({
                message: 'Lỗi xác thực',
                description: error.message || 'Có lỗi xảy ra khi xác thực mã PIN',
                duration: 5,
            });
        }
    };

    const completeLogin = (userData) => {
        localStorage.setItem('access_token', userData.access_token);
        dispatch(doLoginAction(userData.user));
        message.success('Đăng nhập tài khoản thành công!');
        localStorage.setItem("isAuthenticated", "true");
        // localStorage.setItem("user", JSON.stringify(userData.user));
        navigate('/');
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
            if (data?.data) {
                // Check if user has role_id 1 (admin)
                if (data.data.user && data.data.user.roleId === 1) {
                    notification.info({
                        message: 'Xác thực bảo mật',
                        description: 'Vui lòng nhập mã PIN để hoàn tất đăng nhập',
                        duration: 5,
                    });

                    // Store Google token and user data for PIN verification
                    setTempUserData({
                        ...data.data,
                        _googleAuth: true,
                        _googleToken: response.credential
                    });
                    setIsPinModalVisible(true);
                } else if (data.data.access_token) {
                    // Regular user with no PIN required
                    completeLogin(data.data);
                } else {
                    throw new Error(data.message || 'Đăng nhập thất bại');
                }
            } else {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            notification.error({
                message: 'Đăng nhập thất bại',
                description: error.response?.data?.message || error.message,
                duration: 5,
            });
        }
    };

    return (
        <GoogleOAuthProvider clientId="454969516364-5j0vmvl2ghh1rie2klb543o6kj8vh90j.apps.googleusercontent.com">
            <div className="login-page" style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}>
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

            {/* PIN Verification Modal */}
            <Modal
                title="Xác thực bảo mật"
                open={isPinModalVisible}
                onOk={handlePinVerification}
                confirmLoading={isPinSubmitting}
                onCancel={() => {
                    setIsPinModalVisible(false);
                    pinForm.resetFields();
                    setTempUserData(null);
                }}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <div className="pin-verification">
                    <p>Vui lòng nhập mã PIN 6 số để hoàn tất đăng nhập</p>
                    <Form form={pinForm} layout="vertical">
                        <Form.Item
                            name="pin"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã PIN!' },
                                { len: 6, message: 'Mã PIN phải có đúng 6 chữ số!' },
                                { pattern: /^\d+$/, message: 'Mã PIN chỉ được chứa chữ số!' }
                            ]}
                        >
                            <Input
                                prefix={<Key size={16} />}
                                placeholder="Nhập mã PIN 6 số"
                                maxLength={6}
                                type="password"
                                autoComplete="off"
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;