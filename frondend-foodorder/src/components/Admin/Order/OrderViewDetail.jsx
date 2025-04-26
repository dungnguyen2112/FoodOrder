import { Badge, Descriptions, Divider, Drawer, Typography, Tag, Space, Card, Row, Col } from "antd";
import moment from 'moment';
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
import { useEffect, useState } from "react";
import {
    ShoppingCartOutlined,
    UserOutlined,
    PhoneOutlined,
    HomeOutlined,
    TableOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    CreditCardOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Status configurations
const ORDER_STATUS = {
    PENDING: {
        color: '#faad14',
        label: 'Đang chờ',
        icon: <ClockCircleOutlined />
    },
    PREPARING: {
        color: '#1677ff',
        label: 'Đang chuẩn bị',
        icon: <SyncOutlined />
    },
    COMPLETED: {
        color: '#52c41a',
        label: 'Hoàn thành',
        icon: <CheckCircleOutlined />
    },
    CANCELLED: {
        color: '#ff4d4f',
        label: 'Đã hủy',
        icon: <CloseCircleOutlined />
    }
};

const PAYMENT_STATUS = {
    NOT_PAID: {
        color: '#ff4d4f',
        label: 'Chưa thanh toán',
        icon: <DollarOutlined />
    },
    PAID: {
        color: '#52c41a',
        label: 'Đã thanh toán',
        icon: <CreditCardOutlined />
    }
};

const OrderViewDetail = (props) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };

    const getStatusTag = (status) => {
        if (!status || !ORDER_STATUS[status]) return null;

        return (
            <Tag
                icon={ORDER_STATUS[status].icon}
                color={ORDER_STATUS[status].color}
                className="status-tag"
            >
                {ORDER_STATUS[status].label}
            </Tag>
        );
    };

    const getPaymentStatusTag = (status) => {
        if (!status || !PAYMENT_STATUS[status]) return null;

        return (
            <Tag
                icon={PAYMENT_STATUS[status].icon}
                color={PAYMENT_STATUS[status].color}
                className="status-tag"
            >
                {PAYMENT_STATUS[status].label}
            </Tag>
        );
    };

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingCartOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />
                    <span>Chi tiết đơn hàng</span>
                </div>
            }
            width={"60vw"}
            onClose={onClose}
            open={openViewDetail}
            extra={
                <div className="drawer-subtitle">
                    {dataViewDetail &&
                        <Text type="secondary">Mã đơn hàng: #{dataViewDetail.orderId}</Text>
                    }
                </div>
            }
            className="admin-drawer"
        >
            {dataViewDetail && (
                <>
                    <Row gutter={[24, 24]}>
                        <Col span={24}>
                            <Card
                                title={
                                    <Title level={5} style={{ margin: 0 }}>
                                        <UserOutlined /> Thông tin khách hàng
                                    </Title>
                                }
                                className="order-detail-card"
                            >
                                <Descriptions
                                    bordered
                                    column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                                    labelStyle={{ width: '150px', fontWeight: 500 }}
                                    contentStyle={{ fontWeight: 400 }}
                                >
                                    <Descriptions.Item label="Tên khách hàng">
                                        <Text strong>{dataViewDetail.name}</Text>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Số điện thoại">
                                        <Space>
                                            <PhoneOutlined />
                                            <Text copyable>{dataViewDetail.phone}</Text>
                                        </Space>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Địa chỉ">
                                        <Space>
                                            <HomeOutlined />
                                            <Text>{dataViewDetail.address}</Text>
                                        </Space>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Số bàn">
                                        <Tag color="blue" style={{ borderRadius: '20px', padding: '2px 12px' }}>
                                            <TableOutlined /> Bàn {dataViewDetail.tableNumber}
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card
                                title={
                                    <Title level={5} style={{ margin: 0 }}>
                                        <ShoppingCartOutlined /> Thông tin đơn hàng
                                    </Title>
                                }
                                className="order-detail-card"
                            >
                                <Descriptions
                                    bordered
                                    column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                                    labelStyle={{ width: '150px', fontWeight: 500 }}
                                    contentStyle={{ fontWeight: 400 }}
                                >
                                    <Descriptions.Item label="Trạng thái đơn hàng">
                                        {getStatusTag(dataViewDetail.status)}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Trạng thái thanh toán">
                                        {getPaymentStatusTag(dataViewDetail.paymentStatus)}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Tổng tiền">
                                        <Text style={{ color: '#1677ff', fontWeight: 'bold', fontSize: '16px' }}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dataViewDetail.totalPrice)}
                                        </Text>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Ngày đặt">
                                        <ClockCircleOutlined /> {moment(dataViewDetail.updatedAt).format(FORMAT_DATE_DISPLAY)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card
                                title={
                                    <Title level={5} style={{ margin: 0 }}>
                                        <DollarOutlined /> Chi tiết các món
                                    </Title>
                                }
                                className="order-detail-card"
                            >
                                {dataViewDetail.orderDetails.map((item, index) => (
                                    <Card
                                        key={index}
                                        type="inner"
                                        title={`Món ${index + 1}: ${item.productName}`}
                                        style={{ marginBottom: index < dataViewDetail.orderDetails.length - 1 ? 16 : 0 }}
                                    >
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} sm={12}>
                                                <Text type="secondary">Số lượng:</Text>{' '}
                                                <Text strong>{item.quantity}</Text>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Text type="secondary">Đơn giá:</Text>{' '}
                                                <Text strong style={{ color: '#1677ff' }}>
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                                </Text>
                                            </Col>
                                            <Col span={24}>
                                                <Text type="secondary">Thành tiền:</Text>{' '}
                                                <Text strong style={{ color: '#ff4d4f' }}>
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                                                </Text>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Drawer>
    );
};

export default OrderViewDetail;