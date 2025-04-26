import { Descriptions, Divider, Drawer, Tag, Typography, Card, Row, Col } from "antd";
import moment from 'moment';
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
import { CheckCircleOutlined, CloseCircleOutlined, TableOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const STATUS_ENUM = {
    AVAILABLE: "AVAILABLE",
    BUSY: "BUSY"
};

const STATUS_COLORS = {
    [STATUS_ENUM.AVAILABLE]: '#52c41a',
    [STATUS_ENUM.BUSY]: '#ff4d4f'
};

const STATUS_LABELS = {
    [STATUS_ENUM.AVAILABLE]: 'Trống',
    [STATUS_ENUM.BUSY]: 'Đang phục vụ'
};

const STATUS_ICONS = {
    [STATUS_ENUM.AVAILABLE]: <CheckCircleOutlined />,
    [STATUS_ENUM.BUSY]: <CloseCircleOutlined />
};

const TableViewDetail = (props) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    }

    const getStatusTag = (status) => {
        if (!status || !STATUS_ENUM[status]) return null;

        return (
            <Tag
                icon={STATUS_ICONS[status]}
                color={STATUS_COLORS[status]}
                className="status-tag"
            >
                {STATUS_LABELS[status]}
            </Tag>
        );
    };

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TableOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />
                    <span>Chi tiết bàn ăn</span>
                </div>
            }
            width={"50vw"}
            onClose={onClose}
            open={openViewDetail}
            extra={
                <div className="drawer-subtitle">
                    {dataViewDetail &&
                        <Text type="secondary">Mã bàn: #{dataViewDetail.id}</Text>
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
                                    <TableOutlined /> Thông tin bàn
                                </Title>
                            }
                            className="table-detail-card"
                        >
                            <Descriptions
                                bordered
                                column={1}
                                labelStyle={{ width: '200px', fontWeight: 500 }}
                                contentStyle={{ fontWeight: 400 }}
                                className="detail-descriptions"
                            >
                                <Descriptions.Item label="Số bàn">
                                    <Text strong style={{ fontSize: '16px' }}>
                                        Bàn {dataViewDetail.tableNumber}
                                    </Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Trạng thái hiện tại">
                                    {getStatusTag(dataViewDetail.status)}
                                </Descriptions.Item>

                                {dataViewDetail.createdAt && (
                                    <Descriptions.Item label="Ngày tạo">
                                        <CalendarOutlined /> {moment(dataViewDetail.createdAt).format(FORMAT_DATE_DISPLAY)}
                                    </Descriptions.Item>
                                )}

                                {dataViewDetail.updatedAt && (
                                    <Descriptions.Item label="Cập nhật lần cuối">
                                        <CalendarOutlined /> {moment(dataViewDetail.updatedAt).format(FORMAT_DATE_DISPLAY)}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card
                            className="table-detail-help-card"
                            size="small"
                            bordered={false}
                            style={{ backgroundColor: '#f9f9f9', borderRadius: '8px' }}
                        >
                            <div style={{ padding: '8px' }}>
                                <Text type="secondary" style={{ fontStyle: 'italic' }}>
                                    * Bạn có thể cập nhật trạng thái bàn từ màn hình quản lý bàn ăn
                                </Text>
                            </div>
                        </Card>
                    </Col>
                </Row>
            )}
        </Drawer>
    );
};

export default TableViewDetail;