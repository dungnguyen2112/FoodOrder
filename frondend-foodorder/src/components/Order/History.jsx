import { Badge, Descriptions, Divider, Space, Table, Tag } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import { callOrderHistory } from "../../services/api";
import { FORMAT_DATE_DISPLAY } from "../../utils/constant";
import ReactJson from 'react-json-view'

const History = () => {
    const [orderHistory, setOrderHistory] = useState([]);
    useEffect(() => {
        const fetchHistory = async () => {
            const res = await callOrderHistory();
            if (res && res.data) {
                setOrderHistory(res.data);
            }
        }
        fetchHistory();
    }, []);

    const columns = [
        {
            title: 'STT',
            dataIndex: 'id',
            key: 'id',
            render: (item, record, index) => (<>{index + 1}</>)
        },
        {
            title: 'Thời gian ',
            dataIndex: 'createdAt',
            render: (item, record, index) => {
                return moment(item).format(FORMAT_DATE_DISPLAY)
            }
        },
        // {
        //     title: 'Tổng số tiền',
        //     dataIndex: 'totalPrice',
        //     render: (item, record, index) => {
        //         return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item)
        //     }
        // },
        {
            title: 'Trạng thái',
            render: (_, { tags }) => (

                <Tag color={"green"}>
                    Thành công
                </Tag>
            )
        },
        {
            title: 'Chi tiết',
            key: 'action',
            render: (_, record) => (
                <div>
                    {record.orders && record.orders.length > 0 ? (
                        <Table
                            columns={[
                                {
                                    title: 'Mã đơn hàng',
                                    dataIndex: 'orderId',
                                    key: 'orderId',
                                },
                                {
                                    title: 'Tên người nhận',
                                    dataIndex: 'name',
                                    key: 'name',
                                },
                                {
                                    title: 'Địa chỉ',
                                    dataIndex: 'address',
                                    key: 'address',
                                },
                                {
                                    title: 'Số điện thoại',
                                    dataIndex: 'phone',
                                    key: 'phone',
                                },
                                {
                                    title: "Số bàn",
                                    dataIndex: "tableNumber",
                                    key: "tableNumber",
                                },
                                {
                                    title: 'Tổng tiền',
                                    dataIndex: 'totalPrice',
                                    key: 'totalPrice',
                                    render: (item) => (
                                        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item)
                                    ),
                                },
                                {
                                    title: 'Trạng thái',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: (status) => (
                                        <Tag color={status === "PENDING" ? "orange" : "green"}>{status}</Tag>
                                    ),
                                },
                                {
                                    title: 'Trạng thái thanh toán',
                                    dataIndex: 'paymentStatus',
                                    key: 'paymentstatus',
                                    render: (status) => (
                                        <Tag color={status === "NOT_PAID" ? "red" : "green"}>{status}</Tag>
                                    ),
                                },
                                {
                                    title: 'Chi tiết sản phẩm',
                                    key: 'details',
                                    render: (_, order) => (
                                        <Table
                                            columns={[
                                                {
                                                    title: 'Tên sản phẩm',
                                                    dataIndex: 'productName',
                                                    key: 'productName',
                                                },
                                                {
                                                    title: 'Giá',
                                                    dataIndex: 'price',
                                                    key: 'price',
                                                    render: (item) => (
                                                        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item)
                                                    ),
                                                },
                                                {
                                                    title: 'Số lượng',
                                                    dataIndex: 'quantity',
                                                    key: 'quantity',
                                                },
                                            ]}
                                            dataSource={order.orderDetails}
                                            pagination={false}
                                            size="small"
                                        />
                                    ),
                                },
                            ]}
                            dataSource={record.orders}
                            pagination={false}
                        />
                    ) : (
                        <Tag color="red">Không có đơn hàng</Tag>
                    )}
                </div>
            ),
        },

    ];


    return (
        <div >
            <div style={{ margin: "15px 0" }}>Lịch sử đặt hàng:</div>
            <Table columns={columns} dataSource={orderHistory} pagination={false} />
        </div>
    )
}

export default History;