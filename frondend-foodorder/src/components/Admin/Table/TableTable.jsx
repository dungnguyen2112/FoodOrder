import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Popconfirm, Button, message, notification, Select } from 'antd';
import { callDeleteCategory, callDeleteFood, callDeleteTable, callFetchCategoryPage, callFetchListFood, callFetchTable, callUpdateStatusTable } from '../../../services/api';
import { DeleteTwoTone, EditTwoTone, ExportOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import moment from 'moment/moment';
import { FORMAT_DATE_DISPLAY } from '../../../utils/constant';
import * as XLSX from 'xlsx';
import TableModalCreate from './TableModalCreate';
import queryString from 'query-string';
import InputSearchTable from './InputSearchTable';

const STATUS_ENUM = {
    AVAILABLE: "AVAILABLE",
    BUSY: "BUSY"
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
        const res = await callUpdateStatusTable(id, newStatus); // Ensure correct API format
        if (res && res.data) {
            message.success('Cập nhật trạng thái thành công!');
            fetchBook(); // Refresh data
        } else {
            notification.error({ message: 'Lỗi khi cập nhật trạng thái', description: res.message });
        }
    };

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            render: (text, record, index) => {
                return (
                    <a href='#' onClick={() => {
                        setDataViewDetail(record);
                        setOpenViewDetail(true);
                    }}>{record.id}</a>
                )
            }
        },
        {
            title: 'Số bàn',
            dataIndex: 'tableNumber',
            sorter: true
        },
        {
            title: 'Status',
            dataIndex: 'status',
            sorter: true,
            render: (text, record) => (
                <Select
                    defaultValue={record.status}
                    style={{ width: 120 }}
                    onChange={(value) => handleUpdateStatus(record.id, value)}
                    options={[
                        { value: STATUS_ENUM.AVAILABLE, label: "Available" },
                        { value: STATUS_ENUM.BUSY, label: "Busy" },
                    ]}
                />
            ),
        },
        // {
        //     title: 'Ngày cập nhật',
        //     dataIndex: 'updatedAt',
        //     sorter: true,
        //     render: (text, record, index) => {
        //         return (
        //             <>{moment(record.updatedAt).format(FORMAT_DATE_DISPLAY)}</>
        //         )
        //     }

        // },
        {
            title: 'Action',
            render: (text, record, index) => {
                return (
                    <>
                        <EditTwoTone
                            twoToneColor="#f57800" style={{ cursor: "pointer" }}
                            onClick={() => {
                                setOpenModalUpdate(true);
                                setDataUpdate(record);
                            }}
                        />
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa book"}
                            description={"Bạn có chắc chắn muốn xóa book này ?"}
                            onConfirm={() => handleDeleteTable(record.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
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
            message.success('Xóa book thành công');
            fetchBook();
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Table List Tables</span>
                <span style={{ display: 'flex', gap: 15 }}>
                    <Button
                        icon={<ExportOutlined />}
                        type="primary"
                        onClick={() => handleExportData()}
                    >Export</Button>

                    <Button
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => setOpenModalCreate(true)}
                    >Thêm mới</Button>
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

    const handleSearchTable = (query) => {
        setFilter(query);
    }

    const handleExportData = () => {
        // https://stackoverflow.com/questions/70871254/how-can-i-export-a-json-object-to-excel-using-nextjs-react
        if (listBook.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(listBook);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "ExportBook.csv");
        }
    }
    return (
        <>
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
            <TableModalCreate
                openModalCreate={openModalCreate}
                setOpenModalCreate={setOpenModalCreate}
                fetchBook={fetchBook}
            />

        </>
    )
}


export default TableTable;