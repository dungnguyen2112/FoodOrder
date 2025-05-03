import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Result, Spin, Typography, Alert } from "antd";
import { callFetchVerifyPayment } from "../../services/api";
import { useDispatch } from 'react-redux';
import { doPlaceOrderAction } from '../../redux/order/orderSlice';
import { clearBuyNowAction } from '../../redux/order/buyNowSlice';

const { Text } = Typography;

const PaymentCallback = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);

    // VNPay error codes
    const errorMap = {
        "00": "Giao dịch thành công",
        "01": "Giao dịch đã tồn tại",
        "02": "Merchant không hợp lệ",
        "03": "Dữ liệu gửi sang không đúng định dạng",
        "15": "Giao dịch đã quá thời gian chờ thanh toán",
        "24": "Giao dịch bị hủy",
        "75": "Ngân hàng thanh toán đang bảo trì",
        "76": "Ngân hàng thanh toán không hỗ trợ phương thức thanh toán này",
        "99": "Có lỗi xảy ra trong quá trình xử lý"
    };

    useEffect(() => {
        const responseCode = searchParams.get("vnp_ResponseCode");
        const txnRef = searchParams.get("vnp_TxnRef");

        console.log("Payment Callback Parameters:", { responseCode, txnRef });

        const verifyPayment = async () => {
            setLoading(true);
            try {
                if (responseCode && txnRef) {
                    // Special handling for error code 15
                    if (responseCode === "15") {
                        setPaymentResult({
                            success: false,
                            message: "Giao dịch đã quá thời gian chờ thanh toán",
                            orderId: txnRef,
                            canRetry: true
                        });
                        setLoading(false);
                        return;
                    }

                    const res = await callFetchVerifyPayment(`/api/v1/payment/verify-callback?vnp_ResponseCode=${responseCode}&vnp_TxnRef=${txnRef}`);
                    console.log("Payment verification response:", res);
                    setPaymentResult(res);

                    // Clear cart on successful payment
                    if (responseCode === '00') {
                        // Clear buyNow item or cart
                        dispatch(clearBuyNowAction());
                        dispatch(doPlaceOrderAction());
                    }
                } else {
                    setError("Thiếu thông tin xác thực thanh toán");
                }
            } catch (err) {
                console.error("Payment verification error:", err);
                setError(err.message || "Có lỗi xảy ra khi xác minh thanh toán");
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams]);

    // Function to retry payment
    const retryPayment = (orderId) => {
        window.location.href = `/api/v1/payment/vnpay/pay-direct?orderId=${orderId}`;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
                <p style={{ marginTop: 20 }}>Đang xác minh thông tin thanh toán...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Result
                status="error"
                title="Xác minh thanh toán không thành công"
                subTitle={error}
                extra={[
                    <Button type="primary" key="home" onClick={() => navigate('/')}>
                        Về Trang chủ
                    </Button>,
                    <Button key="history" onClick={() => navigate('/history')}>
                        Xem lịch sử đơn hàng
                    </Button>
                ]}
            />
        );
    }

    const responseCode = searchParams.get("vnp_ResponseCode");
    const isSuccess = responseCode === "00";
    const errorDescription = errorMap[responseCode] || "Lỗi không xác định";
    const isTimeout = responseCode === "15";
    const canRetry = isTimeout && paymentResult && paymentResult.orderId;

    return (
        <div style={{ padding: '20px 0', maxWidth: 1440, margin: '0 auto' }}>
            <Result
                status={isSuccess ? "success" : "error"}
                title={isSuccess ? "Thanh toán thành công" : "Thanh toán không thành công"}
                subTitle={isSuccess ? "Cảm ơn bạn đã mua hàng!" : errorDescription}
                extra={[
                    canRetry ? (
                        <Button
                            type="primary"
                            key="retry"
                            onClick={() => retryPayment(paymentResult.orderId)}
                        >
                            Thử lại thanh toán
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            key="history"
                            onClick={() => navigate('/history')}
                        >
                            Xem đơn hàng
                        </Button>
                    ),
                    <Button key="home" onClick={() => navigate('/')}>
                        Tiếp tục mua hàng
                    </Button>
                ]}
            >
                {isTimeout && (
                    <Alert
                        message="Giao dịch đã hết thời gian"
                        description="Quý khách có thể thử lại giao dịch hoặc chọn phương thức thanh toán khác."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 20 }}
                    />
                )}

                {paymentResult && paymentResult.orderId && (
                    <div style={{ textAlign: 'left', marginTop: 20 }}>
                        <Text strong>Thông tin đơn hàng:</Text>
                        <div style={{ marginTop: 10 }}>
                            <p>Mã đơn hàng: {paymentResult.orderId}</p>
                            {paymentResult.orderStatus && (
                                <p>Trạng thái đơn hàng: {paymentResult.orderStatus}</p>
                            )}
                            {paymentResult.paymentStatus && (
                                <p>Trạng thái thanh toán: {paymentResult.paymentStatus}</p>
                            )}
                        </div>
                    </div>
                )}
            </Result>
        </div>
    );
};

export default PaymentCallback; 