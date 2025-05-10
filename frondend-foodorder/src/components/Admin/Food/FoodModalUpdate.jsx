import React, { useEffect, useState } from 'react';
import { Col, Divider, Form, Input, InputNumber, message, Modal, notification, Row, Select, Upload } from 'antd';
import { callFetchCategory, callUpdateFood, callUploadFoodImg, callAddProductImages, callRemoveAllProductImages, callRemoveProductImage } from '../../../services/api';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid';

const FoodModalUpdate = (props) => {
    const { openModalUpdate, setOpenModalUpdate, dataUpdate, setDataUpdate, fetchBook } = props;
    const [isSubmit, setIsSubmit] = useState(false);

    const [listCategory, setListCategory] = useState([])
    const [form] = Form.useForm();

    const [loadingUpload, setLoadingUpload] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingSlider, setLoadingSlider] = useState(false);

    const [imageUrl, setImageUrl] = useState("");

    const [dataThumbnail, setDataThumbnail] = useState([]);
    const [dataAdditionalImages, setDataAdditionalImages] = useState([]);

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
        if (dataUpdate?.id) {
            console.log("Loading product data for update:", dataUpdate);

            const arrThumbnail = [
                {
                    uid: uuidv4(),
                    name: dataUpdate.image,
                    status: 'done',
                    url: `${import.meta.env.VITE_CLOUDINARY_URL}/food/${dataUpdate.image}`,
                }
            ];

            // Xử lý hình ảnh phụ nếu có
            let arrAdditionalImages = [];
            if (dataUpdate.additionalImages && dataUpdate.additionalImages.length > 0) {
                console.log("Loading additional images:", dataUpdate.additionalImages);

                arrAdditionalImages = dataUpdate.additionalImages.map(img => {
                    const uid = uuidv4();
                    console.log(`Processing image ID=${img.id}, URL=${img.imageUrl}, assigning uid=${uid}`);

                    return {
                        uid: uid,
                        name: img.imageUrl,
                        imageUrl: img.imageUrl,
                        imageId: img.id, // Lưu lại ID của image để sử dụng khi xóa
                        status: 'done',
                        url: `${import.meta.env.VITE_CLOUDINARY_URL}/food/${img.imageUrl}`,
                    };
                });
            }

            const init = {
                id: dataUpdate.id,
                name: dataUpdate.name,
                price: dataUpdate.price,
                categoryName: dataUpdate.categoryName,
                quantity: dataUpdate.quantity,
                sold: dataUpdate.sold,
                detailDesc: dataUpdate.detailDesc,
                shortDesc: dataUpdate.shortDesc,
                image: { fileList: arrThumbnail },
                additionalImages: { fileList: arrAdditionalImages }
            }
            setInitForm(init);
            setDataThumbnail(arrThumbnail);
            setDataAdditionalImages(arrAdditionalImages);
            form.setFieldsValue(init);

            console.log("Initialized form with additional images:", arrAdditionalImages);
        }
        return () => {
            form.resetFields();
        }
    }, [dataUpdate])


    const onFinish = async (values) => {
        if (dataThumbnail.length === 0) {
            notification.error({
                message: 'Lỗi validate',
                description: 'Vui lòng upload ảnh thumbnail'
            })
            return;
        }

        const { id, name, price, sold, quantity, categoryName, factory, detailDesc, shortDesc } = values;
        const image = dataThumbnail[0].name;

        setIsSubmit(true);
        try {
            const res = await callUpdateFood(id, image, name, price, sold, quantity, categoryName, factory, detailDesc, shortDesc);
            if (res && res.data) {
                // Only update the images that have changed
                // Check if we have the initial images to compare with
                const initialImages = dataUpdate?.additionalImages || [];
                const initialImageUrls = initialImages.map(img => img.imageUrl);

                // Get current images from state
                const currentImageUrls = dataAdditionalImages.map(img => img.name);

                // Find images to add (new ones)
                const imagesToAdd = dataAdditionalImages.filter(img =>
                    !img.imageId && !initialImageUrls.includes(img.name)
                ).map(img => img.name);

                // Find images to delete (removed ones)
                const imagesToDelete = initialImages.filter(img =>
                    !dataAdditionalImages.some(current =>
                        current.imageId === img.id || current.name === img.imageUrl
                    )
                );

                // Delete each removed image individually
                for (const imgToDelete of imagesToDelete) {
                    await callRemoveProductImage(imgToDelete.id);
                }

                // If we have new images to add
                if (imagesToAdd.length > 0) {
                    await callAddProductImages(id, imagesToAdd);
                }

                message.success('Cập nhật món ăn thành công');
                form.resetFields();
                setDataThumbnail([]);
                setDataAdditionalImages([]);
                setInitForm(null);
                setOpenModalUpdate(false);
                if (fetchBook) {
                    await fetchBook();
                }
            } else {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: res.message
                });
            }
        } catch (error) {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: error.message
            });
        }
        setIsSubmit(false);
    };


    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
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

    const handleChange = (info, isMainImage = true) => {
        if (info.file.status === 'uploading') {
            if (isMainImage) {
                setLoadingUpload(true);
            } else {
                setLoadingSlider(true);
            }
        }
        if (info.file.status === 'done') {
            if (isMainImage) {
                setLoadingUpload(false);
            } else {
                setLoadingSlider(false);
            }
        }
        if (info.file.status === 'error') {
            if (isMainImage) {
                setLoadingUpload(false);
            } else {
                setLoadingSlider(false);
            }
            message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
        }
    };


    const handleUploadFileLogo = async ({ file, onSuccess, onError }) => {
        const res = await callUploadFoodImg(file, "food");
        if (res && res.data) {
            setDataThumbnail([{
                name: res.data.display_name + "." + res.data.format,
                uid: uuidv4()
            }])
            if (onSuccess) onSuccess('ok')
        } else {
            if (onError) {
                setDataThumbnail([])
                const error = new Error(res.message);
                onError({ event: error });
            }
        }
    };

    const handleUploadAdditionalImages = async ({ file, onSuccess, onError }) => {
        try {
            const res = await callUploadFoodImg(file, "food");
            if (res && res.data) {
                // Thêm vào danh sách hình ảnh phụ với thông tin đầy đủ để có thể xóa sau này
                const newImage = {
                    name: res.data.display_name + "." + res.data.format,
                    uid: file.uid,
                    status: 'done',
                    imageUrl: res.data.display_name + "." + res.data.format,
                    url: `${import.meta.env.VITE_CLOUDINARY_URL}/food/${res.data.display_name}.${res.data.format}`,
                    // Nếu backend trả về id của hình ảnh vừa tạo
                    ...(res.data.id && { imageId: res.data.id })
                };

                setDataAdditionalImages(prev => [...prev, newImage]);
                if (onSuccess) onSuccess({
                    status: 'done',
                    name: res.data.display_name + "." + res.data.format,
                    uid: file.uid,
                    url: `${import.meta.env.VITE_CLOUDINARY_URL}/food/${res.data.display_name}.${res.data.format}`
                });
            } else {
                if (onError) {
                    const error = new Error(res?.message || 'Upload failed');
                    onError({ event: error });
                }
            }
        } catch (error) {
            if (onError) {
                onError({ event: error });
            }
            console.error('Error uploading image:', error);
        }
    };

    const handleRemoveFile = (file) => {
        setDataThumbnail([])
    }

    const handleRemoveAdditionalImage = async (file) => {
        console.log("File to remove:", file);
        console.log("Current dataAdditionalImages:", dataAdditionalImages);

        try {
            let imageId = null;

            // Case 1: Hình ảnh đã tồn tại trong DB và có imageId trong file object
            if (file && file.imageId) {
                console.log("Case 1: Found imageId directly in file object:", file.imageId);
                imageId = file.imageId;
            }
            // Case 2: Hình ảnh đã tồn tại trong DB và có imageId trong props
            else if (file && file.props && file.props.imageId) {
                console.log("Case 2: Found imageId in file.props:", file.props.imageId);
                imageId = file.props.imageId;
            }
            // Case 3: Hình ảnh có trong dataAdditionalImages với uid tương ứng
            else {
                const existingImage = dataAdditionalImages.find(img => img.uid === file.uid);
                if (existingImage && existingImage.imageId) {
                    console.log("Case 3: Found imageId in dataAdditionalImages:", existingImage.imageId);
                    imageId = existingImage.imageId;
                }
                // Case 4: Match by name/imageUrl if uid doesn't match
                else {
                    const fileName = file.name || (file.url && file.url.substring(file.url.lastIndexOf('/') + 1));
                    console.log("Case 4: Trying to match by filename:", fileName);

                    if (fileName) {
                        const matchedByName = dataAdditionalImages.find(img =>
                            img.imageUrl === fileName || img.name === fileName
                        );

                        if (matchedByName && matchedByName.imageId) {
                            console.log("Found match by filename:", matchedByName.imageId);
                            imageId = matchedByName.imageId;
                        }
                    }
                }
            }

            if (imageId) {
                console.log(`Removing image with ID: ${imageId}`);
                try {
                    const res = await callRemoveProductImage(imageId);
                    console.log("API response:", res);
                    message.success('Đã xóa hình ảnh khỏi cơ sở dữ liệu');
                } catch (apiError) {
                    console.error("API error:", apiError);
                    message.error(`Lỗi khi gọi API: ${apiError.message}`);
                }
            } else {
                console.log("No image ID found, only removing from UI");
            }

            // Xóa khỏi state UI
            if (file.uid) {
                setDataAdditionalImages(prev => prev.filter(item => item.uid !== file.uid));
            } else {
                // Nếu không có uid, có thể xóa bằng tên file
                const fileName = file.name || (file.url && file.url.substring(file.url.lastIndexOf('/') + 1));
                if (fileName) {
                    setDataAdditionalImages(prev => prev.filter(item =>
                        item.name !== fileName && item.imageUrl !== fileName
                    ));
                }
            }
        } catch (error) {
            console.error('Error details:', error);
            message.error('Không thể xóa hình ảnh: ' + (error.message || 'Lỗi không xác định'));
        }
    };

    const handlePreview = async (file) => {
        // First close any existing preview
        setPreviewOpen(false);

        // Wait a tiny bit to ensure the modal is fully closed
        setTimeout(() => {
            // Set the image URL based on whether it's a file object or already uploaded
            let imageUrl = '';
            if (file.originFileObj) {
                // For newly uploaded files that aren't saved yet
                getBase64(file.originFileObj, (url) => {
                    setPreviewImage(url);
                    setPreviewTitle(file.name || 'Preview Image');
                    setPreviewOpen(true);
                });
                return;
            } else {
                // For existing files that are already saved
                imageUrl = file.url || `${import.meta.env.VITE_CLOUDINARY_URL}/food/${file.name}`;
                setPreviewImage(imageUrl);
                setPreviewTitle(file.name || (file.url && file.url.substring(file.url.lastIndexOf('/') + 1)) || 'Preview Image');
                setPreviewOpen(true);
            }
        }, 100);
    };

    const callRemoveAllProductImages = async (productId) => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/products/${productId}/images`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        return res.json();
    }

    const callRemoveProductImage = async (imageId) => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/products/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        return res.json();
    }

    const callAddProductImages = async (productId, imageUrls) => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/products/${productId}/images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageUrls })
        });
        return res.json();
    }

    return (
        <>
            <Modal
                title="Cập nhật món ăn"
                open={openModalUpdate}
                onOk={() => { form.submit() }}
                onCancel={() => {
                    form.resetFields();
                    setInitForm(null)
                    setDataUpdate(null);
                    setDataThumbnail([]);
                    setDataAdditionalImages([]);
                    setOpenModalUpdate(false)
                }}
                okText={"Cập nhật"}
                cancelText={"Hủy"}
                confirmLoading={isSubmit}
                width={"50vw"}
                //do not close when click outside
                maskClosable={false}
            >
                <Divider />

                <Form
                    form={form}
                    name="basic"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Row gutter={15}>
                        <Form.Item
                            hidden
                            labelCol={{ span: 24 }}
                            label="Id"
                            name="id"
                            rules={[{ required: true, message: 'Vui lòng nhập Id!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Col span={12}>
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Tên món ăn"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        {/* <Col span={12}>
                                                <Form.Item
                                                    labelCol={{ span: 24 }}
                                                    label="Tác giả"
                                                    name=""
                                                    rules={[{ required: true, message: 'Vui lòng nhập tác giả!' }]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </Col> */}
                        <Col span={6}>
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Giá tiền"
                                name="price"
                                rules={[{ required: true, message: 'Vui lòng nhập giá tiền!' }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    addonAfter="VND"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Thể loại"
                                name="categoryName"
                                rules={[{ required: true, message: 'Vui lòng chọn thể loại!' }]}
                            >
                                <Select
                                    defaultValue={null}
                                    showSearch
                                    allowClear
                                    //  onChange={handleChange}
                                    options={listCategory}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Mo ta"
                                name="detailDesc"
                                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Mô tả ngắn gọn"
                                name="shortDesc"
                                rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn gọn!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Số lượng"
                                name="quantity"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                            >
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Đã bán"
                                name="sold"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng đã bán!' }]}
                                initialValue={0}
                            >
                                <InputNumber min={0} defaultValue={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Ảnh Chính"
                                name="image"
                                rules={[{
                                    required: true,
                                    message: 'Vui lòng không bỏ trống',
                                    validator: () => {
                                        if (dataThumbnail.length > 0) return Promise.resolve();
                                        else return Promise.reject(false);
                                    }
                                }]}
                            >
                                <Upload
                                    name="image"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    maxCount={1}
                                    multiple={false}
                                    customRequest={handleUploadFileLogo}
                                    beforeUpload={beforeUpload}
                                    onChange={(info) => handleChange(info, true)}
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
                                labelCol={{ span: 24 }}
                                label="Ảnh Phụ (không bắt buộc)"
                                name="additionalImages"
                            >
                                <Upload
                                    multiple
                                    name="additionalImages"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    customRequest={handleUploadAdditionalImages}
                                    beforeUpload={beforeUpload}
                                    onChange={(info) => handleChange(info, false)}
                                    onRemove={handleRemoveAdditionalImage}
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

            </Modal>
            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
                destroyOnClose={true}
                centered
            >
                {previewImage && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <img
                            alt={previewTitle}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain'
                            }}
                            src={previewImage}
                        />
                    </div>
                )}
            </Modal>
        </>
    );
};

export default FoodModalUpdate;