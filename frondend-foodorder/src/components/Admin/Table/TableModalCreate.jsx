import React, { useState } from 'react';
import {
    Col,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    notification,
    Row,
    Select,
    Typography,
    Button
} from 'antd';
import { callCreateTable } from '../../../services/api';
import { TableOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const STATUS_ENUM = {
    AVAILABLE: "AVAILABLE",
    BUSY: "BUSY"
};

const STATUS_LABELS = {
    [STATUS_ENUM.AVAILABLE]: 'Trống',
    [STATUS_ENUM.BUSY]: 'Đang phục vụ'
};

const TableModalCreate = ({ openModalCreate, setOpenModalCreate, fetchBook }) => {
    const [isSubmit, setIsSubmit] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setIsSubmit(true);
        try {
            const res = await callCreateTable(values.tableNumber, values.status);

            if (res && res.data) {
                message.success('Tạo mới bàn thành công');
                form.resetFields();
                setOpenModalCreate(false);
                await fetchBook();
            } else {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: res.message,
                    placement: 'top'
                });
            }
        } catch (error) {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: error.message || 'Vui lòng thử lại sau',
                placement: 'top'
            });
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <>
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <PlusOutlined style={{ color: '#ff4d4f' }} />
                        <span>Thêm mới bàn ăn</span>
                    </div>
                }
                open={openModalCreate}
                onOk={() => form.submit()}
                onCancel={() => {
                    form.resetFields();
                    setOpenModalCreate(false);
                }}
                okText="Tạo mới"
                cancelText="Hủy"
                confirmLoading={isSubmit}
                okButtonProps={{
                    style: {
                        backgroundColor: '#ff4d4f',
                        borderColor: '#ff4d4f'
                    }
                }}
                width={"600px"}
                maskClosable={false}
                className="create-table-modal"
                centered
            >
                <Divider />
                <Form
                    form={form}
                    name="create_table"
                    onFinish={onFinish}
                    autoComplete="off"
                    initialValues={{ status: STATUS_ENUM.AVAILABLE }}
                    layout="vertical"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label={<Text strong>Số bàn</Text>}
                                name="tableNumber"
                                rules={[{ required: true, message: 'Vui lòng nhập số bàn!' }]}
                                tooltip="Mỗi bàn cần có một số duy nhất"
                            >
                                <Input
                                    placeholder="Nhập số bàn"
                                    prefix={<TableOutlined style={{ color: '#ff4d4f' }} />}
                                    style={{ borderRadius: '8px' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={<Text strong>Trạng thái</Text>}
                                name="status"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                            >
                                <Select
                                    options={[
                                        { value: STATUS_ENUM.AVAILABLE, label: STATUS_LABELS[STATUS_ENUM.AVAILABLE] },
                                        { value: STATUS_ENUM.BUSY, label: STATUS_LABELS[STATUS_ENUM.BUSY] }
                                    ]}
                                    placeholder="Chọn trạng thái"
                                    style={{ borderRadius: '8px' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="form-note" style={{ marginTop: '16px' }}>
                        <Text type="secondary" italic>
                            <InfoCircleOutlined style={{ marginRight: '5px' }} />
                            Lưu ý: Mỗi bàn có một số duy nhất, số bàn nên là duy nhất để dễ quản lý.
                        </Text>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default TableModalCreate;
