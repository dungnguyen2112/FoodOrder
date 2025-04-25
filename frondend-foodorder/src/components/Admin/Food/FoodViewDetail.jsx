import { Badge, Descriptions, Divider, Drawer, Modal, Upload, Typography, Tag } from "antd";
import moment from 'moment';
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
//FORMAT_DATE_DISPLAY = 'DD-MM-YYYY HH:mm:ss'
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { CoffeeOutlined, DollarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const FoodViewDetail = (props) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    }

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (dataViewDetail) {
            let imgThumbnail = {};
            if (dataViewDetail.image) {
                imgThumbnail = {
                    uid: uuidv4(),
                    name: dataViewDetail.image,
                    status: 'done',
                    url: `${import.meta.env.VITE_CLOUDINARY_URL}/food/${dataViewDetail.image}`,
                }
            }
            // if (dataViewDetail.slider && dataViewDetail.slider.length > 0) {
            //     dataViewDetail.slider.map(item => {
            //         imgSlider.push({
            //             uid: uuidv4(),
            //             name: item,
            //             status: 'done',
            //             url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${item}`,
            //         })
            //     })
            // }

            setFileList([imgThumbnail])
        }
    }, [dataViewDetail])

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file) => {
        setPreviewImage(file.url);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    }

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
                        {dataViewDetail &&
                            <Text type="secondary">Mã món: #{dataViewDetail.id}</Text>
                        }
                    </div>
                }
                className="admin-drawer"
            >
                {dataViewDetail && (
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
                                <Text strong>{dataViewDetail.name}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Danh mục">
                                <Tag color="#108ee9" style={{ borderRadius: '20px', padding: '2px 12px' }}>
                                    {dataViewDetail.categoryName}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Giá tiền">
                                <Tag
                                    icon={<DollarOutlined />}
                                    color="#1677ff"
                                    style={{ border: 'none', background: '#e6f4ff', color: '#1677ff', fontSize: '14px', padding: '4px 12px' }}
                                >
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dataViewDetail.price ?? 0)}
                                </Tag>
                            </Descriptions.Item>

                            {dataViewDetail.shortDesc && (
                                <Descriptions.Item label="Mô tả ngắn">
                                    {dataViewDetail.shortDesc}
                                </Descriptions.Item>
                            )}

                            {dataViewDetail.detailDesc && (
                                <Descriptions.Item label="Mô tả chi tiết">
                                    {dataViewDetail.detailDesc}
                                </Descriptions.Item>
                            )}

                            {dataViewDetail.quantity !== undefined && (
                                <Descriptions.Item label="Số lượng">
                                    {dataViewDetail.quantity}
                                </Descriptions.Item>
                            )}

                            {dataViewDetail.sold !== undefined && (
                                <Descriptions.Item label="Đã bán">
                                    {dataViewDetail.sold}
                                </Descriptions.Item>
                            )}

                            {dataViewDetail.createdAt && (
                                <Descriptions.Item label="Ngày tạo">
                                    {moment(dataViewDetail.createdAt).format(FORMAT_DATE_DISPLAY)}
                                </Descriptions.Item>
                            )}

                            {dataViewDetail.updatedAt && (
                                <Descriptions.Item label="Cập nhật lần cuối">
                                    {moment(dataViewDetail.updatedAt).format(FORMAT_DATE_DISPLAY)}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {fileList.length > 0 && (
                            <>
                                <Divider orientation="left">
                                    <Title level={5} style={{ margin: 0 }}>Hình ảnh món ăn</Title>
                                </Divider>
                                <div style={{ marginTop: 20 }}>
                                    <Upload
                                        listType="picture-card"
                                        fileList={fileList}
                                        onPreview={handlePreview}
                                        onChange={handleChange}
                                        showUploadList={{ showRemoveIcon: false }}
                                    />
                                </div>
                            </>
                        )}

                        <Modal
                            open={previewOpen}
                            title={previewTitle}
                            footer={null}
                            onCancel={handleCancel}
                        >
                            <img alt="preview" style={{ width: '100%' }} src={previewImage} />
                        </Modal>
                    </>
                )}
            </Drawer>
        </>
    )
}
export default FoodViewDetail;