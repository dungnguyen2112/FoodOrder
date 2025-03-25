import { Col, Divider, Form, Radio, Row, Checkbox, Input, message, notification, Card, Badge, Button, Typography, Space, Spin } from 'antd';
import { DeleteTwoTone, LoadingOutlined, ShoppingOutlined, CreditCardOutlined, HomeOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { doDeleteItemCartAction, doPlaceOrderAction } from '../../redux/order/orderSlice';
import { clearBuyNowAction } from '../../redux/order/buyNowSlice';
import { callPlaceOrder } from '../../services/api';
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
            tableNumber: isDineIn ? values.tableNumber : restaurantTable
        };

        const res = await callPlaceOrder(data);
        if (res && res.data) {
            message.success('Đặt hàng thành công!');
            if (buyNowItem) {
                dispatch(clearBuyNowAction()); // Xóa buyNowItem sau khi đặt hàng thành công
                props.setcurrentStepBuyNow(1);
            } else {
                dispatch(doPlaceOrderAction()); // Xóa giỏ hàng
            }
            props.setCurrentStep(2);
        } else {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: res.message
            });
        }
        setIsSubmit(false);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
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
                                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/food/${buyNowItem.detail.image}`}
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
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/food/${item?.detail?.image}`}
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
                            <Radio checked>
                                <Text>Thanh toán khi nhận hàng</Text>
                            </Radio>
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