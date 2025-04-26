import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Select, Space, Typography } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_ENUM = {
    AVAILABLE: "AVAILABLE",
    BUSY: "BUSY"
};

const STATUS_LABELS = {
    [STATUS_ENUM.AVAILABLE]: 'Trống',
    [STATUS_ENUM.BUSY]: 'Đang phục vụ'
};

const InputSearchTable = (props) => {
    const { handleSearchTable, setFilter } = props;
    const [form] = Form.useForm();
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    const onFinish = (values) => {
        let query = "";
        if (values.tableNumber) {
            query += `filter=tableNumber ~ '${values.tableNumber}'`;
        }

        if (values.status) {
            if (query) query += " and ";
            else query += "filter=";
            query += `status = '${values.status}'`;
        }

        handleSearchTable(query);
    };

    const handleReset = () => {
        form.resetFields();
        setFilter("");
    };

    return (
        <div className="table-search-container">
            <div className="search-header">
                <Title level={5} style={{ margin: 0 }}>
                    <SearchOutlined /> Tìm kiếm bàn ăn
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
                name="search_table"
                onFinish={onFinish}
                layout={showAdvancedSearch ? "vertical" : "inline"}
                className={`search-form ${showAdvancedSearch ? 'advanced' : 'basic'}`}
            >
                <Row gutter={[16, 16]} style={{ width: '100%' }}>
                    <Col xs={24} sm={showAdvancedSearch ? 12 : 16} md={showAdvancedSearch ? 8 : 16} lg={showAdvancedSearch ? 6 : 16}>
                        <Form.Item
                            name="tableNumber"
                            label={showAdvancedSearch ? <Text strong>Số bàn</Text> : null}
                        >
                            <Input
                                placeholder="Tìm theo số bàn"
                                allowClear
                                prefix={<SearchOutlined style={{ color: '#ff4d4f' }} />}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Item>
                    </Col>

                    {showAdvancedSearch && (
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item
                                name="status"
                                label={<Text strong>Trạng thái</Text>}
                            >
                                <Select placeholder="Chọn trạng thái" allowClear style={{ borderRadius: '8px' }}>
                                    <Option value={STATUS_ENUM.AVAILABLE}>{STATUS_LABELS[STATUS_ENUM.AVAILABLE]}</Option>
                                    <Option value={STATUS_ENUM.BUSY}>{STATUS_LABELS[STATUS_ENUM.BUSY]}</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    )}

                    <Col xs={24} sm={showAdvancedSearch ? 24 : 8} md={showAdvancedSearch ? 8 : 8} lg={showAdvancedSearch ? 12 : 8}>
                        <Form.Item style={{ textAlign: showAdvancedSearch ? 'right' : 'left' }}>
                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SearchOutlined />}
                                    style={{
                                        backgroundColor: '#ff4d4f',
                                        borderColor: '#ff4d4f',
                                        borderRadius: '8px'
                                    }}
                                >
                                    Tìm kiếm
                                </Button>
                                <Button
                                    icon={<ClearOutlined />}
                                    onClick={handleReset}
                                    style={{ borderRadius: '8px' }}
                                >
                                    Xóa
                                </Button>
                            </Space>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default InputSearchTable;