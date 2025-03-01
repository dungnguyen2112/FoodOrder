import { Button, Divider, Form, Input, InputNumber, message, notification } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callRegister } from '../../services/api';
import './register.scss';

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
                        <div className="heading">
                            <h2 className="text text-large">Đăng Ký Tài Khoản</h2>
                            <Divider />
                        </div>
                        <Form name="basic" onFinish={onFinish} autoComplete="off">

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Tên người dùng"
                                name="username"
                                rules={[{ required: true, message: 'Tên người dùng không được để trống!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Họ và Tên"
                                name="name"
                                rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Email không được để trống!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Mật khẩu"
                                name="password"
                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            {/* <Form.Item
                                labelCol={{ span: 24 }}
                                label="Ảnh đại diện (URL)"
                                name="avatar"
                            >
                                <Input placeholder="Nhập URL ảnh đại diện" />
                            </Form.Item> */}

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Địa chỉ"
                                name="address"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Tuổi"
                                name="age"
                                rules={[
                                    { required: true, message: 'Tuổi không được để trống!' }
                                ]}
                            >
                                <InputNumber style={{ width: '100%' }} min={1} />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Giới thiệu bản thân"
                                name="bio"
                            >
                                <Input.TextArea rows={3} placeholder="Hãy viết một chút về bản thân bạn..." />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={isSubmit}>
                                    Đăng ký
                                </Button>
                            </Form.Item>

                            <Divider>Or</Divider>
                            <p className="text text-normal">Đã có tài khoản?
                                <span>
                                    <Link to='/login'> Đăng Nhập </Link>
                                </span>
                            </p>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;
