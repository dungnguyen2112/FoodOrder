import { Col, Divider, Form, Radio, Row, Checkbox, Input, message, notification, Card, Badge, Button, Typography, Space, Spin } from 'antd';
import { DeleteTwoTone, LoadingOutlined, ShoppingOutlined, CreditCardOutlined, HomeOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { doDeleteItemCartAction, doPlaceOrderAction } from '../../redux/order/orderSlice';
import { clearBuyNowAction } from '../../redux/order/buyNowSlice';
import { callPlaceOrder, callCreateVNPayment } from '../../services/api';
import './Payment.scss';
import { set } from 'lodash';

const { TextArea } = Input;
const { Title, Text } = Typography;

const Payment = (props) => {
    const carts = useSelector(state => state.order.carts);
    const buyNowItem = useSelector(state => state.buyNow.buyNowItem);
    const [totalPrice, setTotalPrice] = useState(0);
    const dispatch = useDispatch();
    const [isSubmit, setIsSubmit] = useState(false);
    const user = useSelector(state => state.account.user);
    const [form] = Form.useForm();
    const [isFinish, setIsFinish] = useState(false);
    const [isDineIn, setIsDineIn] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const restaurantAddress = "Nhà hàng ABC, 123 Đường XYZ, Quận 1, TP. Hồ Chí Minh";
    const restaurantTable = "Ăn tại nhà";

    useEffect(() => {
        if (buyNowItem) {
            setTotalPrice(buyNowItem.quantity * buyNowItem.detail.price);
            form.setFieldsValue({ address: restaurantAddress });
        } else if (carts.length > 0) {
            const sum = carts.reduce((acc, item) => acc + item.quantity * item.detail.price, 0);
            setTotalPrice(sum);
            form.setFieldsValue({ address: restaurantAddress });
        } else {
            setTotalPrice(0);
        }
        localStorage.removeItem('buyNowFromDetailPage');
        //Cleanup: Xóa buyNowItem nếu thoát ra mà không đặt hàng
        return () => {
            if (buyNowItem && !isSubmit && isFinish) {
                dispatch(clearBuyNowAction());
                console.log("Đã xóa buyNowItem vì thoát ra giữa chừng");
            }
        };

    }, [carts, buyNowItem, form, dispatch, isSubmit]);

    const handleDineInChange = (e) => {
        setIsDineIn(e.target.checked);
        form.setFieldsValue({ address: e.target.checked ? restaurantAddress : "" });
    };

    const onFinish = async (values) => {
        setIsFinish(true);
        setIsSubmit(true);
        let detailOrder = [];

        if (buyNowItem) {
            detailOrder = [{
                bookName: buyNowItem.detail.name,
                quantity: buyNowItem.quantity,
                id: buyNowItem.id
            }];
        } else if (carts.length > 0) {
            detailOrder = carts.map(item => ({
                bookName: item.detail.name,
                quantity: item.quantity,
                id: item.id
            }));
        }

        if (detailOrder.length === 0) {
            notification.error({ message: "Không có sản phẩm để đặt hàng!" });
            setIsSubmit(false);
            return;
        }

        const data = {
            name: values.name,
            address: values.address,
            phone: values.phone,
            totalPrice: totalPrice,
            detail: detailOrder,
            isDineIn: isDineIn,
            tableNumber: isDineIn ? values.tableNumber : restaurantTable,
            paymentMethod: paymentMethod
        };

        try {
            const res = await callPlaceOrder(data);
            if (res && res.data) {
                console.log("Order response:", res.data);

                // If VNPay payment method is selected, redirect to VNPay payment page
                if (paymentMethod === 'VNPAY') {
                    try {
                        // Lấy ID đơn hàng từ phản hồi
                        const orderId = res.data.orderId;

                        if (!orderId) {
                            console.error("Order ID not found in response:", res.data);
                            notification.error({
                                message: "Lỗi tạo thanh toán VNPay",
                                description: "Không thể lấy mã đơn hàng"
                            });
                            setIsSubmit(false);
                            return;
                        }

                        // Đảm bảo totalPrice là số hợp lệ
                        const amount = parseFloat(totalPrice);
                        if (isNaN(amount) || amount <= 0) {
                            console.error("Invalid amount:", totalPrice);
                            notification.error({
                                message: "Lỗi tạo thanh toán VNPay",
                                description: "Số tiền không hợp lệ"
                            });
                            setIsSubmit(false);
                            return;
                        }

                        console.log("Calling VNPay payment with order ID:", orderId, "amount:", amount);

                        // Gọi API tạo URL thanh toán VNPay
                        const vnpayRes = await callCreateVNPayment(amount, orderId);
                        console.log("VNPay response:", vnpayRes);

                        // Xử lý phản hồi có thể là object hoặc string
                        let paymentUrl = null;
                        if (vnpayRes) {
                            if (typeof vnpayRes === 'string' && vnpayRes.startsWith('http')) {
                                // Trường hợp 1: Phản hồi là URL string trực tiếp
                                paymentUrl = vnpayRes;
                            } else if (vnpayRes.paymentUrl && typeof vnpayRes.paymentUrl === 'string') {
                                // Trường hợp 2: Phản hồi là object với thuộc tính paymentUrl
                                paymentUrl = vnpayRes.paymentUrl;
                            } else if (vnpayRes.data && vnpayRes.data.paymentUrl) {
                                // Trường hợp 3: Phản hồi trong data.paymentUrl
                                paymentUrl = vnpayRes.data.paymentUrl;
                            }
                        }

                        console.log("Extracted payment URL:", paymentUrl);

                        // Kiểm tra URL thanh toán
                        if (paymentUrl) {
                            console.log("Redirecting to VNPay:", paymentUrl);
                            window.location.href = paymentUrl;
                        } else {
                            console.error("No valid payment URL found in response:", vnpayRes);
                            notification.error({
                                message: "Lỗi tạo thanh toán VNPay",
                                description: "Không thể tạo URL thanh toán VNPay"
                            });
                            setIsSubmit(false);
                        }
                    } catch (error) {
                        console.error("Error creating VNPay payment:", error);
                        notification.error({
                            message: "Lỗi tạo thanh toán VNPay",
                            description: error.message || "Đã có lỗi xảy ra khi tạo URL thanh toán VNPay"
                        });
                        setIsSubmit(false);
                    }
                } else {
                    // COD payment
                    message.success('Đặt hàng thành công!');
                    if (buyNowItem) {
                        dispatch(clearBuyNowAction()); // Xóa buyNowItem sau khi đặt hàng thành công
                        props.setcurrentStepBuyNow(1);
                    } else {
                        dispatch(doPlaceOrderAction()); // Xóa giỏ hàng
                    }
                    props.setCurrentStep && props.setCurrentStep(2);
                    props.setcurrentStepBuyNow && props.setcurrentStepBuyNow(1);
                }
            } else {
                notification.error({
                    message: "Đã có lỗi xảy ra",
                    description: res.message
                });
                setIsSubmit(false);
            }
        } catch (error) {
            console.error("Error placing order:", error);
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: error.message || "Lỗi khi đặt hàng"
            });
            setIsSubmit(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    return (
        <div className="payment-container">
            <Row gutter={[24, 24]}>
                <Col md={16} xs={24}>
                    <Card
                        title={
                            <div className="cart-header">
                                <ShoppingOutlined className="cart-icon" />
                                <span>{buyNowItem ? 'Xác nhận mua ngay' : 'Giỏ hàng của bạn'}</span>
                                <Badge count={buyNowItem ? 1 : carts?.length || 0} className="cart-badge" />
                            </div>
                        }
                        className="cart-card"
                    >
                        {buyNowItem ? (
                            <div className="cart-item">
                                <div className="item-image">
                                    <img
                                        src={`${import.meta.env.VITE_CLOUDINARY_URL}/food/${buyNowItem.detail.image}`}
                                        alt={buyNowItem.detail.name}
                                    />
                                </div>
                                <div className="item-info">
                                    <Title level={5}>{buyNowItem.detail.name}</Title>
                                    <Text type="secondary">Đơn giá: {formatCurrency(buyNowItem.detail.price)}</Text>
                                    <Text strong>Số lượng: {buyNowItem.quantity}</Text>
                                </div>
                                <div className="item-actions">
                                    <Text className="item-total">
                                        {formatCurrency(buyNowItem.detail.price * buyNowItem.quantity)}
                                    </Text>
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
                                        onClick={() => dispatch(clearBuyNowAction())}
                                    />
                                </div>
                            </div>
                        ) : carts.length > 0 ? (
                            carts.map((item, index) => (
                                <div className="cart-item" key={`item-${index}`}>
                                    <div className="item-image">
                                        <img
                                            src={`${import.meta.env.VITE_CLOUDINARY_URL}/food/${item?.detail?.image}`}
                                            alt={item?.detail?.name}
                                        />
                                    </div>
                                    <div className="item-info">
                                        <Title level={5}>{item?.detail?.name}</Title>
                                        <Text type="secondary">Đơn giá: {formatCurrency(item.detail.price)}</Text>
                                        <Text strong>Số lượng: {item?.quantity}</Text>
                                    </div>
                                    <div className="item-actions">
                                        <Text className="item-total">
                                            {formatCurrency(item.detail.price * item.quantity)}
                                        </Text>
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
                                            onClick={() => dispatch(doDeleteItemCartAction({ id: item.id }))}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-cart">
                                <ShoppingOutlined className="empty-icon" />
                                <Text>Giỏ hàng trống</Text>
                            </div>
                        )}
                    </Card>
                </Col>
                <Col md={8} xs={24}>
                    <Card
                        title={
                            <div className="order-summary-header">
                                <CreditCardOutlined className="summary-icon" />
                                <span>Thông tin đặt hàng</span>
                            </div>
                        }
                        className="order-summary-card"
                    >
                        <Form
                            form={form}
                            onFinish={onFinish}
                            layout="vertical"
                            className="order-form"
                        >
                            <Form.Item
                                label={<><UserOutlined /> Tên người nhận</>}
                                name="name"
                                initialValue={user?.fullName}
                                rules={[{ required: true, message: 'Tên người nhận không được để trống!' }]}
                            >
                                <Input placeholder="Nhập tên người nhận" />
                            </Form.Item>

                            <Form.Item
                                label={<><PhoneOutlined /> Số điện thoại</>}
                                name="phone"
                                initialValue={user?.phone}
                                rules={[{ required: true, message: 'Số điện thoại không được để trống!' }]}
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>

                            <Form.Item
                                label={<><HomeOutlined /> Địa chỉ</>}
                                name="address"
                                rules={[{ required: true, message: 'Địa chỉ không được để trống!' }]}
                            >
                                <TextArea rows={3} placeholder="Nhập địa chỉ nhận hàng" />
                            </Form.Item>

                            <Form.Item name="isDineIn" valuePropName="checked" className="dine-in-option">
                                <Checkbox onChange={handleDineInChange}>
                                    <Text strong>Ăn tại nhà hàng</Text>
                                </Checkbox>
                            </Form.Item>

                            {isDineIn && (
                                <Form.Item
                                    label="Số bàn"
                                    name="tableNumber"
                                    rules={[{ required: true, message: 'Vui lòng nhập số bàn!' }]}
                                >
                                    <Input placeholder="Nhập số bàn" />
                                </Form.Item>
                            )}
                        </Form>

                        <div className="payment-method">
                            <Title level={5}>Hình thức thanh toán</Title>
                            <Radio.Group onChange={handlePaymentMethodChange} value={paymentMethod}>
                                <Space direction="vertical">
                                    <Radio value="COD">
                                        <Text>Thanh toán khi nhận hàng (COD)</Text>
                                    </Radio>
                                    <Radio value="VNPAY">
                                        <div className="vnpay-option">
                                            <Text>Thanh toán qua VNPay</Text>
                                            <img src="data:image/png;base64,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" alt="VNPay" style={{ height: 30, marginLeft: 10 }} />
                                        </div>
                                    </Radio>
                                </Space>
                            </Radio.Group>
                        </div>

                        <Divider className="summary-divider" />

                        <div className="order-total">
                            <Text strong>Tổng tiền:</Text>
                            <Text className="total-amount">
                                {formatCurrency(totalPrice || 0)}
                            </Text>
                        </div>

                        <Button
                            type="primary"
                            block
                            size="large"
                            className="checkout-button"
                            onClick={() => form.submit()}
                            disabled={isSubmit || (!buyNowItem && carts.length === 0)}
                        >
                            {isSubmit ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /> : "Đặt hàng"}
                            {!isSubmit && <span>({buyNowItem ? 1 : carts?.length ?? 0} món)</span>}
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Payment;