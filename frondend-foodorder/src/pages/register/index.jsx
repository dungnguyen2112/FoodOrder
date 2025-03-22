import { Button, Divider, Form, Input, InputNumber, message, notification } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callRegister } from '../../services/api';
import './register.scss';
import { User, Mail, Lock, Home, Info, Calendar } from 'lucide-react';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);

    const onFinish = async (values) => {
        const { username, name, email, password, phone, address, avatar, age, bio } = values;
        setIsSubmit(true);
        const res = await callRegister(username, name, email, password, phone, address, avatar, age, bio);
        setIsSubmit(false);
        if (res?.data) {
            message.success('Đăng ký tài khoản thành công!');
            navigate('/login');
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description: res?.message || "Lỗi không xác định",
                duration: 5
            });
        }
    };

    return (
        <div className="register-page">
            <main className="main">
                <div className="container">
                    <section className="wrapper">
                        <div className="logo-container">
                            <div size={48} className="food-icon" />
                        </div>
                        <div className="heading">
                            <h2 className="text text-large">Tạo Tài Khoản Mới</h2>
                            <p className="text-subtitle">Đăng ký để khám phá và đặt những món ăn tuyệt vời</p>
                            <Divider />
                        </div>
                        <Form
                            name="basic"
                            onFinish={onFinish}
                            autoComplete="off"
                            layout="vertical"
                            className="register-form"
                        >
                            <Form.Item
                                label="Tên người dùng"
                                name="username"
                                rules={[{ required: true, message: 'Tên người dùng không được để trống!' }]}
                            >
                                <Input
                                    prefix={<User size={16} className="site-form-item-icon" />}
                                    placeholder="Nhập tên người dùng"
                                    className="input-field"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Họ và Tên"
                                name="name"
                                rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
                            >
                                <Input
                                    prefix={<User size={16} className="site-form-item-icon" />}
                                    placeholder="Nhập họ và tên"
                                    className="input-field"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Email không được để trống!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input
                                    prefix={<Mail size={16} className="site-form-item-icon" />}
                                    placeholder="Nhập email"
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

                            <div className="form-row">
                                <Form.Item
                                    label="Địa chỉ"
                                    name="address"
                                    className="form-col"
                                >
                                    <Input
                                        prefix={<Home size={16} className="site-form-item-icon" />}
                                        placeholder="Nhập địa chỉ giao hàng"
                                        className="input-field"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Tuổi"
                                    name="age"
                                    rules={[
                                        { required: true, message: 'Tuổi không được để trống!' }
                                    ]}
                                    className="form-col age-col"
                                >
                                    <InputNumber
                                        prefix={<Calendar size={16} className="site-form-item-icon" />}
                                        placeholder="Tuổi"
                                        className="input-field"
                                        min={1}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </div>

                            <Form.Item
                                label="Giới thiệu bản thân"
                                name="bio"
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Hãy chia sẻ sở thích ẩm thực của bạn..."
                                    className="input-field textarea"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmit}
                                    className="register-button"
                                    block
                                >
                                    Tạo tài khoản
                                </Button>
                            </Form.Item>

                            <Divider>Hoặc</Divider>

                            <div className="action-links">
                                <p className="text text-normal">
                                    Đã có tài khoản?
                                    <Link to='/login' className="login-link"> Đăng nhập ngay </Link>
                                </p>
                            </div>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;