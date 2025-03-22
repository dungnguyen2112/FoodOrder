import { Badge, Descriptions, Divider, Drawer, Modal, Upload } from "antd";
import moment from 'moment';
import { FORMAT_DATE_DISPLAY } from "../../../utils/constant";
//FORMAT_DATE_DISPLAY = 'DD-MM-YYYY HH:mm:ss'
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

const CategoryViewDetail = (props) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const [fileList, setFileList] = useState([]);
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    }

    useEffect(() => {
        if (dataViewDetail) {
            let imgThumbnail = {}, imgSlider = [];
            if (dataViewDetail.image) {
                imgThumbnail = {
                    uid: uuidv4(),
                    name: dataViewDetail.image,
                    status: 'done',
                    url: `${import.meta.env.VITE_BACKEND_URL}/storage/category/${dataViewDetail.image}`,
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
                title="Chức năng xem chi tiết"
                width={"50vw"}
                onClose={onClose}
                open={openViewDetail}
            >
                <Descriptions
                    title="Thông tin Book"
                    bordered
                    column={2}
                >
                    <Descriptions.Item label="Id">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên Category">{dataViewDetail?.name}</Descriptions.Item>
                </Descriptions>
                <Divider orientation="left" > Ảnh Category </Divider>
                <Upload
                    action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    showUploadList={
                        { showRemoveIcon: false }
                    }
                >
                </Upload>
            </Drawer>
        </>
    )
}
export default CategoryViewDetail;