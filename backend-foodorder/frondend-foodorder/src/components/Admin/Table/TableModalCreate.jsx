import React, { useState } from 'react';
import { Col, Divider, Form, Input, InputNumber, message, Modal, notification, Row, Select } from 'antd';
import { callCreateTable } from '../../../services/api';

const STATUS_ENUM = {
    AVAILABLE: "AVAILABLE",
    BUSY: "BUSY"
};

const TableModalCreate = ({ openModalCreate, setOpenModalCreate, fetchBook }) => {
    const [isSubmit, setIsSubmit] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setIsSubmit(true);
        const res = await callCreateTable(values.tableNumber, values.status);

        if (res && res.data) {
            message.success('Tạo mới bàn thành công');
            form.resetFields();
            setOpenModalCreate(false);
            await fetchBook();
        } else {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: res.message
            });
        }
        setIsSubmit(false);
    };

    return (
        <>
            <Modal
                title="Thêm mới bàn"
                open={openModalCreate}
                onOk={() => form.submit()}
                onCancel={() => {
                    form.resetFields();
                    setOpenModalCreate(false);
                }}
                okText="Tạo mới"
                cancelText="Hủy"
                confirmLoading={isSubmit}
                width={"50vw"}
                maskClosable={false}
            >
                <Divider />
                <Form
                    form={form}
                    name="create_table"
                    onFinish={onFinish}
                    autoComplete="off"
                    initialValues={{ status: STATUS_ENUM.AVAILABLE }}  // Mặc định trạng thái là AVAILABLE
                >
                    <Row gutter={15}>
                        <Col span={12}>
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Số bàn"
                                name="tableNumber"
                                // chuyển thành kiểu int
                                rules={[{ required: true, message: 'Vui lòng nhập số bàn!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Trạng thái"
                                name="status"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                            >
                                <Select options={[
                                    { value: STATUS_ENUM.AVAILABLE, label: "Available" },
                                    { value: STATUS_ENUM.BUSY, label: "Busy" }
                                ]} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};

export default TableModalCreate;
