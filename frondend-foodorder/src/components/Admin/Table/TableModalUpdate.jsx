import React, { useEffect, useState } from 'react';
import {
    Col,
    Divider,
    Form,
    Input,
    message,
    Modal,
    notification,
    Row,
    Select,
    Typography
} from 'antd';
import { callUpdateTable } from '../../../services/api';
import { EditOutlined, TableOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const STATUS_ENUM = {
    AVAILABLE: "AVAILABLE",
    BUSY: "BUSY"
};

const STATUS_LABELS = {
    [STATUS_ENUM.AVAILABLE]: 'Trống',
    [STATUS_ENUM.BUSY]: 'Đang phục vụ'
};

const TableModalUpdate = (props) => {
    const { openModalUpdate, setOpenModalUpdate, dataUpdate, setDataUpdate, fetchBook } = props;
    const [isSubmit, setIsSubmit] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                id: dataUpdate.id,
                tableNumber: dataUpdate.tableNumber,
                status: dataUpdate.status
            });
        }
    }, [dataUpdate]);

    const onFinish = async (values) => {
        setIsSubmit(true);
        try {
            const res = await callUpdateTable(values.id, values.tableNumber, values.status);
            if (res && res.data) {
                message.success('Cập nhật bàn thành công');
                form.resetFields();
                setOpenModalUpdate(false);
                setDataUpdate(null);
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
                        <EditOutlined style={{ color: '#faad14' }} />
                        <span>Cập nhật bàn ăn</span>
                    </div>
                }
                open={openModalUpdate}
                onOk={() => form.submit()}
                onCancel={() => {
                    form.resetFields();
                    setOpenModalUpdate(false);
                    setDataUpdate(null);
                }}
                okText="Cập nhật"
                cancelText="Hủy"
                confirmLoading={isSubmit}
                okButtonProps={{
                    style: {
                        backgroundColor: '#faad14',
                        borderColor: '#faad14'
                    }
                }}
                width={"600px"}
                maskClosable={false}
                className="update-table-modal"
                centered
            >
                <Divider />
                <Form
                    form={form}
                    name="update_table"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                    requiredMark="optional"
                >
                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>

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
                                    prefix={<TableOutlined style={{ color: '#faad14' }} />}
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
                            Cập nhật số bàn hoặc trạng thái của bàn ăn.
                        </Text>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default TableModalUpdate;