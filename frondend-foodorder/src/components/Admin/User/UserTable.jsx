import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Popconfirm, Button, message, notification } from 'antd';
import InputSearch from './InputSearch';
import { callDeleteUser, callFetchListUser } from '../../../services/api';
import { CloudUploadOutlined, DeleteTwoTone, EditTwoTone, ExportOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import UserModalCreate from './UserModalCreate';
import UserViewDetail from './UserViewDetail';
import moment from 'moment/moment';
import { FORMAT_DATE_DISPLAY } from '../../../utils/constant';
import * as XLSX from 'xlsx';
import UserModalUpdate from './UserModalUpdate';
import queryString from 'query-string';
import { sfLike } from "spring-filter-query-builder";



// https://stackblitz.com/run?file=demo.tsx
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

    // const buildQuery = (params, sort, filter) => {
    //     const q = {
    //         page: params.current,
    //         size: params.pageSize,
    //         filter: ""
    //     }

    //     const clone = { ...params };
    //     if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
    //     if (clone.email) {
    //         q.filter = clone.name ?
    //             q.filter + " and " + `${sfLike("email", clone.email)}`
    //             : `${sfLike("email", clone.email)}`;
    //     }

    //     if (!q.filter) delete q.filter;
    //     let temp = queryString.stringify(q);

    //     let sortBy = "";
    //     if (sort && sort.name) {
    //         sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
    //     }
    //     if (sort && sort.email) {
    //         sortBy = sort.email === 'ascend' ? "sort=email,asc" : "sort=email,desc";
    //     }
    //     if (sort && sort.createdAt) {
    //         sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
    //     }
    //     if (sort && sort.updatedAt) {
    //         sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
    //     }

    //     //mặc định sort theo updatedAt
    //     if (Object.keys(sortBy).length === 0) {
    //         temp = `${temp}&sort=updatedAt,desc`;
    //     } else {
    //         temp = `${temp}&${sortBy}`;
    //     }

    //     return temp;
    // }

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
            title: 'Id',
            dataIndex: 'id',
            render: (text, record, index) => {
                return (
                    <a href='#' onClick={() => {
                        setDataViewDetail(record);
                        setOpenViewDetail(true);
                        openViewDetail(true);
                    }}>{record.id}</a>
                )
            }
        },
        {
            title: 'Tên hiển thị',
            dataIndex: 'name',
            sorter: true
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            sorter: true
        },
        {
            title: 'Tổng số đơn hàng đã đặt',
            dataIndex: 'totalOrder',
            sorter: true
        },
        {
            title: 'Tổng số tiền đã mua',
            dataIndex: 'totalMoneySpent',
            sorter: true,
        },
        {
            title: 'Hạng thành viên',
            dataIndex: 'royalty',
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
                            title={"Xác nhận xóa user"}
                            description={"Bạn có chắc chắn muốn xóa user này ?"}
                            onConfirm={() => handleDeleteUser(record.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", margin: "0 20px" }}>
                                <DeleteTwoTone twoToneColor="#ff4d4f" />
                            </span>
                        </Popconfirm>


                        {/* Thêm icon ViewDetail */}

                        {/* <span
                            style={{ cursor: "pointer", color: "#1890ff" }}
                            onClick={() => {
                                console.log("User data:", record);
                                setDataViewDetail(record);
                                setOpenViewDetail(true);
                            }}
                        >
                            <EyeOutlined />
                        </span> */}

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
        if (userId) {
            const res = await callDeleteUser(userId);
            console.log("res", res);
            if (res.statusCode === 200) {
                message.success('Xóa user thành công');
                fetchUser();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
        else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: "Không có id user"
            });
        }

    };


    // change button color: https://ant.design/docs/react/customize-theme#customize-design-token
    const renderHeader = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Table List Users</span>
                <span style={{ display: 'flex', gap: 15 }}>
                    <Button
                        icon={<ExportOutlined />}
                        type="primary"
                        onClick={() => handleExportData()}
                    >Export</Button>

                    <Button
                        icon={<CloudUploadOutlined />}
                        type="primary"
                        onClick={() => setOpenModalImport(true)}
                    >Import</Button>

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

    const handleSearch = (query) => {
        setCurrent(1)
        setFilter(query);
    }

    const handleExportData = () => {
        // https://stackoverflow.com/questions/70871254/how-can-i-export-a-json-object-to-excel-using-nextjs-react
        if (listUser.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(listUser);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "ExportUser.csv");
        }
    }
    return (
        <>
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
                        rowKey="_id"
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

            {/* <UserImport
                openModalImport={openModalImport}
                setOpenModalImport={setOpenModalImport}
                fetchUser={fetchUser}
            /> */}

            <UserModalUpdate
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                fetchUser={fetchUser}
            />

        </>
    )
}


export default UserTable;