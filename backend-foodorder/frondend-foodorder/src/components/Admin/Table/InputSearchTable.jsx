import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, theme } from 'antd';
import { Select } from 'antd';
import { useEffect } from "react";
import { callFetchCategory } from '../../../services/api';

const STATUS_ENUM = {
    AVAILABLE: "AVAILABLE",
    BUSY: "BUSY"
};

const STATUS_NUMBER = {
    AVAILABLE: 0,
    BUSY: 1
}
const InputSearchTable = (props) => {
    const { token } = theme.useToken();
    const [form] = Form.useForm();

    const [listCategory, setListCategory] = useState([])

    const formStyle = {
        maxWidth: 'none',
        background: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        padding: 24,
    };

    const onFinish = (values) => {
        let query = "";
        //build query
        if (values.status) {
            query += `filter=status ~ '${STATUS_NUMBER[values.status]}'`
        }
        if (query) {
            props.handleSearchTable(query);
        }

        //remove undefined
        // https://stackoverflow.com/questions/25421233/javascript-removing-undefined-fields-from-an-object
        // Object.keys(values).forEach(key => {
        //     if (values[key] === undefined) {
        //         delete values[key];
        //     }
        // });

        // if (values && Object.keys(values).length > 0) {
        //     // https://stackoverflow.com/questions/1714786/query-string-encoding-of-a-javascript-object
        //     const params = new URLSearchParams(values).toString();
        //     props.handleSearch(params);
        // }
    };

    return (
        <Form form={form} name="advanced_search" style={formStyle} onFinish={onFinish}>
            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`status`}
                        label={`Status`}
                    >
                        <Select
                            defaultValue={null}
                            showSearch
                            allowClear
                            options={[
                                { value: STATUS_ENUM.AVAILABLE, label: "Available" },
                                { value: STATUS_ENUM.BUSY, label: "Busy" },
                            ]}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit">
                        Search
                    </Button>
                    <Button
                        style={{ margin: '0 8px' }}
                        onClick={() => {
                            form.resetFields();
                            props.setFilter("");
                        }}
                    >
                        Clear
                    </Button>
                    {/* <a
                        style={{ fontSize: 12 }}
                        onClick={() => {
                            setExpand(!expand);
                        }}
                    >
                        {expand ? <UpOutlined /> : <DownOutlined />} Collapse
                    </a> */}
                </Col>
            </Row>
        </Form>
    );
};


export default InputSearchTable;