import { Descriptions, Drawer, Typography, Card, Row, Col, Space, Avatar, Divider, Tag } from "antd";
import moment from 'moment';
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    HomeOutlined,
    ShoppingOutlined,
    DollarOutlined,
    IdcardOutlined,
    CrownOutlined,
    FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Royalty level display configuration
const ROYALTY_LEVELS = {
    "BRONZE": { color: "#cd7f32", label: "Đồng" },
    "SILVER": { color: "#c0c0c0", label: "Bạc" },
    "GOLD": { color: "#ffd700", label: "Vàng" },
    "PLATINUM": { color: "#e5e4e2", label: "Bạch kim" }
};

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
                    {/* User Profile Card */}
                    <Col span={24}>
                        <Card className="user-profile-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                                <Avatar
                                    size={100}
                                    icon={<UserOutlined />}
                                    src={`${import.meta.env.VITE_CLOUDINARY_URL}/avatar/${dataViewDetail.avatarUrl}`}
                                />
                                <div>
                                    <Text strong style={{ fontSize: '24px', display: 'block' }}>
                                        {dataViewDetail.name}
                                    </Text>
                                    <Space>
                                        <MailOutlined />
                                        <Text copyable>{dataViewDetail.email}</Text>
                                    </Space>
                                    {dataViewDetail.phone && (
                                        <div style={{ marginTop: '8px' }}>
                                            <Space>
                                                <PhoneOutlined />
                                                <Text copyable>{dataViewDetail.phone}</Text>
                                            </Space>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Basic Information Card */}
                    <Col span={24}>
                        <Card
                            title={
                                <Title level={5} style={{ margin: 0 }}>
                                    <IdcardOutlined /> Thông tin cơ bản
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
                                    <Text strong>{dataViewDetail.name}</Text>
                                </Descriptions.Item>

                                {dataViewDetail.username && (
                                    <Descriptions.Item label="Tên đăng nhập">
                                        <Text>{dataViewDetail.username}</Text>
                                    </Descriptions.Item>
                                )}

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

                                {dataViewDetail.address && (
                                    <Descriptions.Item label="Địa chỉ">
                                        <Space>
                                            <HomeOutlined />
                                            <Text>{dataViewDetail.address}</Text>
                                        </Space>
                                    </Descriptions.Item>
                                )}

                                {dataViewDetail.age !== undefined && (
                                    <Descriptions.Item label="Tuổi">
                                        <Text>{dataViewDetail.age}</Text>
                                    </Descriptions.Item>
                                )}

                                {dataViewDetail.gender && (
                                    <Descriptions.Item label="Giới tính">
                                        <Text>{dataViewDetail.gender}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* Account Status Card */}
                    <Col span={24}>
                        <Card
                            title={
                                <Title level={5} style={{ margin: 0 }}>
                                    <CrownOutlined /> Trạng thái tài khoản
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
                                {dataViewDetail.role && (
                                    <Descriptions.Item label="Vai trò">
                                        <Tag color="blue">{dataViewDetail.role.roleName}</Tag>
                                    </Descriptions.Item>
                                )}

                                {dataViewDetail.royalty && (
                                    <Descriptions.Item label="Cấp độ thành viên">
                                        <Tag color={ROYALTY_LEVELS[dataViewDetail.royalty]?.color || 'default'}>
                                            {ROYALTY_LEVELS[dataViewDetail.royalty]?.label || dataViewDetail.royalty}
                                        </Tag>
                                    </Descriptions.Item>
                                )}

                                {dataViewDetail.totalOrder !== undefined && (
                                    <Descriptions.Item label="Tổng đơn hàng">
                                        <Space>
                                            <ShoppingOutlined />
                                            <Text strong style={{ color: '#1677ff' }}>{dataViewDetail.totalOrder}</Text>
                                        </Space>
                                    </Descriptions.Item>
                                )}

                                {dataViewDetail.totalMoneySpent !== undefined && (
                                    <Descriptions.Item label="Tổng chi tiêu">
                                        <Space>
                                            <DollarOutlined />
                                            <Text strong style={{ color: '#1677ff' }}>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dataViewDetail.totalMoneySpent || 0)}
                                            </Text>
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

                    {/* Bio section if available */}
                    {dataViewDetail.bio && (
                        <Col span={24}>
                            <Card
                                title={
                                    <Title level={5} style={{ margin: 0 }}>
                                        <FileTextOutlined /> Tiểu sử
                                    </Title>
                                }
                                className="user-detail-card"
                            >
                                <Text style={{ whiteSpace: 'pre-line' }}>{dataViewDetail.bio}</Text>
                            </Card>
                        </Col>
                    )}
                </Row>
            )}
        </Drawer>
    );
}

export default UserViewDetail;