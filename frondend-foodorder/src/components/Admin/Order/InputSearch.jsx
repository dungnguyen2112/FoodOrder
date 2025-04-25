import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Input, Row, Typography, Space, Select } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, AppstoreOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { callFetchCategory } from '../../../services/api';

const { Title } = Typography;

const InputSearch = (props) => {
    const [form] = Form.useForm();
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [listCategory, setListCategory] = useState([]);

    useEffect(() => {
        const fetchCategory = async () => {
            const res = await callFetchCategory();
            if (res && res.data) {
                const d = res.data.map(item => {
                    return { label: item, value: item }
                })
                setListCategory(d);
            }
        }
        fetchCategory();
    }, []);

    const onFinish = (values) => {
        let query = "";
        if (values.name) {
            query += `filter=name ~ '${values.name}'`
        }
        if (query) {
            props.handleSearch(query);
        }
    };

    const handleReset = () => {
        form.resetFields();
        props.setFilter("");
    };

    return (
        <div className="admin-search-container">
            <div className="search-header">
                <Title level={5} style={{ margin: 0 }}>
                    <SearchOutlined /> Tìm kiếm đơn hàng
                </Title>
                <Button
                    type="link"
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    style={{ padding: 0 }}
                >
                    <FilterOutlined /> {showAdvancedSearch ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                </Button>
            </div>

            <Form
                form={form}
                name="advanced_search"
                onFinish={onFinish}
                layout={showAdvancedSearch ? "vertical" : "inline"}
                className={`search-form ${showAdvancedSearch ? 'advanced' : 'basic'}`}
            >
                <Row gutter={[16, 16]} style={{ width: '100%' }}>
                    <Col xs={24} sm={showAdvancedSearch ? 12 : 24} md={showAdvancedSearch ? 8 : 16} lg={showAdvancedSearch ? 8 : 16}>
                        <Form.Item
                            name="name"
                            label={showAdvancedSearch ? "Tên khách hàng" : null}
                        >
                            <Input
                                placeholder="Tìm theo tên khách hàng"
                                prefix={<ShoppingCartOutlined style={{ color: '#ff4d4f' }} />}
                                allowClear
                            />
                        </Form.Item>
                    </Col>

                    {showAdvancedSearch && (
                        <>
                            <Col xs={24} sm={12} md={8} lg={8}>
                                <Form.Item
                                    name="address"
                                    label="Địa chỉ"
                                >
                                    <Input
                                        placeholder="Tìm theo địa chỉ"
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={8}>
                                <Form.Item
                                    name="phone"
                                    label="Số điện thoại"
                                >
                                    <Input
                                        placeholder="Tìm theo số điện thoại"
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                        </>
                    )}

                    <Col
                        xs={24}
                        style={{
                            textAlign: 'right',
                            marginTop: showAdvancedSearch ? 16 : 0
                        }}
                    >
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                Tìm kiếm
                            </Button>
                            <Button
                                icon={<ClearOutlined />}
                                onClick={handleReset}
                            >
                                Xóa
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default InputSearch;