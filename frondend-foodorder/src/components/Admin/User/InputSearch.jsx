import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Typography, Space } from 'antd';
import { SearchOutlined, UserOutlined, MailOutlined, PhoneOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';

const { Title } = Typography;

const InputSearch = (props) => {
    const [form] = Form.useForm();
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    const onFinish = (values) => {
        let query = "";
        //build query
        if (values.name) {
            query += `filter=name ~ '${values.name}'`
        }
        if (values.email) {
            query += query ? ` and email ~ '${values.email}'` : `filter=email ~ '${values.email}'`
        }

        if (values.phone) {
            query += query ? ` and phone ~ '${values.phone}'` : `filter=phone ~ '${values.phone}'`
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
                    <SearchOutlined /> Tìm kiếm người dùng
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
                    <Col xs={24} sm={showAdvancedSearch ? 12 : 24} md={showAdvancedSearch ? 8 : 8} lg={showAdvancedSearch ? 8 : 8}>
                        <Form.Item
                            name="name"
                            label={showAdvancedSearch ? "Tên người dùng" : null}
                        >
                            <Input
                                placeholder="Tìm theo tên"
                                prefix={<UserOutlined style={{ color: '#ff4d4f' }} />}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={showAdvancedSearch ? 12 : 24} md={showAdvancedSearch ? 8 : 8} lg={showAdvancedSearch ? 8 : 8}>
                        <Form.Item
                            name="email"
                            label={showAdvancedSearch ? "Email" : null}
                        >
                            <Input
                                placeholder="Tìm theo email"
                                prefix={<MailOutlined style={{ color: '#ff4d4f' }} />}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={showAdvancedSearch ? 12 : 24} md={showAdvancedSearch ? 8 : 8} lg={showAdvancedSearch ? 8 : 8}>
                        <Form.Item
                            name="phone"
                            label={showAdvancedSearch ? "Số điện thoại" : null}
                        >
                            <Input
                                placeholder="Tìm theo số điện thoại"
                                prefix={<PhoneOutlined style={{ color: '#ff4d4f' }} />}
                                allowClear
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