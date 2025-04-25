import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Popconfirm, Button, message, notification, Select, Space, Typography, Tag } from 'antd';
import { callDeleteOrder, callFetchListOrder, callUpdateOrder, callUpdatePayment } from '../../../services/api';
import { DeleteTwoTone, ExportOutlined, ReloadOutlined, ShoppingCartOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, CloseCircleOutlined, DollarCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import OrderViewDetail from './OrderViewDetail';
import moment from 'moment/moment';
import { FORMAT_DATE_DISPLAY } from '../../../utils/constant';
import queryString from 'query-string';
import InputSearch from './InputSearch';
import * as XLSX from 'xlsx';
import '../admin.scss';

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
        icon: <DollarCircleOutlined />
    },
    PAID: {
        color: '#52c41a',
        label: 'Đã thanh toán',
        icon: <CreditCardOutlined />
    }
};

const MangeOrder = () => {
    const [listOrder, setListOrder] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [dataViewDetail, setDataViewDetail] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("");

    useEffect(() => {
        fetchOrder();
    }, [current, pageSize, filter, sortQuery]);

    const fetchOrder = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchListOrder(query);
        if (res && res.data) {
            setListOrder(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }

    const handleUpdateStatus = async (orderId, newStatus) => {
        const res = await callUpdateOrder(orderId, newStatus);
        if (res && res.data) {
            message.success('Cập nhật trạng thái thành công!');
            fetchOrder();
        } else {
            notification.error({
                message: 'Lỗi khi cập nhật trạng thái',
                description: res.message,
                placement: 'top'
            });
        }
    };

    const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
        const res = await callUpdatePayment(orderId, newPaymentStatus);
        if (res && res.data) {
            message.success('Cập nhật trạng thái thanh toán thành công!');
            fetchOrder();
        } else {
            notification.error({
                message: 'Lỗi khi cập nhật trạng thái thanh toán',
                description: res.message,
                placement: 'top'
            });
        }
    };


    const handleDeleteOrder = async (id) => {
        const res = await callDeleteOrder(id);
        if (res.statusCode === 200) {
            message.success('Xóa đơn hàng thành công');
            fetchOrder();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
                placement: 'top'
            });
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'orderId',
            width: '8%',
            render: (text, record, index) => {
                return (
                    <a
                        className="table-id-link"
                        onClick={() => {
                            setDataViewDetail(record);
                            setOpenViewDetail(true);
                        }}
                    >
                        #{record.orderId}
                    </a>
                )
            }
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            width: '12%',
            render: (text, record, index) => {
                return (
                    <Text style={{ color: '#1677ff', fontWeight: 'bold' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.totalPrice)}
                    </Text>
                )
            },
            sorter: true
        },
        {
            title: 'Khách hàng',
            dataIndex: 'name',
            width: '15%',
            render: (text) => <Text strong>{text}</Text>,
            sorter: true
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            width: '15%',
            sorter: true,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            width: '10%',
            sorter: true
        },
        {
            title: 'Số bàn',
            dataIndex: 'tableNumber',
            width: '8%',
            sorter: true,
            render: (text) => <Tag color="blue" style={{ borderRadius: '20px', padding: '2px 12px' }}>{text}</Tag>
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'updatedAt',
            width: '10%',
            sorter: true,
            render: (text, record, index) => {
                return (
                    <>{moment(record.updatedAt).format(FORMAT_DATE_DISPLAY)}</>
                )
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: '12%',
            sorter: true,
            render: (text, record) => (
                <Select
                    value={record.status}
                    style={{
                        width: 160,
                        borderColor: ORDER_STATUS[record.status]?.color || '#d9d9d9'
                    }}
                    onChange={(value) => handleUpdateStatus(record.orderId, value)}
                    options={Object.keys(ORDER_STATUS).map(key => ({
                        value: key,
                        label: (
                            <Tag color={ORDER_STATUS[key].color} className="status-tag">
                                {ORDER_STATUS[key].icon} {ORDER_STATUS[key].label}
                            </Tag>
                        )
                    }))}
                    className="status-select"
                    dropdownClassName="status-dropdown"
                    suffixIcon={null}
                />
            ),
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentStatus',
            width: '12%',
            sorter: true,
            render: (text, record) => (
                <Select
                    value={record.paymentStatus}
                    style={{
                        width: 160,
                        borderColor: PAYMENT_STATUS[record.paymentStatus]?.color || '#d9d9d9'
                    }}
                    onChange={(value) => handleUpdatePaymentStatus(record.orderId, value)}
                    options={Object.keys(PAYMENT_STATUS).map(key => ({
                        value: key,
                        label: (
                            <Tag color={PAYMENT_STATUS[key].color} className="status-tag">
                                {PAYMENT_STATUS[key].icon} {PAYMENT_STATUS[key].label}
                            </Tag>
                        )
                    }))}
                    className="status-select"
                    dropdownClassName="status-dropdown"
                    suffixIcon={null}
                />
            ),
        },
        {
            title: 'Hành động',
            width: '8%',
            render: (text, record, index) => {
                return (
                    <Space size="middle" className="action-buttons">
                        <Button
                            className="action-button view-button"
                            icon={<EyeOutlined />}
                            onClick={() => {
                                setDataViewDetail(record);
                                setOpenViewDetail(true);
                            }}
                        />
                        <Popconfirm
                            placement="topRight"
                            title={<div style={{ fontWeight: 500 }}>Xác nhận xóa đơn hàng</div>}
                            description={<div>Bạn có chắc chắn muốn xóa đơn hàng này?</div>}
                            onConfirm={() => handleDeleteOrder(record.orderId)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                className="action-button delete-button"
                                icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
                            />
                        </Popconfirm>
                    </Space>
                )
            }
        }
    ];

    const onChange = (pagination, filters, sorter, extra) => {
        let query = {
            page: pagination?.current || 1,
            size: pagination?.pageSize || 10,
        };

        // Handle filtering
        let filterQuery = "";
        if (filters.name) {
            filterQuery += `${sfLike("name", filters.name[0])}`;
        }
        if (filterQuery) {
            query.filter = filterQuery;
        }

        // Handle sorting
        let sortBy = "";
        if (sorter?.field) {
            sortBy = sorter.order === 'ascend'
                ? `sort=${sorter.field},asc`
                : `sort=${sorter.field},desc`;
        }

        // Default sorting by updatedAt if no sort is provided
        if (!sortBy) {
            sortBy = "sort=updatedAt,desc";
        }

        // Construct the final query string
        const finalQuery = queryString.stringify(query) + `&${sortBy}`;

        // Update state and trigger search
        setCurrent(query.page);
        setPageSize(query.size);
        setSortQuery(sortBy);
    };

    const renderHeader = () => {
        return (
            <div className="table-header">
                <Title level={4} style={{ margin: 0 }}>
                    <ShoppingCartOutlined className="title-icon" /> Quản lý đơn hàng
                </Title>
                <Space className="header-buttons">
                    <Button
                        icon={<ExportOutlined />}
                        className="export-button"
                        onClick={() => handleExportData()}
                    >
                        Xuất dữ liệu
                    </Button>

                    <Button
                        icon={<ReloadOutlined />}
                        className="refresh-button"
                        onClick={() => {
                            setFilter("");
                            setSortQuery("");
                            fetchOrder();
                        }}
                    />
                </Space>
            </div>
        )
    }

    const handleSearch = (query) => {
        setFilter(query);
    }

    const handleExportData = () => {
        if (listOrder.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(listOrder);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
            XLSX.writeFile(workbook, "QuanLyDonHang.xlsx");
        }
    }

    return (
        <div className="admin-content-container">
            <div className="admin-table-container">
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <InputSearch
                            handleSearch={handleSearch}
                            setFilter={setFilter}
                        />
                    </Col>
                    <Col span={24}>
                        <Table
                            title={renderHeader}
                            loading={isLoading}
                            columns={columns}
                            dataSource={listOrder}
                            onChange={onChange}
                            rowKey={"orderId"}
                            pagination={{
                                current: current,
                                pageSize: pageSize,
                                showSizeChanger: true,
                                total: total,
                                pageSizeOptions: ['5', '10', '15', '20'],
                                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`
                            }}
                            scroll={{ x: 1200 }}
                            className="admin-table"
                        />
                    </Col>
                </Row>

                <OrderViewDetail
                    openViewDetail={openViewDetail}
                    setOpenViewDetail={setOpenViewDetail}
                    dataViewDetail={dataViewDetail}
                    setDataViewDetail={setDataViewDetail}
                />
            </div>
        </div>
    );
};

export default MangeOrder;