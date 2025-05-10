import { Badge, Descriptions, Divider, Drawer, Modal, Upload, Typography, Tag, Button, Image, Skeleton } from "antd";
import moment from 'moment';
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
//FORMAT_DATE_DISPLAY = 'DD-MM-YYYY HH:mm:ss'
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { CoffeeOutlined, DollarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const FoodViewDetail = (props) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const [visible, setVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [displayData, setDisplayData] = useState(null);

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };

    // Update displayData whenever dataViewDetail changes
    useEffect(() => {
        if (dataViewDetail) {
            setDisplayData(dataViewDetail);
        }
    }, [dataViewDetail]);

    // Reset modal state when component unmounts or drawer closes
    useEffect(() => {
        if (!openViewDetail) {
            setVisible(false);
            setPreviewImage('');
        }
    }, [openViewDetail]);

    const handlePreview = (image) => {
        // Set image and open modal in one synchronous operation
        setPreviewImage(image);
        setVisible(true);
    };

    return (
        <>
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CoffeeOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />
                        <span>Chi tiết món ăn</span>
                    </div>
                }
                width={"50vw"}
                onClose={onClose}
                open={openViewDetail}
                extra={
                    <div className="drawer-subtitle">
                        {displayData &&
                            <Text type="secondary">Mã món: #{displayData.id}</Text>
                        }
                    </div>
                }
                className="admin-drawer"
            >
                {displayData && (
                    <>
                        <Descriptions
                            title={<Title level={5}>Thông tin món ăn</Title>}
                            bordered
                            column={1}
                            labelStyle={{ width: '200px', fontWeight: 500 }}
                            contentStyle={{ fontWeight: 400 }}
                            className="detail-descriptions"
                        >
                            <Descriptions.Item label="Tên món">
                                <Text strong>{displayData.name}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Danh mục">
                                <Tag color="#108ee9" style={{ borderRadius: '20px', padding: '2px 12px' }}>
                                    {displayData.categoryName}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Giá tiền">
                                <Tag
                                    icon={<DollarOutlined />}
                                    color="#1677ff"
                                    style={{ border: 'none', background: '#e6f4ff', color: '#1677ff', fontSize: '14px', padding: '4px 12px' }}
                                >
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayData.price ?? 0)}
                                </Tag>
                            </Descriptions.Item>

                            {displayData.shortDesc && (
                                <Descriptions.Item label="Mô tả ngắn">
                                    {displayData.shortDesc}
                                </Descriptions.Item>
                            )}

                            {displayData.detailDesc && (
                                <Descriptions.Item label="Mô tả chi tiết">
                                    {displayData.detailDesc}
                                </Descriptions.Item>
                            )}

                            {displayData.quantity !== undefined && (
                                <Descriptions.Item label="Số lượng">
                                    {displayData.quantity}
                                </Descriptions.Item>
                            )}

                            {displayData.sold !== undefined && (
                                <Descriptions.Item label="Đã bán">
                                    {displayData.sold}
                                </Descriptions.Item>
                            )}

                            {displayData.createdAt && (
                                <Descriptions.Item label="Ngày tạo">
                                    {moment(displayData.createdAt).format(FORMAT_DATE_DISPLAY)}
                                </Descriptions.Item>
                            )}

                            {displayData.updatedAt && (
                                <Descriptions.Item label="Cập nhật lần cuối">
                                    {moment(displayData.updatedAt).format(FORMAT_DATE_DISPLAY)}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <Divider orientation="left">Hình ảnh chính</Divider>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                            <Image
                                width={150}
                                src={`${import.meta.env.VITE_CLOUDINARY_URL}/food/${displayData.image}`}
                                preview={false}
                                onClick={() => handlePreview(`${import.meta.env.VITE_CLOUDINARY_URL}/food/${displayData.image}`)}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>

                        {displayData.additionalImages && displayData.additionalImages.length > 0 && (
                            <>
                                <Divider orientation="left">Hình ảnh phụ</Divider>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    {displayData.additionalImages.map(img => (
                                        <Image
                                            key={img.id || uuidv4()}
                                            width={150}
                                            src={`${import.meta.env.VITE_CLOUDINARY_URL}/food/${img.imageUrl}`}
                                            preview={false}
                                            onClick={() => handlePreview(`${import.meta.env.VITE_CLOUDINARY_URL}/food/${img.imageUrl}`)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </Drawer>

            {/* Use separate modal for preview */}
            {visible && (
                <Modal
                    open={visible}
                    footer={null}
                    closable={true}
                    onCancel={() => setVisible(false)}
                    width="auto"
                    centered
                    destroyOnClose={true}
                    afterClose={() => setPreviewImage('')}
                    bodyStyle={{ padding: 0 }}
                >
                    <img
                        src={previewImage}
                        alt="Preview"
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            display: 'block'
                        }}
                    />
                </Modal>
            )}
        </>
    )
}
export default FoodViewDetail;