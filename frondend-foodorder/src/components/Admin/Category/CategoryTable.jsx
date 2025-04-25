import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Popconfirm, Button, message, notification, Space, Typography, Tag } from 'antd';
import InputSearch from './InputSearch';
import { callDeleteCategory, callFetchCategoryPage } from '../../../services/api';
import { DeleteTwoTone, EditTwoTone, ExportOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, AppstoreOutlined } from '@ant-design/icons';
import CategoryModalCreate from './CategoryModalCreate';
import CategoryViewDetail from './CategoryViewDetail';
import moment from 'moment/moment';
import { FORMAT_DATE_DISPLAY } from '../../../utils/constant';
import CategoryModalUpdate from './CategoryModalUpdate';
import * as XLSX from 'xlsx';
import queryString from 'query-string';
import '../admin.scss';

const { Title, Text } = Typography;

const CategoryTable = () => {
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
        fetchCategory();
    }, [current, pageSize, filter, sortQuery]);

    const fetchCategory = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchCategoryPage(query);
        if (res && res.data) {
            setListBook(res.data.result);
            setTotal(res.data.meta.total)
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
            title: 'Tên danh mục',
            dataIndex: 'name',
            sorter: true,
            width: '30%',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
            width: '40%'
        },
        {
            title: 'Hành động',
            width: '20%',
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
                            title={<div style={{ fontWeight: 500 }}>Xác nhận xóa danh mục</div>}
                            description={<div>Bạn có chắc chắn muốn xóa danh mục <Text strong>{record.name}</Text>?</div>}
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
            sortBy = "sort=name,desc";
        }

        // Construct the final query string
        const finalQuery = queryString.stringify(query) + `&${sortBy}`;

        // Update state and trigger search
        setCurrent(query.page);
        setPageSize(query.size);
        setSortQuery(sortBy);
    };

    const handleDeleteBook = async (id) => {
        const res = await callDeleteCategory(id);
        if (res.statusCode === 200) {
            message.success('Xóa danh mục thành công');
            fetchCategory();
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
                    <AppstoreOutlined className="title-icon" /> Quản lý danh mục
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
                            fetchCategory();
                        }}
                    />
                </Space>
            </div>
        )
    }

    const handleExportData = () => {
        if (listBook.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(listBook);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
            XLSX.writeFile(workbook, "QuanLyDanhMuc.xlsx");
        }
    }

    return (
        <div className="admin-content-container">
            <div className="admin-table-container">
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <InputSearch
                            handleSearch={(query) => setFilter(query)}
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
                                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} danh mục`
                            }}
                            className="admin-table"
                        />
                    </Col>
                </Row>

                <CategoryModalCreate
                    openModalCreate={openModalCreate}
                    setOpenModalCreate={setOpenModalCreate}
                    fetchCategory={fetchCategory}
                />

                <CategoryViewDetail
                    openViewDetail={openViewDetail}
                    setOpenViewDetail={setOpenViewDetail}
                    dataViewDetail={dataViewDetail}
                    setDataViewDetail={setDataViewDetail}
                />

                <CategoryModalUpdate
                    openModalUpdate={openModalUpdate}
                    setOpenModalUpdate={setOpenModalUpdate}
                    dataUpdate={dataUpdate}
                    setDataUpdate={setDataUpdate}
                    fetchCategory={fetchCategory}
                />
            </div>
        </div>
    );
};

export default CategoryTable;