import { Card, Col, Row, Statistic } from "antd";
import { useEffect, useState } from "react";
import CountUp from 'react-countup';
import { callFetchDashboard } from "../../services/api";
const AdminPage = () => {
    const [dataDashboard, setDataDashboard] = useState({
        totalTables: 0,
        totalOrders: 0,
        totalCategories: 0,
        totalProducts: 0,
    })

    useEffect(() => {
        const initDashboard = async () => {
            const res = await callFetchDashboard();
            if (res && res.data) setDataDashboard(res.data)
        }
        initDashboard();
    }, []);

    const formatter = (value) => <CountUp end={value} separator="," />;
    return (
        <Row gutter={[40, 40]}>
            <Col span={10}>
                <Card title="" bordered={false} >
                    <Statistic
                        title="Tổng Số Bàn"
                        value={dataDashboard.totalTables}
                        formatter={formatter}
                    />
                </Card>
            </Col>
            <Col span={10}>
                <Card title="" bordered={false} >
                    <Statistic
                        title="Tổng Số Danh mục"
                        value={dataDashboard.totalCategories}
                        formatter={formatter}
                    />
                </Card>
            </Col>
            <Col span={10}>
                <Card title="" bordered={false} >
                    <Statistic
                        title="Tổng Số Food"
                        value={dataDashboard.totalProducts}
                        formatter={formatter}
                    />
                </Card>
            </Col>
            <Col span={10}>
                <Card title="" bordered={false} >
                    <Statistic title="Tổng Đơn hàng" value={dataDashboard.totalOrders} precision={2} formatter={formatter} />
                </Card>
            </Col>
        </Row>
    )
}

export default AdminPage;