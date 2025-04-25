import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Input, Row, Typography, Space, Select } from 'antd';
import { SearchOutlined, AppstoreOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
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
    }, [])

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
                    <SearchOutlined /> Tìm kiếm danh mục
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
                    <Col xs={24} sm={24} md={16} lg={16}>
                        <Form.Item
                            name="name"
                            label={showAdvancedSearch ? "Tên danh mục" : null}
                        >
                            <Select
                                placeholder="Chọn danh mục"
                                showSearch
                                allowClear
                                options={listCategory}
                                suffixIcon={<AppstoreOutlined style={{ color: '#ff4d4f' }} />}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
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