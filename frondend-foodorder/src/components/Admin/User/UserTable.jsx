import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Popconfirm, Button, message, notification, Space, Typography, Tag } from 'antd';
import InputSearch from './InputSearch';
import { callDeleteUser, callFetchListUser } from '../../../services/api';
import { DeleteTwoTone, EditTwoTone, ExportOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import UserModalCreate from './UserModalCreate';
import UserViewDetail from './UserViewDetail';
import moment from 'moment/moment';
import { FORMAT_DATE_DISPLAY } from '../../../utils/constant';
import * as XLSX from 'xlsx';
import UserModalUpdate from './UserModalUpdate';
import queryString from 'query-string';
import { sfLike } from "spring-filter-query-builder";
import '../admin.scss';

const { Title, Text } = Typography;

// Royalty level display configuration
const ROYALTY_LEVELS = {
    "BRONZE": { color: "#cd7f32", label: "Đồng" },
    "SILVER": { color: "#c0c0c0", label: "Bạc" },
    "GOLD": { color: "#ffd700", label: "Vàng" },
    "PLATINUM": { color: "#e5e4e2", label: "Bạch kim" }
};

const UserTable = () => {
    const [listUser, setListUser] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("");

    const [openModalCreate, setOpenModalCreate] = useState(false);
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [dataViewDetail, setDataViewDetail] = useState(null);

    const [openModalImport, setOpenModalImport] = useState(false);

    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    useEffect(() => {
        fetchUser();
    }, [current, pageSize, filter, sortQuery]);

    const fetchUser = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchListUser(query);
        if (res && res.data) {
            setListUser(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '5%',
            render: (text, record, index) => {
                return (
                    <a
                        className="table-id-link"
                        onClick={() => {
                            setDataViewDetail(record);
                            setOpenViewDetail(true);
                        }}
                    >
                        #{record.id}
                    </a>
                )
            }
        },
        {
            title: 'Tên người dùng',
            dataIndex: 'name',
            width: '15%',
            sorter: true,
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            width: '18%',
            sorter: true,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            width: '10%',
            sorter: true
        },
        {
            title: 'Tổng đơn đã đặt',
            dataIndex: 'totalOrder',
            width: '10%',
            sorter: true,
            render: (value) => <Text style={{ color: '#1677ff' }}>{value}</Text>
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'totalMoneySpent',
            width: '12%',
            sorter: true,
            render: (value) => (
                <Text style={{ color: '#1677ff', fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)}
                </Text>
            )
        },
        {
            title: 'Hạng thành viên',
            dataIndex: 'royalty',
            width: '12%',
            sorter: true,
            render: (value) => {
                const royaltyInfo = ROYALTY_LEVELS[value] || { color: "#999", label: value };
                return (
                    <Tag color={royaltyInfo.color} style={{ fontWeight: 'bold' }}>
                        {royaltyInfo.label}
                    </Tag>
                );
            }
        },
        {
            title: 'Ngày cập nhật',
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
                        <Button
                            className="action-button edit-button"
                            icon={<EditTwoTone twoToneColor="#faad14" />}
                            onClick={() => {
                                setOpenModalUpdate(true);
                                setDataUpdate(record);
                            }}
                        />
                        <Popconfirm
                            placement="topRight"
                            title={<div style={{ fontWeight: 500 }}>Xác nhận xóa người dùng</div>}
                            description={<div>Bạn có chắc chắn muốn xóa người dùng <Text strong>{record.name}</Text>?</div>}
                            onConfirm={() => handleDeleteUser(record.id)}
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
        if (filters.email) {
            filterQuery += filterQuery
                ? ` and ${sfLike("email", filters.email[0])}`
                : `${sfLike("email", filters.email[0])}`;
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

    const handleDeleteUser = async (userId) => {
        const res = await callDeleteUser(userId);
        if (res.statusCode === 200) {
            message.success('Xóa người dùng thành công');
            fetchUser();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
                placement: 'top'
            });
        }
    };

    const renderHeader = () => {
        return (
            <div className="table-header">
                <Title level={4} style={{ margin: 0 }}>
                    <UserOutlined className="title-icon" /> Quản lý người dùng
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
                        icon={<PlusOutlined />}
                        type="primary"
                        className="add-button"
                        onClick={() => setOpenModalCreate(true)}
                    >
                        Thêm mới
                    </Button>

                    <Button
                        icon={<ReloadOutlined />}
                        className="refresh-button"
                        onClick={() => {
                            setFilter("");
                            setSortQuery("");
                            fetchUser();
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
        if (listUser.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(listUser);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
            XLSX.writeFile(workbook, "QuanLyNguoiDung.xlsx");
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
                            dataSource={listUser}
                            onChange={onChange}
                            rowKey={"id"}
                            pagination={{
                                current: current,
                                pageSize: pageSize,
                                showSizeChanger: true,
                                total: total,
                                pageSizeOptions: ['5', '10', '15', '20'],
                                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`
                            }}
                            className="admin-table"
                            scroll={{ x: 1200 }}
                        />
                    </Col>
                </Row>

                <UserModalCreate
                    openModalCreate={openModalCreate}
                    setOpenModalCreate={setOpenModalCreate}
                    fetchUser={fetchUser}
                />

                <UserViewDetail
                    openViewDetail={openViewDetail}
                    setOpenViewDetail={setOpenViewDetail}
                    dataViewDetail={dataViewDetail}
                    setDataViewDetail={setDataViewDetail}
                />

                <UserModalUpdate
                    openModalUpdate={openModalUpdate}
                    setOpenModalUpdate={setOpenModalUpdate}
                    dataUpdate={dataUpdate}
                    setDataUpdate={setDataUpdate}
                    fetchUser={fetchUser}
                />
            </div>
        </div>
    );
};

export default UserTable;