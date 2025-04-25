import { Descriptions, Drawer, Typography, Card, Row, Col, Space } from "antd";
import moment from 'moment';
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const UserViewDetail = (props) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    }

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UserOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />
                    <span>Chi tiết người dùng</span>
                </div>
            }
            width={"50vw"}
            onClose={onClose}
            open={openViewDetail}
            extra={
                <div className="drawer-subtitle">
                    {dataViewDetail &&
                        <Text type="secondary">Mã người dùng: #{dataViewDetail.id}</Text>
                    }
                </div>
            }
            className="admin-drawer"
        >
            {dataViewDetail && (
                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <Card
                            title={
                                <Title level={5} style={{ margin: 0 }}>
                                    <UserOutlined /> Thông tin người dùng
                                </Title>
                            }
                            className="user-detail-card"
                        >
                            <Descriptions
                                bordered
                                column={1}
                                labelStyle={{ width: '200px', fontWeight: 500 }}
                                contentStyle={{ fontWeight: 400 }}
                                className="detail-descriptions"
                            >
                                <Descriptions.Item label="Tên hiển thị">
                                    <Text strong style={{ fontSize: '16px' }}>
                                        {dataViewDetail.name}
                                    </Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Email">
                                    <Space>
                                        <MailOutlined />
                                        <Text copyable>{dataViewDetail.email}</Text>
                                    </Space>
                                </Descriptions.Item>

                                {dataViewDetail.phone && (
                                    <Descriptions.Item label="Số điện thoại">
                                        <Space>
                                            <PhoneOutlined />
                                            <Text copyable>{dataViewDetail.phone}</Text>
                                        </Space>
                                    </Descriptions.Item>
                                )}

                                {dataViewDetail.createdAt && (
                                    <Descriptions.Item label="Ngày tạo">
                                        <Space>
                                            <CalendarOutlined />
                                            <Text>{moment(dataViewDetail.createdAt).format(FORMAT_DATE_DISPLAY)}</Text>
                                        </Space>
                                    </Descriptions.Item>
                                )}

                                {dataViewDetail.updatedAt && (
                                    <Descriptions.Item label="Cập nhật lần cuối">
                                        <Space>
                                            <CalendarOutlined />
                                            <Text>{moment(dataViewDetail.updatedAt).format(FORMAT_DATE_DISPLAY)}</Text>
                                        </Space>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>
            )}
        </Drawer>
    );
}

export default UserViewDetail;