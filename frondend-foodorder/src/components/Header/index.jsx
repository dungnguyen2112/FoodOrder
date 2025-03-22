import React, { useEffect, useState } from 'react';
import { FaReact } from 'react-icons/fa'
import { FiShoppingCart } from 'react-icons/fi';
import { VscSearchFuzzy } from 'react-icons/vsc';
import { Divider, Badge, Drawer, message, Avatar, Popover, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { useNavigate } from 'react-router';
import { callLogout } from '../../services/api';
import './header.scss';
import { doLogoutAction } from '../../redux/account/accountSlice';
import { Link } from 'react-router-dom';
import ManageAccount from '../Account/ManageAccount';
import { use } from 'react';



const Header = (props) => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const isAuthenticated = useSelector(state => state.account.isAuthenticated);
    const user = useSelector(state => state.account.user);
    const [userAvatar, setUserAvatar] = useState(user?.avatar ?? "");
    const [royalty, setRoyalty] = useState(user?.royalty ?? "");
    const [name, setName] = useState(user?.name ?? "");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const carts = useSelector(state => state.order.carts);
    const [showManageAccount, setShowManageAccount] = useState(false);

    useEffect(() => {
        setUserAvatar(user?.avatar);
        setRoyalty(user?.royalty);
        setName(user?.name);
    }, [user]);


    const handleLogout = async () => {
        const res = await callLogout();
        console.log(res);
        if (res && res && +res.statusCode === 200) {
            dispatch(doLogoutAction());
            message.success('Đăng xuất thành công');
            localStorage.setItem("isAuthenticated", "false");
            localStorage.removeItem("user", JSON.stringify(res.data.user));
            navigate('/')
        }
        console.log(user)
    }

    let items = [
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => setShowManageAccount(true)}
            >Quản lý tài khoản</label>,
            key: 'account',
        },
        {
            label: <Link to="/history">Lịch sử mua hàng</Link>,
            key: 'history',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
        },

    ];
    if (user?.roleId === 1) {
        items.unshift({
            label: <Link to='/admin'>Trang quản trị</Link>,
            key: 'admin',
        })
    }

    const urlAvatar = userAvatar
        ? `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${userAvatar}`
        : `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${user?.avatar}`;

    const contentPopover = () => {
        return (
            <div className="cart-popover">
                <div className="cart-popover__content">
                    {carts?.length > 0 ? (
                        carts.map((item, index) => (
                            <div className="cart-item" key={`item-${index}`}>
                                <img
                                    className="cart-item__image"
                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/food/${item?.detail?.image}`}
                                    alt={item?.detail?.name}
                                />
                                <div className="cart-item__details">
                                    <div className="cart-item__name">{item?.detail?.name}</div>
                                    <div className="cart-item__price">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(item?.detail?.price ?? 0)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Empty
                            className="cart-empty"
                            description="Không có sản phẩm trong giỏ hàng"
                        />
                    )}
                </div>
                {carts.length > 0 && (
                    <div className="cart-popover__footer">
                        <button
                            className="view-cart-button"
                            onClick={() => navigate('/order')}
                        >
                            Xem giỏ hàng
                        </button>
                    </div>
                )}
            </div>
        );
    };
    return (
        <>
            <div className="header-container shadow-md">
                <header className="page-header">
                    <div className="page-header__top">
                        {/* <div className="page-header__toggle" onClick={() => setOpenDrawer(true)}>
                            ☰
                        </div> */}

                        <div className="page-header__logo" onClick={() => navigate('/landingpage')}>
                            <FaReact className="rotate icon-react" />
                            <span style={{ color: 'white' }} className="logo-text">Food Order</span>
                        </div>

                        <div className="page-header__search">
                            <VscSearchFuzzy className="icon-search" />
                            <input
                                className="input-search"
                                type="text"
                                placeholder="Bạn tìm gì hôm nay?"
                                value={props.searchTerm}
                                onChange={(e) => props.setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <nav className="page-header__bottom">
                        <ul className="navigation">
                            <li className="navigation__item">
                                <Popover
                                    className="popover-carts"
                                    placement="topRight"
                                    title="Sản phẩm mới thêm"
                                    content={contentPopover}
                                    arrow
                                >
                                    <Badge count={carts?.length ?? 0} size="small" showZero>
                                        <FiShoppingCart className="icon-cart" style={{ color: 'white' }} />
                                    </Badge>
                                </Popover>
                            </li>

                            <li className="navigation__item mobile">
                                <Divider type="vertical" />
                            </li>

                            <li className="navigation__item mobile">
                                {!isAuthenticated ? (
                                    <span className="btn-login" onClick={() => navigate('/login')}>
                                        Tài Khoản
                                    </span>
                                ) : (
                                    <Dropdown menu={{ items }} trigger={['click']}>
                                        <Space className="user-info">
                                            <Avatar src={urlAvatar} />
                                            <span>{user?.name}</span>
                                            <span className="royalty">{user?.royalty}</span>
                                        </Space>
                                    </Dropdown>
                                )}
                            </li>
                        </ul>
                    </nav>
                </header>
            </div>

            <Drawer
                title="Menu chức năng"
                placement="left"
                onClose={() => setOpenDrawer(false)}
                open={openDrawer}
            >
                <p>Quản lý tài khoản</p>
                <Divider />
                <p>Đăng xuất</p>
                <Divider />
            </Drawer>

            <ManageAccount
                isModalOpen={showManageAccount}
                setIsModalOpen={setShowManageAccount}
            />
        </>
    )
};

export default Header;
