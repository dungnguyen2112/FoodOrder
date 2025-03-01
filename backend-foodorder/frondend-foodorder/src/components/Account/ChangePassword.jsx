import { Button, Col, Form, Input, Row, message, notification } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import { callUpdatePassword } from "../../services/api";

const ChangePassword = (props) => {
    const [form] = Form.useForm();
    const [isSubmit, setIsSubmit] = useState(false);
    const user = useSelector(state => state.account.user);

    const onFinish = async (values) => {
        const { oldPassword, newPassword } = values;
        setIsSubmit(true);
        const res = await callUpdatePassword(oldPassword, newPassword);
        if (res.statusCode === 200) {
            message.success("Cập nhật mật khẩu thành công");
            form.setFieldValue("oldpass", "")
            form.setFieldValue("newpass", "")
        } else {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: res.message
            })
        }

        setIsSubmit(false);
    }

    return (
        <div style={{ minHeight: 400 }}>
            <Row>
                <Col span={1}></Col>
                <Col span={12}>
                    <Form
                        name="basic"
                        onFinish={onFinish}
                        autoComplete="off"
                        form={form}
                    >

                        <Form.Item
                            labelCol={{ span: 24 }} //whole column
                            label="Mật khẩu hiện tại"
                            name="oldPassword"
                            rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            labelCol={{ span: 24 }} //whole column
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                        >
                            <Input.Password />
                        </Form.Item>


                        <Form.Item
                        // wrapperCol={{ offset: 6, span: 16 }}
                        >
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isSubmit}
                            >
                                Xác nhận
                            </Button>
                        </Form.Item>

                    </Form>
                </Col>
            </Row>
        </div>
    )
}

export default ChangePassword;