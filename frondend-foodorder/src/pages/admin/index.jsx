import { Card, Col, Row, Statistic, Divider, Typography, Space, Empty } from "antd";
import { useEffect, useState } from "react";
import CountUp from 'react-countup';
import { callFetchDashboard, callFetchListOrder, getProductWishlist, getWishlist } from "../../services/api";
import {
    TableOutlined,
    ShoppingCartOutlined,
    AppstoreOutlined,
    CoffeeOutlined,
    UserOutlined,
    FireOutlined,
    ClockCircleOutlined,
    RiseOutlined
} from '@ant-design/icons';
import './dashboard.scss';
import moment from 'moment';
import 'moment/locale/vi';

const { Title, Text } = Typography;

const AdminPage = () => {
    const [dataDashboard, setDataDashboard] = useState({
        totalTables: 0,
        totalOrders: 0,
        totalCategories: 0,
        totalProducts: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [popularItems, setPopularItems] = useState([]);
    const [loading, setLoading] = useState({
        dashboard: false,
        orders: false,
        wishlist: false
    });

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(prev => ({ ...prev, dashboard: true }));
            try {
                const res = await callFetchDashboard();
                if (res && res.data) setDataDashboard(res.data);
            } catch (error) {
                console.error("Lỗi khi tải thông tin dashboard:", error);
            } finally {
                setLoading(prev => ({ ...prev, dashboard: false }));
            }
        }

        const fetchRecentOrders = async () => {
            setLoading(prev => ({ ...prev, orders: true }));
            try {
                // Lấy tối đa 5 đơn hàng, sắp xếp theo thời gian gần nhất
                const res = await callFetchListOrder("page=1&size=5&sort=createdAt,desc");
                if (res && res.data && res.data.result) {
                    const formattedOrders = res.data.result.map(order => ({
                        id: order.orderId || order.orderId,
                        orderCode: order.orderId || `ORD-${order.orderId?.substring(0, 4)}`,
                        table: order.tableNumber ? `Bàn ${order.tableNumber}` : "Không có bàn",
                        status: order.status,
                        time: moment(order.createdAt).fromNow()
                    }));
                    setRecentOrders(formattedOrders.slice(0, 3)); // Chỉ lấy 3 đơn gần 
                    console.log(recentOrders)
                }
            } catch (error) {
                console.error("Lỗi khi tải đơn hàng gần đây:", error);
            } finally {
                setLoading(prev => ({ ...prev, orders: false }));
            }
        }

        const fetchPopularItems = async () => {
            setLoading(prev => ({ ...prev, wishlist: true }));
            try {
                const res = await getProductWishlist();
                if (res && res.data) {
                    // Nhóm sản phẩm theo số lượng yêu thích và sắp xếp giảm dần
                    const productCounts = {};

                    res.data.list.forEach(item => {
                        const productId = item.id;
                        const productName = item.name || "Sản phẩm không xác định";

                        if (!productCounts[productId]) {
                            productCounts[productId] = {
                                name: productName,
                                count: 0
                            };
                        }
                        productCounts[productId].count += 1;
                    });

                    // Chuyển đổi thành mảng và sắp xếp
                    const sortedProducts = Object.values(productCounts)
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 3); // Lấy 3 món được yêu thích nhất

                    setPopularItems(sortedProducts);
                }
            } catch (error) {
                console.error("Lỗi khi tải món ăn yêu thích:", error);
            } finally {
                setLoading(prev => ({ ...prev, wishlist: false }));
            }
        }

        initDashboard();
        fetchRecentOrders();
        fetchPopularItems();
    }, []);

    // Hàm chuyển đổi trạng thái đơn hàng
    // const getOrderStatus = (statusCode) => {
    //     const statusMap = {
    //         'pending': 'Đang xử lý',
    //         'processing': 'Đang chuẩn bị',
    //         'delivering': 'Đang phục vụ',
    //         'completed': 'Hoàn thành',
    //         'cancelled': 'Đã hủy'
    //     };
    //     return statusMap[statusCode] || 'Không xác định';
    // };

    const formatter = (value) => <CountUp end={value} separator="," />;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <Title level={3}>Tổng quan nhà hàng</Title>
                <Text type="secondary">Xin chào! Đây là tổng quan hoạt động nhà hàng hôm nay</Text>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={12} lg={6}>
                    <Card
                        bordered={false}
                        className="dashboard-card restaurant-card"
                        loading={loading.dashboard}
                    >
                        <Statistic
                            title="Tổng số bàn"
                            value={dataDashboard.totalTables}
                            formatter={formatter}
                            prefix={<TableOutlined className="statistic-icon" />}
                        />
                        <div className="card-footer">
                            <Text type="secondary">Quản lý sơ đồ bàn</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                    <Card
                        bordered={false}
                        className="dashboard-card restaurant-card"
                        loading={loading.dashboard}
                    >
                        <Statistic
                            title="Tổng danh mục"
                            value={dataDashboard.totalCategories}
                            formatter={formatter}
                            prefix={<AppstoreOutlined className="statistic-icon" />}
                        />
                        <div className="card-footer">
                            <Text type="secondary">Phân loại thực đơn</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                    <Card
                        bordered={false}
                        className="dashboard-card restaurant-card"
                        loading={loading.dashboard}
                    >
                        <Statistic
                            title="Tổng món ăn"
                            value={dataDashboard.totalProducts}
                            formatter={formatter}
                            prefix={<CoffeeOutlined className="statistic-icon" />}
                        />
                        <div className="card-footer">
                            <Text type="secondary">Món ăn đang phục vụ</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                    <Card
                        bordered={false}
                        className="dashboard-card restaurant-card active-card"
                        loading={loading.dashboard}
                    >
                        <Statistic
                            title="Tổng đơn hàng"
                            value={dataDashboard.totalOrders}
                            formatter={formatter}
                            prefix={<ShoppingCartOutlined className="statistic-icon" />}
                        />
                        <div className="card-footer">
                            <Text type="secondary">Đơn đã xử lý</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider />

            <Row gutter={[24, 24]} className="analytics-section">
                <Col xs={24} lg={16}>
                    <Card
                        title="Đơn hàng gần đây"
                        bordered={false}
                        className="orders-card"
                        loading={loading.orders}
                    >
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order, index) => (
                                <div key={index} className="recent-order-item">
                                    <div className="order-info">
                                        <Text strong>{order.orderCode}</Text>
                                        <Text>{order.table}</Text>
                                    </div>
                                    <div className="order-status">
                                        <Text>{order.status}</Text>
                                        <Text type="secondary"><ClockCircleOutlined /> {order.time}</Text>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Empty
                                description="Chưa có đơn hàng nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card
                        title="Món ăn được yêu thích"
                        bordered={false}
                        className="popular-card"
                        loading={loading.wishlist}
                    >
                        {popularItems.length > 0 ? (
                            popularItems.map((item, index) => (
                                <div key={index} className="popular-item">
                                    <div className="item-info">
                                        <FireOutlined className={`popular-icon rank-${index + 1}`} />
                                        <Text>{item.name}</Text>
                                    </div>
                                    <Text strong>{item.count} lượt thích</Text>
                                </div>
                            ))
                        ) : (
                            <Empty
                                description="Chưa có món ăn yêu thích"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default AdminPage;