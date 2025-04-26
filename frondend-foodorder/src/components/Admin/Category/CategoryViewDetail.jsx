import { Badge, Descriptions, Divider, Drawer, Modal, Upload, Typography } from "antd";
import moment from 'moment';
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
//FORMAT_DATE_DISPLAY = 'DD-MM-YYYY HH:mm:ss'
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { AppstoreOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const CategoryViewDetail = (props) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const [fileList, setFileList] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    }

    useEffect(() => {
        if (dataViewDetail) {
            let imgThumbnail = {};
            if (dataViewDetail.image) {
                imgThumbnail = {
                    uid: uuidv4(),
                    name: dataViewDetail.image,
                    status: 'done',
                    url: `${import.meta.env.VITE_CLOUDINARY_URL}/category/${dataViewDetail.image}`,
                }
                setFileList([imgThumbnail]);
            } else {
                setFileList([]);
            }
        }
    }, [dataViewDetail]);

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
                        <AppstoreOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />
                        <span>Chi tiết danh mục</span>
                    </div>
                }
                width={"50vw"}
                onClose={onClose}
                open={openViewDetail}
                extra={
                    <div className="drawer-subtitle">
                        {dataViewDetail &&
                            <Text type="secondary">Mã danh mục: #{dataViewDetail.id}</Text>
                        }
                    </div>
                }
                className="admin-drawer"
            >
                {dataViewDetail && (
                    <>
                        <Descriptions
                            title={<Title level={5}>Thông tin danh mục</Title>}
                            bordered
                            column={1}
                            labelStyle={{ width: '200px', fontWeight: 500 }}
                            contentStyle={{ fontWeight: 400 }}
                            className="detail-descriptions"
                        >
                            <Descriptions.Item label="Tên danh mục">
                                <Text strong>{dataViewDetail.name}</Text>
                            </Descriptions.Item>

                            {dataViewDetail.description && (
                                <Descriptions.Item label="Mô tả">
                                    {dataViewDetail.description}
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
                                    <Title level={5} style={{ margin: 0 }}>Hình ảnh danh mục</Title>
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

export default CategoryViewDetail;