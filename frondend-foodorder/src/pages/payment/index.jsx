import { Breadcrumb, Button, Result, Steps } from "antd";
import Payment from "../../components/Order/Payment"
import { HomeOutlined, SmileOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";



export const PaymentPage = () => {
    const [currentStepBuyNow, setcurrentStepBuyNow] = useState(0);
    const navigate = useNavigate();
    return (
        <div style={{ background: '#efefef', padding: "20px 0" }}>
            <div className="order-container" style={{ maxWidth: 1440, margin: '0 auto' }}>
                <Breadcrumb
                    style={{ margin: '5px 0' }}
                    items={[
                        {
                            // href: '#',
                            title: <HomeOutlined />,
                        },
                        {
                            title: (
                                <Link to={'/'}>
                                    <span>Trang Chủ</span>
                                </Link>
                            ),
                        }
                    ]}
                />
                <div className="order-steps">
                    <Steps
                        size="small"
                        current={currentStepBuyNow}
                        status={"finish"}
                        items={[
                            {
                                title: 'Đặt hàng',
                            },
                            {
                                title: 'Thanh toán',
                            },
                        ]}
                    />
                </div>
                {currentStepBuyNow === 0 &&
                    <Payment setcurrentStepBuyNow={setcurrentStepBuyNow} />
                }

                {currentStepBuyNow === 1 &&
                    <Result
                        icon={<SmileOutlined />}
                        title="Đơn hàng đã được đặt thành công!"
                        extra={<Button type="primary"
                            onClick={() => navigate('/history')}
                        >Xem lịch sử</Button>}
                    />
                }
            </div>
        </div>
    )
}

export default PaymentPage;