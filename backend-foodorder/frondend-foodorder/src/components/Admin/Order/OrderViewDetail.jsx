import { Badge, Descriptions, Divider, Drawer, Modal, Upload } from "antd";
import moment from 'moment';
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
//FORMAT_DATE_DISPLAY = 'DD-MM-YYYY HH:mm:ss'
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

const OrderViewDetail = (props) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    }
    return (
        <>
            <Drawer
                title="Chức năng xem chi tiết"
                width={"50vw"}
                onClose={onClose}
                open={openViewDetail}
            >
                <Descriptions
                    title="Thông tin Order"
                    bordered
                    column={3}
                >
                    <Descriptions.Item label="Id">{dataViewDetail?.orderId}</Descriptions.Item>
                    <Descriptions.Item label="Tên người đặt">{dataViewDetail?.name}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{dataViewDetail?.phone}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{dataViewDetail?.address}</Descriptions.Item>
                    <Descriptions.Item label="Số bàn">{dataViewDetail?.tableNumber}</Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật">{moment(dataViewDetail?.updatedAt).format(FORMAT_DATE_DISPLAY)}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái thanh toán"> {dataViewDetail?.paymentStatus}</Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dataViewDetail?.totalPrice)}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Badge status="processing" text={dataViewDetail?.status} />
                    </Descriptions.Item>
                    <Descriptions></Descriptions>

                    <Descriptions.Item label="Chi tiết đơn hàng">
                        {dataViewDetail?.orderDetails.map((item, index) => {
                            return (
                                <Descriptions
                                    title={"Chi tiết đơn hàng " + (index + 1)}
                                    bordered
                                    column={2}
                                >
                                    <Descriptions.Item label="Tên food">{item.productName}</Descriptions.Item>
                                    <Descriptions.Item label="Số lượng">{item.quantity}</Descriptions.Item>
                                    <Descriptions.Item label="Giá tiền">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</Descriptions.Item>
                                </Descriptions>
                            )
                        }
                        )}
                    </Descriptions.Item>
                </Descriptions>
            </Drawer>
        </>
    )
}
export default OrderViewDetail;