import { AntDesignOutlined, UploadOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Form, Input, Row, Upload, message, notification } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { callUpdateAvatar, callUpdateUserInfo } from "../../services/api";
import { doUpdateUserInfoAction, doUploadAvatarAction } from "../../redux/account/accountSlice";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { use } from "react";

const UserInfo = (props) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const user = useSelector(state => state.account.user);
    const tempAvatar = useSelector(state => state.account.tempAvatar);

    const [userAvatar, setUserAvatar] = useState(user?.avatar ?? "");
    const [royalty, setRoyalty] = useState(user?.royalty ?? "");
    const [name, setName] = useState(user?.name ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [totalMoneySpent, setTotalMoneySpent] = useState(user?.totalMoneySpent ?? "");
    const [totalOrder, setTotalOrder] = useState(user?.totalOrder ?? "");
    const [isSubmit, setIsSubmit] = useState(false);
    const [dataThumbnail, setDataThumbnail] = useState([]);


    useEffect(() => {
        setUserAvatar(user?.avatar);
        setRoyalty(user?.royalty);
        setName(user?.name);
        setPhone(user?.phone);
        setTotalMoneySpent(user?.totalMoneySpent);
        setTotalOrder(user?.totalOrder);
    }, [user]);
    const urlAvatar = userAvatar
        ? `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${userAvatar}`
        : `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${user?.avatar}`;


    const handleUploadAvatar = async ({ file, onSuccess, onError }) => {
        const res = await callUpdateAvatar(file, "avatar"); // Thêm folder ở đây
        if (res && res.data) {
            setDataThumbnail([{ name: res.data.fileName, uid: uuidv4() }]);
            setUserAvatar(res.data.fileName);
            dispatch(doUploadAvatarAction(res.data.fileName));
            console.log(res.data.fileName);
            if (onSuccess) onSuccess('ok');
        } else {
            setDataThumbnail([]);
            const error = new Error(res.message);
            if (onError) onError({ event: error });
        }
    };

    const handleBeforeUpload = (file) => {
        const allowedExtensions = ["image/jpeg", "image/png", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowedExtensions.includes(file.type)) {
            message.error("File không hợp lệ. Chỉ hỗ trợ PDF, JPG, JPEG, PNG, DOC, DOCX.");
            return Upload.LIST_IGNORE;
        }
        return true;
    };

    const propsUpload = {
        beforeUpload: handleBeforeUpload, // Kiểm tra file trước khi upload
        maxCount: 1,
        multiple: false,
        showUploadList: false,
        customRequest: handleUploadAvatar,
        onChange(info) {
            if (info.file.status === "done") {
                message.success(`Upload file thành công`);
            } else if (info.file.status === "error") {
                message.error(`Upload file thất bại`);
            }
        },
    };


    const onFinish = async (values) => {
        const { name, phone, id } = values;
        setIsSubmit(true)
        const res = await callUpdateUserInfo(id, name, phone, userAvatar);

        if (res && res.data) {
            //update redux
            dispatch(doUpdateUserInfoAction({ avatar: userAvatar, phone, name }));
            message.success("Cập nhật thông tin user thành công");

            //force renew token
            // localStorage.removeItem('access_token');
        } else {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: res.message
            })
        }
        setIsSubmit(false)
    }

    return (
        <div style={{ minHeight: 400 }}>
            <Row>
                <Col sm={24} md={12}>
                    <Row gutter={[30, 30]}>
                        <Col span={24}>
                            <Avatar
                                size={{ xs: 32, sm: 64, md: 80, lg: 128, xl: 160, xxl: 200 }}
                                icon={<AntDesignOutlined />}
                                src={urlAvatar}
                                shape="circle"
                            />
                        </Col>
                        <Col span={24}>
                            <Upload {...propsUpload}>
                                <Button icon={<UploadOutlined />}>
                                    Upload Avatar
                                </Button>
                            </Upload>
                        </Col>
                    </Row>
                </Col>
                <Col sm={24} md={12}>
                    <Form
                        onFinish={onFinish}
                        form={form}
                    >
                        <Form.Item
                            hidden
                            labelCol={{ span: 24 }}
                            label="Email"
                            name="id"
                            initialValue={user?.id}

                        >
                            <Input disabled hidden />
                        </Form.Item>

                        <Form.Item
                            labelCol={{ span: 24 }}
                            label="Email"
                            name="email"
                            initialValue={user?.email}

                        >
                            <Input disabled />
                        </Form.Item>
                        <Form.Item
                            labelCol={{ span: 24 }}
                            label="Royalty"
                            name="royalty"
                            initialValue={user?.royalty}

                        >
                            <Input disabled />
                        </Form.Item>
                        <Form.Item
                            labelCol={{ span: 24 }}
                            label="totalMoneySpent"
                            name="totalMoneySpent"
                            initialValue={user?.totalMoneySpent}

                        >
                            <Input disabled />
                        </Form.Item>
                        <Form.Item
                            labelCol={{ span: 24 }}
                            label="totalOrder"
                            name="totalOrder"
                            initialValue={user?.totalOrder}

                        >
                            <Input disabled />
                        </Form.Item>
                        <Form.Item
                            labelCol={{ span: 24 }}
                            label="Tên hiển thị"
                            name="name"
                            initialValue={user?.name}
                            rules={[{ required: true, message: 'Tên hiển thị không được để trống!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            labelCol={{ span: 24 }}
                            label="Số điện thoại"
                            name="phone"
                            initialValue={user?.phone}
                            rules={[{ required: true, message: 'Số điện thoại không được để trống!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Button loading={isSubmit} onClick={() => form.submit()}>Cập nhật</Button>
                    </Form>
                </Col>
            </Row>
        </div>
    )
}

export default UserInfo;