import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Popconfirm, Button, message, notification, Select } from 'antd';
import { callDeleteOrder, callFetchListOrder, callUpdateOrder, callUpdatePayment } from '../../../services/api';
import { CloudUploadOutlined, DeleteTwoTone, EditTwoTone, ExportOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import OrderViewDetail from './OrderViewDetail';
import moment from 'moment/moment';
import { FORMAT_DATE_DISPLAY } from '../../../utils/constant';
import queryString from 'query-string';
import { render } from 'react-dom';


// https://stackblitz.com/run?file=demo.tsx
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
        const res = await callUpdateOrder(orderId, newStatus); // Ensure correct API format
        if (res && res.data) {
            message.success('Cập nhật trạng thái thành công!');
            fetchOrder(); // Refresh data
        } else {
            notification.error({ message: 'Lỗi khi cập nhật trạng thái', description: res.message });
        }
    };

    const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
        console.log(orderId, newPaymentStatus);
        const res = await callUpdatePayment(orderId, newPaymentStatus); // Ensure correct API format
        console.log(res);
        if (res && res.data) {
            message.success('Cập nhật trạng thái thành công!');
            fetchOrder(); // Refresh data
        } else {
            notification.error({ message: 'Lỗi khi cập nhật trạng thái', description: res.message });
        }
    };


    const handleDeleteOrder = async (id) => {
        const res = await callDeleteOrder(id);
        if (res.statusCode === 204) {
            message.success('Xóa book thành công');
            fetchOrder();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }
    };

    const columns = [
        {
            title: 'Id',
            dataIndex: 'orderId',
            render: (text, record, index) => {
                return (
                    <a href='#' onClick={() => {
                        setDataViewDetail(record);
                        setOpenViewDetail(true);
                    }}>{record.orderId}</a>
                )
            }
        },
        {
            title: 'Price',
            dataIndex: 'totalPrice',
            render: (text, record, index) => {
                return (
                    <>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.totalPrice)}</>

                )
            },
            sorter: true
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: true
        },
        {
            title: 'Address',
            dataIndex: 'address',
            sorter: true,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            sorter: true
        },
        {
            title: 'Số bàn',
            dataIndex: 'tableNumber',
            sorter: true
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            sorter: true,
            render: (text, record, index) => {
                return (
                    <>{moment(record.updatedAt).format(FORMAT_DATE_DISPLAY)}</>
                )
            }

        },
        {
            title: 'Status',
            dataIndex: 'status',
            sorter: true,
            render: (text, record) => (
                <Select
                    value={record.status}
                    style={{ width: 120 }}
                    onChange={(value) => handleUpdateStatus(record.orderId, value)}
                    options={[
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'PREPARING', label: 'Preparing' },
                        { value: 'COMPLETED', label: 'Completed' },
                        { value: 'CANCELLED', label: 'Cancelled' },
                    ]}
                />
            ),
        },
        {
            title: 'PaymentStatus',
            dataIndex: 'paymentStatus',
            sorter: true,
            render: (text, record) => (
                <Select
                    value={record.paymentStatus}
                    style={{ width: 120 }}
                    onChange={(value) => handleUpdatePaymentStatus(record.orderId, value)}
                    options={[
                        { value: 'NOT_PAID', label: 'Not Paid' },
                        { value: 'PAID', label: 'Paid' },
                    ]}
                />
            ),
        },
        {
            title: 'Action',
            width: 100,
            render: (text, record, index) => {
                return (
                    <>
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa?"
                            onConfirm={() => {
                                handleDeleteOrder(record.orderId)
                            }}
                            okText="Có"
                            cancelText="Không"

                        >
                            <span style={{ cursor: "pointer", margin: "0 20px" }}>
                                <DeleteTwoTone twoToneColor="#ff4d4f" />
                            </span>
                        </Popconfirm>
                    </>
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
            sortBy = "sort=totalPrice,desc";
        }

        // Construct the final query string
        const finalQuery = queryString.stringify(query) + `&${sortBy}`;

        // Update state and trigger search
        setCurrent(query.page);
        setPageSize(query.size);
        setSortQuery(sortBy);
    };




    // change button color: https://ant.design/docs/react/customize-theme#customize-design-token
    const renderHeader = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Table List Order</span>
                <span style={{ display: 'flex', gap: 15 }}>
                    <Button type='ghost' onClick={() => {
                        setFilter("");
                        setSortQuery("")
                    }}>
                        <ReloadOutlined />
                    </Button>
                </span>
            </div>
        )
    }

    const handleSearch = (query) => {
        setFilter(query);
    }


    return (
        <>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <Table
                        title={renderHeader}
                        loading={isLoading}

                        columns={columns}
                        dataSource={listOrder}
                        onChange={onChange}
                        rowKey="id"
                        pagination={
                            {
                                current: current,
                                pageSize: pageSize,
                                showSizeChanger: true,
                                total: total,
                                showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                            }
                        }

                    />
                </Col>
            </Row>
            <OrderViewDetail
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />
        </>
    )
}


export default MangeOrder;