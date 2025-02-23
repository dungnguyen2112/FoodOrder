import { Col, Divider, Form, Radio, Row, Checkbox, Input, message, notification } from 'antd';
import { DeleteTwoTone, LoadingOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { doDeleteItemCartAction, doPlaceOrderAction } from '../../redux/order/orderSlice';
import { callPlaceOrder } from '../../services/api';

const { TextArea } = Input;

const Payment = (props) => {
    const carts = useSelector(state => state.order.carts);
    const [totalPrice, setTotalPrice] = useState(0);
    const dispatch = useDispatch();
    const [isSubmit, setIsSubmit] = useState(false);
    const user = useSelector(state => state.account.user);
    const [form] = Form.useForm();

    const [isDineIn, setIsDineIn] = useState(false);
    const restaurantAddress = "Nhà hàng ABC, 123 Đường XYZ, Quận 1, TP. Hồ Chí Minh";
    const restaurantTable = "Ăn tại nhà";

    useEffect(() => {
        if (carts.length > 0) {
            form.setFieldsValue({ address: restaurantAddress });
            let sum = carts.reduce((acc, item) => acc + item.quantity * item.detail.price, 0);
            setTotalPrice(sum);
        } else {
            setTotalPrice(0);
        }
    }, [carts][user.royalty]);

    const handleDineInChange = (e) => {
        setIsDineIn(e.target.checked);
        form.setFieldsValue({ address: e.target.checked ? restaurantAddress : "" });
    };

    const onFinish = async (values) => {
        setIsSubmit(true);
        const detailOrder = carts.map(item => ({
            bookName: item.detail.name,
            quantity: item.quantity,
            id: item.id
        }));

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
            dispatch(doPlaceOrderAction());
            props.setCurrentStep(2);
        } else {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: res.message
            });
        }
        setIsSubmit(false);
    };

    return (
        <Row gutter={[20, 20]}>
            <Col md={16} xs={24}>
                {carts?.map((book, index) => (
                    <div className='order-book' key={`index-${index}`}>
                        <div className='book-content'>
                            <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/food/${book?.detail?.image}`} />
                            <div className='title'>{book?.detail?.name}</div>
                            <div className='price'>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.detail.price)}
                            </div>
                        </div>
                        <div className='action'>
                            <div className='quantity'>Số lượng: {book?.quantity}</div>
                            <div className='sum'>
                                Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.detail.price * book.quantity)}
                            </div>
                            <DeleteTwoTone
                                style={{ cursor: "pointer" }}
                                onClick={() => dispatch(doDeleteItemCartAction({ _id: book.id }))}
                                twoToneColor="#eb2f96"
                            />
                        </div>
                    </div>
                ))}
            </Col>
            <Col md={8} xs={24}>
                <div className='order-sum'>
                    <Form form={form} onFinish={onFinish}>
                        <Form.Item
                            label="Tên người nhận"
                            name="name"
                            initialValue={user?.fullName}
                            rules={[{ required: true, message: 'Tên người nhận không được để trống!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            initialValue={user?.phone}
                            rules={[{ required: true, message: 'Số điện thoại không được để trống!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: 'Địa chỉ không được để trống!' }]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>


                        <Form.Item name="isDineIn" valuePropName="checked">
                            <Checkbox onChange={handleDineInChange}>Ăn tại nhà hàng</Checkbox>
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
                    <div className='info'>
                        <div className='method'>
                            <div>Hình thức thanh toán</div>
                            <Radio checked>Thanh toán khi nhận hàng</Radio>
                        </div>
                    </div>

                    <Divider style={{ margin: "5px 0" }} />
                    <div className='calculate'>
                        <span>Tổng tiền</span>
                        <span className='sum-final'>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice || 0)}
                        </span>
                    </div>
                    <Divider style={{ margin: "5px 0" }} />
                    <button onClick={() => form.submit()} disabled={isSubmit}>
                        {isSubmit && <LoadingOutlined />} Đặt Hàng ({carts?.length ?? 0})
                    </button>
                </div>
            </Col>
        </Row>
    );
};

export default Payment;
