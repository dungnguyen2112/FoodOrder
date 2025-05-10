import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Popconfirm, Button, message, notification, Space, Typography, Tag } from 'antd';
import InputSearch from './InputSearch';
import { callDeleteFood, callFetchListFood } from '../../../services/api';
import { DeleteTwoTone, EditTwoTone, ExportOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, CoffeeOutlined, DollarOutlined } from '@ant-design/icons';
import moment from 'moment/moment';
import { FORMAT_DATE_DISPLAY } from '../../../utils/constant';
import * as XLSX from 'xlsx';
import queryString from 'query-string';
import FoodViewDetail from './FoodViewDetail';
import FoodModalCreate from './FoodModalCreate';
import FoodModalUpdate from './FoodModalUpdate';
import '../admin.scss';


const { Title, Text } = Typography;

const FoodTable = () => {
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
        fetchFood();
    }, [current, pageSize, filter, sortQuery]);

    const fetchFood = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchListFood(query);
        if (res && res.data) {
            setListBook(res.data.result);
            setTotal(res.data.meta.total);

            // If view detail is open, update its data with the fresh data
            if (openViewDetail && dataViewDetail) {
                const updatedItem = res.data.result.find(item => item.id === dataViewDetail.id);
                if (updatedItem) {
                    setDataViewDetail(updatedItem);
                }
            }
        }
        setIsLoading(false)
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '10%',
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
            title: 'Tên món',
            dataIndex: 'name',
            sorter: true,
            width: '20%',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Thể loại',
            dataIndex: 'categoryName',
            sorter: true,
            width: '15%',
            render: (text) => (
                <Tag color="#108ee9" style={{ borderRadius: '20px', padding: '2px 12px' }}>
                    {text}
                </Tag>
            )
        },
        {
            title: 'Giá tiền',
            dataIndex: 'price',
            sorter: true,
            width: '15%',
            // https://stackoverflow.com/questions/37985642/vnd-currency-formatting
            render: (text, record, index) => {
                return (
                    <Tag
                        color="#1677ff"
                        className="status-tag"
                        style={{ border: 'none', background: '#e6f4ff', color: '#1677ff' }}
                    >
                        <DollarOutlined /> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.price)}
                    </Tag>
                )
            }
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            sorter: true,
            width: '15%',
            render: (text, record, index) => {
                return (
                    <>{moment(record.updatedAt).format(FORMAT_DATE_DISPLAY)}</>
                )
            }

        },
        {
            title: 'Hành động',
            width: '15%',
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
                            title={<div style={{ fontWeight: 500 }}>Xác nhận xóa món ăn</div>}
                            description={<div>Bạn có chắc chắn muốn xóa món <Text strong>{record.name}</Text>?</div>}
                            onConfirm={() => handleDeleteBook(record.id)}
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
        if (filters.categoryName) {
            filterQuery += filterQuery
                ? ` and ${sfLike("categoryName", filters.categoryName[0])}`
                : `${sfLike("categoryName", filters.categoryName[0])}`;
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

    const handleDeleteBook = async (id) => {
        const res = await callDeleteFood(id);
        if (res.statusCode === 200) {
            message.success('Xóa món ăn thành công');
            fetchFood();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }
    };


    // change button color: https://ant.design/docs/react/customize-theme#customize-design-token
    const renderHeader = () => {
        return (
            <div className="table-header">
                <Title level={4} style={{ margin: 0 }}>
                    <CoffeeOutlined className="title-icon" /> Quản lý món ăn
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
                            fetchFood();
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
        if (listBook.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(listBook);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Foods");
            XLSX.writeFile(workbook, "QuanLyMonAn.xlsx");
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
                            dataSource={listBook}
                            onChange={onChange}
                            rowKey={"id"}
                            pagination={{
                                current: current,
                                pageSize: pageSize,
                                showSizeChanger: true,
                                total: total,
                                pageSizeOptions: ['5', '10', '15', '20'],
                                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} món ăn`
                            }}
                            className="admin-table"
                        />
                    </Col>
                </Row>

                <FoodModalCreate
                    openModalCreate={openModalCreate}
                    setOpenModalCreate={setOpenModalCreate}
                    fetchFood={fetchFood}
                />

                <FoodViewDetail
                    openViewDetail={openViewDetail}
                    setOpenViewDetail={setOpenViewDetail}
                    dataViewDetail={dataViewDetail}
                    setDataViewDetail={setDataViewDetail}
                />

                <FoodModalUpdate
                    openModalUpdate={openModalUpdate}
                    setOpenModalUpdate={setOpenModalUpdate}
                    dataUpdate={dataUpdate}
                    setDataUpdate={setDataUpdate}
                    fetchFood={fetchFood}
                />

            </div>
        </div>
    );
};

export default FoodTable;