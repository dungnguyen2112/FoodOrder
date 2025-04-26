import { Col, Divider, Empty, InputNumber, Row, Card, Typography, Button, Badge } from 'antd';
import { DeleteTwoTone, ShoppingCartOutlined, ShoppingOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { doDeleteItemCartAction, doUpdateCartAction } from '../../redux/order/orderSlice';
import { clearBuyNowAction } from '../../redux/order/buyNowSlice';
import { useNavigate } from 'react-router-dom';
import './ViewOrder.scss';

const { Title, Text } = Typography;

const ViewOrder = (props) => {
    const carts = useSelector(state => state.order.carts);
    const buyNowItem = useSelector(state => state.buyNow.buyNowItem);
    const [totalPrice, setTotalPrice] = useState(0);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isProceeding, setIsProceeding] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);

    // Ref để theo dõi xem có phải là lần đầu tiên load trang không
    const isFirstLoadRef = useRef(true);

    useEffect(() => {
        // Kiểm tra flag từ localStorage
        const comingFromDetailPage = localStorage.getItem('buyNowFromDetailPage') === 'true';

        // Cleanup flag

        // Nếu không phải từ trang chi tiết và không phải đang tiến hành đặt hàng
        if (!comingFromDetailPage && buyNowItem) {
            dispatch(clearBuyNowAction());
            localStorage.removeItem('buyNowFromDetailPage');
            console.log("Cleared buyNowItem due to unexpected navigation");
        }

        // Đánh dấu đã load lần đầu
        isFirstLoadRef.current = false;
    }, [buyNowItem, dispatch, isProceeding]);

    // Các phần code còn lại như cũ
    useEffect(() => {
        let sum = 0;
        if (buyNowItem) {
            sum = buyNowItem.quantity * buyNowItem.detail.price;
            const comingFromDetailPage = localStorage.getItem('buyNowFromDetailPage') === 'true';
            if (comingFromDetailPage) {
                props.setCurrentStep(1);
            }
            // localStorage.removeItem('buyNowFromDetailPage');
        } else if (carts && carts.length > 0) {
            carts.forEach(item => {
                sum += item.quantity * item.detail.price;
            });
        }
        setTotalPrice(sum);
    }, [carts, buyNowItem]);

    const handleOnChangeInput = (value, book) => {
        if (!value || value < 1) return;
        if (!isNaN(value)) {
            dispatch(doUpdateCartAction({ quantity: value, detail: book, id: book.id }));
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const RedirecttoHome = () => {
        navigate('/');
    };

    const handlePlaceOrder = () => {
        setIsSubmit(true);
        setIsProceeding(true);
        localStorage.removeItem('buyNowFromDetailPage');
        if (buyNowItem) {
            console.log("Đặt hàng với:", buyNowItem);
            localStorage.removeItem('buyNowFromDetailPage');
            props.setCurrentStep(1);
        } else if (carts.length > 0) {
            console.log("Đặt hàng với giỏ hàng:", carts);
            props.setCurrentStep(1);
        }
        setIsSubmit(false);
    };

    return (
        <div className="view-order-container">
            <Row gutter={[24, 24]}>
                <Col md={18} xs={24}>
                    <Card
                        title={
                            <div className="cart-header">
                                <ShoppingCartOutlined className="cart-icon" />
                                <span>{buyNowItem ? 'Xác nhận mua ngay' : 'Giỏ hàng của bạn'}</span>
                                <Badge count={buyNowItem ? 1 : carts?.length || 0} className="cart-badge" />
                            </div>
                        }
                        className="cart-card"
                    >
                        {buyNowItem ? (
                            // Hiển thị sản phẩm "Mua ngay"
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
                                </div>
                                <div className="item-quantity">
                                    <Text>Số lượng: {buyNowItem.quantity}</Text>
                                    <Text className="item-subtotal">
                                        {formatCurrency(buyNowItem.detail.price * buyNowItem.quantity)}
                                    </Text>
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
                                        onClick={() => dispatch(clearBuyNowAction())}
                                        className="delete-button"
                                    />
                                </div>
                            </div>
                        ) : carts && carts.length > 0 ? (
                            // Hiển thị giỏ hàng
                            carts.map((book, index) => {
                                const currentBookPrice = book?.detail?.price ?? 0;
                                return (
                                    <div className="cart-item" key={`item-${index}`}>
                                        <div className="item-image">
                                            <img
                                                src={`${import.meta.env.VITE_CLOUDINARY_URL}/food/${book?.detail?.image}`}
                                                alt={book?.detail?.name}
                                            />
                                        </div>
                                        <div className="item-info">
                                            <Title level={5}>{book?.detail?.name}</Title>
                                            <Text type="secondary">Đơn giá: {formatCurrency(currentBookPrice)}</Text>
                                        </div>
                                        <div className="item-quantity">
                                            <div className="quantity-control">
                                                <InputNumber
                                                    min={1}
                                                    value={book.quantity}
                                                    onChange={(value) => handleOnChangeInput(value, book)}
                                                    addonBefore={<MinusOutlined onClick={() => book.quantity > 1 && handleOnChangeInput(book.quantity - 1, book)} />}
                                                    addonAfter={<PlusOutlined onClick={() => handleOnChangeInput(book.quantity + 1, book)} />}
                                                    controls={false}
                                                />
                                            </div>
                                            <Text className="item-subtotal">
                                                {formatCurrency(currentBookPrice * (book?.quantity ?? 0))}
                                            </Text>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
                                                onClick={() => dispatch(doDeleteItemCartAction({ id: book.id }))}
                                                className="delete-button"
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-cart">
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={<Text>Không có sản phẩm trong giỏ hàng</Text>}
                                />
                                <div className="continue-shopping">
                                    <Button type="primary" icon={<ShoppingOutlined />} onClick={RedirecttoHome}>
                                        Tiếp tục mua sắm
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>
                <Col md={6} xs={24}>
                    <Card
                        title={<div className="summary-header"><span>Tóm tắt đơn hàng</span></div>}
                        className="order-summary-card"
                    >
                        <div className="summary-content">
                            <div className="calculate">
                                <Text>Tạm tính</Text>
                                <Text>{formatCurrency(totalPrice || 0)}</Text>
                            </div>
                            <Divider className="summary-divider" />
                            <div className="calculate total">
                                <Text strong>Tổng tiền</Text>
                                <Text className="sum-final">{formatCurrency(totalPrice || 0)}</Text>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                block
                                className="checkout-button"
                                disabled={!buyNowItem && carts.length === 0}
                                onClick={handlePlaceOrder}
                            >
                                Tiến hành đặt hàng
                                {(buyNowItem || carts.length > 0) && <span> ({buyNowItem ? 1 : carts.length})</span>}
                            </Button>
                            <div className="order-note">
                                <Text type="secondary">* Miễn phí giao hàng cho đơn hàng từ 200.000đ</Text>
                                <Text type="secondary">* Thời gian giao hàng: 30-45 phút</Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ViewOrder;