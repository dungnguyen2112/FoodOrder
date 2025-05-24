import React, { useEffect, useState } from 'react';
import { Col, Divider, Form, Input, InputNumber, message, Modal, notification, Row, Select, Upload } from 'antd';
import { callFetchCategory, callUpdateFood, callUploadFoodImg, callAddProductImages, callRemoveAllProductImages, callUpdateProductImages } from '../../../services/api';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid';

const FoodModalUpdate = (props) => {
    const { openModalUpdate, setOpenModalUpdate, dataUpdate, setDataUpdate } = props;
    const [isSubmit, setIsSubmit] = useState(false);

    const [listCategory, setListCategory] = useState([])
    const [form] = Form.useForm();

    const [loadingUpload, setLoadingUpload] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingSlider, setLoadingSlider] = useState(false);

    const [imageUrl, setImageUrl] = useState("");

    const [dataThumbnail, setDataThumbnail] = useState([])
    const [dataAdditionalImages, setDataAdditionalImages] = useState([])

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [initForm, setInitForm] = useState(null);

    useEffect(() => {
        const fetchCategory = async () => {
            const res = await callFetchCategory();
            if (res && res.data) {
                const d = res.data.map(item => {
                    return { label: item, value: item }
                })
                setListCategory(d);
            }
        }
        fetchCategory();
    }, [])

    useEffect(() => {
        if (dataUpdate) {
            const init = {
                id: dataUpdate.id,
                name: dataUpdate.name,
                price: dataUpdate.price,
                quantity: dataUpdate.quantity,
                categoryName: dataUpdate.categoryName,
                detailDesc: dataUpdate.detailDesc,
                shortDesc: dataUpdate.shortDesc,
                factory: dataUpdate.factory,
                target: dataUpdate.target,
            }
            setInitForm(init);
            form.setFieldsValue(init);

            // Set additional images if they exist
            if (dataUpdate.additionalImages && dataUpdate.additionalImages.length > 0) {
                const additionalImages = dataUpdate.additionalImages.map(img => ({
                    uid: uuidv4(),
                    name: img.imageUrl,
                    status: 'done',
                    url: `${import.meta.env.VITE_CLOUDINARY_URL}/food/${img.imageUrl}`,
                }));
                setDataAdditionalImages(additionalImages);
            }
        }
    }, [dataUpdate])

    const handleUploadFileLogo = async ({ file, onSuccess, onError }) => {
        setLoadingUpload(true);
        const res = await callUploadFoodImg(file, "food");
        if (res && res.data) {
            setDataThumbnail([{
                name: res.data.display_name + "." + res.data.format,
                uid: file.uid
            }]);
            setImageUrl(res.data.display_name + "." + res.data.format);
            if (onSuccess) onSuccess('ok');
        } else {
            if (onError) {
                const error = new Error(res.message);
                onError({ event: error });
            }
        }
        setLoadingUpload(false);
    }

    const handleUploadAdditionalImages = async ({ file, onSuccess, onError }) => {
        setLoadingSlider(true);
        const res = await callUploadFoodImg(file, "food");
        if (res && res.data) {
            setDataAdditionalImages((prev) => [...prev, {
                name: res.data.display_name + "." + res.data.format,
                uid: file.uid
            }]);
            if (onSuccess) onSuccess('ok');
        } else {
            if (onError) {
                const error = new Error(res.message);
                onError({ event: error });
            }
        }
        setLoadingSlider(false);
    }

    const handleRemoveFile = (file) => {
        setDataThumbnail([])
    }

    const handleRemoveAdditionalImage = (file) => {
        // Simply remove the image from state
        setDataAdditionalImages((prev) => prev.filter(item => item.uid !== file.uid));
    }

    const handlePreview = async (file) => {
        if (!file.originFileObj) {
            setPreviewImage(file.url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
            return;
        }
        getBase64(file.originFileObj, (url) => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        });
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmit(true);

            const { name, price, quantity, categoryName, detailDesc, shortDesc, factory, target } = values;

            // Prepare additional images data
            const additionalImageUrls = dataAdditionalImages.map(img => img.name);

            // First update the main product details
            const res = await callUpdateFood(
                dataUpdate.id,
                imageUrl || dataUpdate.image,
                name,
                price,
                dataUpdate.sold,
                quantity,
                categoryName,
                factory,
                detailDesc,
                shortDesc
            );

            if (res && res.data) {
                try {
                    // Then update additional images
                    await callUpdateProductImages(dataUpdate.id, additionalImageUrls);

                    message.success('Cập nhật sản phẩm thành công');
                    setOpenModalUpdate(false);
                    setDataUpdate(null);
                    setDataThumbnail([]);
                    setDataAdditionalImages([]);
                    form.resetFields();
                } catch (error) {
                    message.error('Cập nhật hình ảnh phụ thất bại: ' + (error.response?.data?.message || error.message));
                }
            } else {
                notification.error({
                    message: "Đã có lỗi xảy ra",
                    description: res.message
                });
            }
        } catch (error) {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: error.message
            });
        } finally {
            setIsSubmit(false);
        }
    }

    // Add getBase64 function
    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    // Update handleChange function
    const handleChange = (info) => {
        if (info.file.status === 'uploading') {
            setLoadingUpload(true);
        }
        if (info.file.status === 'done') {
            setLoadingUpload(false);
        }
        if (info.file.status === 'error') {
            setLoadingUpload(false);
            message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
        }
    };

    return (
        <Modal
            title="Cập nhật sản phẩm"
            open={openModalUpdate}
            onOk={() => { handleSubmit() }}
            onCancel={() => {
                setOpenModalUpdate(false);
                setDataUpdate(null);
                setDataThumbnail([]);
                setDataAdditionalImages([]);
                form.resetFields();
            }}
            okText={"Cập nhật"}
            cancelText={"Hủy"}
            maskClosable={false}
            width={"90%"}
            style={{ top: 20 }}
        >
            <Form
                form={form}
                name="basic"
                style={{ maxWidth: '100%' }}
                layout="vertical"
                initialValues={initForm}
            >
                <Row gutter={20}>
                    <Col span={12}>
                        <Form.Item
                            label="Tên sản phẩm"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Giá"
                            name="price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={20}>
                    <Col span={12}>
                        <Form.Item
                            label="Số lượng"
                            name="quantity"
                            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                        >
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Danh mục"
                            name="categoryName"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn danh mục"
                                options={listCategory}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={20}>
                    <Col span={12}>
                        <Form.Item
                            label="Nhà sản xuất"
                            name="factory"
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Đối tượng"
                            name="target"
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Mô tả ngắn"
                    name="shortDesc"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn!' }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    label="Mô tả chi tiết"
                    name="detailDesc"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết!' }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Row gutter={20}>
                    <Col span={12}>
                        <Form.Item
                            label="Ảnh chính"
                            name="image"
                        >
                            <Upload
                                name="image"
                                listType="picture-card"
                                className="avatar-uploader"
                                maxCount={1}
                                multiple={false}
                                customRequest={handleUploadFileLogo}
                                beforeUpload={beforeUpload}
                                onChange={handleChange}
                                onRemove={(file) => handleRemoveFile(file)}
                                onPreview={handlePreview}
                                defaultFileList={
                                    dataUpdate?.id ?
                                        [
                                            {
                                                uid: uuidv4(),
                                                name: dataUpdate?.image ?? "",
                                                status: 'done',
                                                url: `${import.meta.env.VITE_CLOUDINARY_URL}/food/${dataUpdate?.image}`,
                                            }
                                        ] : []
                                }
                            >
                                <div>
                                    {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            </Upload>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Ảnh phụ"
                            name="additionalImages"
                        >
                            <Upload
                                name="additionalImages"
                                listType="picture-card"
                                className="avatar-uploader"
                                multiple={true}
                                customRequest={handleUploadAdditionalImages}
                                beforeUpload={beforeUpload}
                                onChange={handleChange}
                                onRemove={(file) => handleRemoveAdditionalImage(file)}
                                onPreview={handlePreview}
                                fileList={dataAdditionalImages}
                            >
                                <div>
                                    {loadingSlider ? <LoadingOutlined /> : <PlusOutlined />}
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
            >
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </Modal>
    );
};

export default FoodModalUpdate;