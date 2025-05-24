import { Badge, Card, Descriptions, Divider, Empty, Space, Table, Tag, Typography, Spin } from "antd";
import { ShoppingCartOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from "moment";
import { useEffect, useState } from "react";
import { callOrderHistory } from "../../services/api";
import { FORMAT_DATE_DISPLAY } from "../../utils/constant";

const { Title, Text } = Typography;

const History = () => {
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await callOrderHistory();
                if (res && res.data) {
                    // Sort histories by timestamp in descending order
                    const sortedData = res.data
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map(history => ({
                            ...history,
                            orders: history.orders.sort((a, b) =>
                                new Date(b.createdAt) - new Date(a.createdAt)
                            )
                        }));
                    setOrderHistory(sortedData);
                }
            } catch (error) {
                console.error("Lỗi khi tải lịch sử đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING":
                return "orange";
            case "NOT_PAID":
                return "red";
            default:
                return "green";
        }
    };

    const getStatusTag = (status) => {
        const color = status === "COMPLET" ? "green" : status === "PAID" ? "green" : getStatusColor(status);
        return (
            <Tag color={color} style={{ margin: "0" }}>
                {status}
            </Tag>
        );
    };

    // Cột chi tiết sản phẩm
    const productColumns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            width: '50%',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: '30%',
            render: (price) => formatCurrency(price),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: '20%',
            align: 'center',
        },
    ];

    // Cột đơn hàng
    const orderColumns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderId',
            key: 'orderId',
            width: 100,
        },
        {
            title: 'Tên người nhận',
            dataIndex: 'name',
            key: 'name',
            width: 120,
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            width: 150,
            ellipsis: true,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: 120,
        },
        {
            title: 'Số bàn',
            dataIndex: 'tableNumber',
            key: 'tableNumber',
            width: 80,
            align: 'center',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 120,
            render: (price) => formatCurrency(price),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            align: 'center',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentstatus',
            width: 100,
            align: 'center',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Chi tiết sản phẩm',
            key: 'details',
            render: (_, order) => (
                <Table
                    columns={productColumns}
                    dataSource={order.orderDetails}
                    pagination={false}
                    size="small"
                    bordered
                    summary={(pageData) => {
                        let totalItems = 0;
                        let totalPrice = 0;
                        pageData.forEach(({ quantity }) => {
                            totalItems += quantity;
                        });
                        order.orderDetails.forEach(({ price, quantity }) => {
                            totalPrice += price * quantity;
                        });
                        return (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0}>Tổng cộng</Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">{formatCurrency(totalPrice)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="center">{totalItems}</Table.Summary.Cell>
                            </Table.Summary.Row>
                        );
                    }}
                />
            ),
        },
    ];

    // Cột chính
    const columns = [
        {
            title: 'STT',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            render: (_, __, index) => (<>{index + 1}</>),
            align: 'center',
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date) => (
                <div>{moment(date).format(FORMAT_DATE_DISPLAY)}</div>
            )
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            align: 'center',
            render: () => (
                <Tag color="green" style={{ margin: "0" }}>
                    Thành công
                </Tag>
            )
        },
        {
            title: 'Chi tiết',
            key: 'action',
            render: (_, record) => (
                <div style={{ width: '100%' }}>
                    {record.orders && record.orders.length > 0 ? (
                        <div className="order-details">
                            <div className="order-header" style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                <ShoppingCartOutlined /> Chi tiết đơn hàng
                            </div>
                            <Table
                                columns={orderColumns}
                                dataSource={record.orders}
                                pagination={false}
                                bordered
                                size="small"
                                scroll={{ x: 1200 }}
                                style={{
                                    width: '100%',
                                    textAlign: 'center',
                                }}
                            />
                        </div>
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có đơn hàng" />
                    )}
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: '0px', backgroundColor: 'rgb(239, 239, 239)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', marginTop: '14px' }}>
                <ShoppingCartOutlined style={{ marginRight: '8px', fontSize: '20px' }} />
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Lịch sử đặt hàng</div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '20px' }}>Đang tải dữ liệu...</div>
                </div>
            ) : orderHistory.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={orderHistory}
                    pagination={false}
                    rowKey="id"
                    bordered
                    style={{ width: '100%' }}
                    size="middle"
                    scroll={{ x: '100%' }}
                />
            ) : (
                <Empty description="Không có lịch sử đơn hàng" />
            )}
        </div>
    );
};

export default History;