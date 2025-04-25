import React, { useState } from 'react';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    HeartTwoTone,
    TeamOutlined,
    UserOutlined,
    DollarCircleOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DownOutlined,
    TableOutlined,
    ShopOutlined,
    LogoutOutlined,
    HomeOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Badge, Tooltip, Divider } from 'antd';
import { Outlet, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import './layout.scss';
import { useDispatch, useSelector } from 'react-redux';
import { callLogout } from '../../services/api';
import { doLogoutAction } from '../../redux/account/accountSlice';
import ManageAccount from '../Account/ManageAccount';

const { Content, Footer, Sider } = Layout;

const LayoutAdmin = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const user = useSelector(state => state.account.user);

    const [showManageAccount, setShowManageAccount] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && res && +res.statusCode === 200) {
            dispatch(doLogoutAction());
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    const items = [
        {
            label: <Link to='/admin'>Dashboard</Link>,
            key: 'dashboard',
            icon: <AppstoreOutlined />
        },
        {
            label: <span>Quản lý người dùng</span>,
            key: 'user-management',
            icon: <UserOutlined />,
            children: [
                {
                    label: <Link to='/admin/user'>Danh sách người dùng</Link>,
                    key: 'crud',
                    icon: <TeamOutlined />,
                }
            ]
        },
        {
            label: <Link to='/admin/book'>Quản lý món ăn</Link>,
            key: 'book',
            icon: <ExceptionOutlined />
        },
        {
            label: <Link to='/admin/category'>Quản lý danh mục</Link>,
            key: 'category',
            icon: <ShopOutlined />
        },
        {
            label: <Link to='/admin/order'>Quản lý đơn hàng</Link>,
            key: 'order',
            icon: <DollarCircleOutlined />
        },
        {
            label: <Link to='/admin/table'>Quản lý bàn ăn</Link>,
            key: 'table',
            icon: <TableOutlined />
        },
    ];

    const itemsDropdown = [
        {
            label: <div className="dropdown-item">
                <SettingOutlined /> Quản lý tài khoản
            </div>,
            key: 'account',
            onClick: () => setShowManageAccount(true)
        },
        {
            label: <div className="dropdown-item">
                <HomeOutlined /> Trang chủ
            </div>,
            key: 'home',
            onClick: () => navigate('/')
        },
        {
            type: 'divider',
        },
        {
            label: <div className="dropdown-item logout-item">
                <LogoutOutlined /> Đăng xuất
            </div>,
            key: 'logout',
            onClick: () => handleLogout()
        },
    ];

    const urlAvatar = `${import.meta.env.VITE_CLOUDINARY_URL}/avatar/${user?.avatar}`;

    return (
        <>
            <Layout
                style={{ minHeight: '100vh' }}
                className="layout-admin"
            >
                <Sider
                    theme='light'
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    width={260}
                >
                    <div className="admin-logo">
                        {collapsed ? 'FO' : 'Food Order Admin'}
                    </div>
                    <Menu
                        defaultSelectedKeys={[activeMenu]}
                        mode="inline"
                        items={items}
                        onClick={(e) => setActiveMenu(e.key)}
                    />
                </Sider>
                <Layout>
                    <div className='admin-header'>
                        <span>
                            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                className: 'trigger',
                                onClick: () => setCollapsed(!collapsed),
                            })}
                        </span>
                        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                            <Space style={{ cursor: "pointer" }}>
                                <Badge dot={true} offset={[-4, 4]}>
                                    <Avatar src={urlAvatar} size="large" />
                                </Badge>
                                {!collapsed && <span style={{ fontWeight: '500' }}>{user?.fullName}</span>}
                                <DownOutlined style={{ fontSize: '12px' }} />
                            </Space>
                        </Dropdown>
                    </div>
                    <Content>
                        <Outlet />
                    </Content>
                    <Footer>
                        Food Order Admin Dashboard &copy; {new Date().getFullYear()} - Made with <HeartTwoTone twoToneColor="#ff4d4f" />
                    </Footer>
                </Layout>
            </Layout>
            <ManageAccount
                isModalOpen={showManageAccount}
                setIsModalOpen={setShowManageAccount}
            />
        </>
    );
};

export default LayoutAdmin;