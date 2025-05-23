import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Popconfirm, Button, message, notification, Select, Space, Tag, Typography } from 'antd';
import { callDeleteCategory, callDeleteFood, callDeleteTable, callFetchCategoryPage, callFetchListFood, callFetchTable, callUpdateStatusTable } from '../../../services/api';
import {
    DeleteTwoTone,
    EditTwoTone,
    ExportOutlined,
    PlusOutlined,
    ReloadOutlined,
    EyeOutlined,
    InfoCircleOutlined,
    TableOutlined,
    CheckCircleOutlined,
    StopOutlined
} from '@ant-design/icons';
import moment from 'moment/moment';
import { FORMAT_DATE_DISPLAY } from '../../../utils/constant';
import * as XLSX from 'xlsx';
import TableModalCreate from './TableModalCreate';
import queryString from 'query-string';
import InputSearchTable from './InputSearchTable';
import '../admin.scss';
import './table.scss';

const { Title, Text } = Typography;

const STATUS_ENUM = {
    AVAILABLE: "AVAILABLE",
    BUSY: "BUSY"
};

const STATUS_COLORS = {
    [STATUS_ENUM.AVAILABLE]: '#52c41a',
    [STATUS_ENUM.BUSY]: '#ff4d4f'
};

const STATUS_LABELS = {
    [STATUS_ENUM.AVAILABLE]: 'Trống',
    [STATUS_ENUM.BUSY]: 'Đang phục vụ'
};

const STATUS_ICONS = {
    [STATUS_ENUM.AVAILABLE]: <CheckCircleOutlined />,
    [STATUS_ENUM.BUSY]: <StopOutlined />
};

const TableTable = () => {
    const [listBook, setListBook] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("");

    const [openModalCreate, setOpenModalCreate] = useState(false);
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [dataViewDetail, setDataViewDetail] = useState(null);

    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    useEffect(() => {
        fetchBook();
    }, [current, pageSize, filter, sortQuery]);

    const fetchBook = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchTable(query);
        if (res && res.data) {
            setListBook(res.data.result.content);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }

    const handleUpdateStatus = async (id, newStatus) => {
        const res = await callUpdateStatusTable(id, newStatus);
        if (res && res.data) {
            message.success('Cập nhật trạng thái thành công!');
            fetchBook();
        } else {
            notification.error({
                message: 'Lỗi khi cập nhật trạng thái',
                description: res.message,
                placement: 'top'
            });
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '10%',
            render: (text, record) => {
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
            title: 'Số bàn',
            dataIndex: 'tableNumber',
            sorter: true,
            width: '20%',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: true,
            width: '30%',
            render: (status, record) => (
                <Select
                    value={status}
                    style={{
                        width: 160,
                        borderColor: STATUS_COLORS[status]
                    }}
                    onChange={(value) => handleUpdateStatus(record.id, value)}
                    options={[
                        {
                            value: STATUS_ENUM.AVAILABLE,
                            label: (
                                <Tag color={STATUS_COLORS[STATUS_ENUM.AVAILABLE]} className="status-tag">
                                    {STATUS_ICONS[STATUS_ENUM.AVAILABLE]} {STATUS_LABELS[STATUS_ENUM.AVAILABLE]}
                                </Tag>
                            )
                        },
                        {
                            value: STATUS_ENUM.BUSY,
                            label: (
                                <Tag color={STATUS_COLORS[STATUS_ENUM.BUSY]} className="status-tag">
                                    {STATUS_ICONS[STATUS_ENUM.BUSY]} {STATUS_LABELS[STATUS_ENUM.BUSY]}
                                </Tag>
                            )
                        },
                    ]}
                    className="status-select"
                    dropdownClassName="status-dropdown"
                    suffixIcon={null}
                />
            ),
        },
        {
            title: 'Hành động',
            width: '20%',
            render: (_, record) => {
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
                            title={<div style={{ fontWeight: 500 }}>Xác nhận xóa bàn</div>}
                            description={<div>Bạn có chắc chắn muốn xóa bàn số <Text strong>{record.tableNumber}</Text>?</div>}
                            onConfirm={() => handleDeleteTable(record.id)}
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
            sortBy = "sort=tableNumber,desc";
        }

        // Construct the final query string
        const finalQuery = queryString.stringify(query) + `&${sortBy}`;

        // Update state and trigger search
        setCurrent(query.page);
        setPageSize(query.size);
        setSortQuery(sortBy);
    };

    const handleDeleteTable = async (id) => {
        const res = await callDeleteTable(id);
        if (res.statusCode === 200) {
            message.success('Xóa bàn thành công');
            fetchBook();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
                placement: 'top'
            });
        }
    };

    // change button color: https://ant.design/docs/react/customize-theme#customize-design-token
    const renderHeader = () => {
        return (
            <div className="table-header">
                <Title level={4} style={{ margin: 0 }}>
                    <TableOutlined className="title-icon" /> Quản lý bàn ăn
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
                            fetchBook();
                        }}
                    />
                </Space>
            </div>
        )
    }

    const handleSearchTable = (query) => {
        setFilter(query);
    }

    const handleExportData = () => {
        if (listBook.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(listBook);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Tables");
            XLSX.writeFile(workbook, "QuanLyBan.xlsx");
        }
    }

    return (
        <div className="admin-content-container">
            <div className="admin-table-container">
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <InputSearchTable
                            handleSearchTable={handleSearchTable}
                            setFilter={setFilter}
                        />
                    </Col>
                    <Col span={24}>
                        <Table
                            title={renderHeader}
                            loading={isLoading}
                            columns={columns}
                            dataSource={listBook}
                            onChange={onChange}
                            rowKey={"id"}
                            pagination={{
                                current: current,
                                pageSize: pageSize,
                                showSizeChanger: true,
                                total: total,
                                pageSizeOptions: ['5', '10', '15', '20'],
                                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bàn`
                            }}
                            className="admin-table"
                        />
                    </Col>
                </Row>

                <TableModalCreate
                    openModalCreate={openModalCreate}
                    setOpenModalCreate={setOpenModalCreate}
                    fetchBook={fetchBook}
                />

            </div>
        </div>
    );
};

export default TableTable;