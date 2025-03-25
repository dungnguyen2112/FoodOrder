import { Row, Col, Rate, Divider, Button, Breadcrumb, Skeleton, Tag, Tooltip, Badge, message } from 'antd';
import './book.scss';
import ImageGallery from 'react-image-gallery';
import { useRef, useState, useEffect } from 'react';
import ModalGallery from './ModalGallery';
import { MinusOutlined, PlusOutlined, HomeOutlined, ShoppingCartOutlined, ThunderboltOutlined, HeartOutlined, ShareAltOutlined, SafetyCertificateOutlined, HeartFilled } from '@ant-design/icons';
import { BsCartPlus } from 'react-icons/bs';
import BookLoader from './BookLoader';
import { useDispatch } from 'react-redux';
import { doAddBookAction } from '../../redux/order/orderSlice';
import { Link, useNavigate } from 'react-router-dom';
import { addToWishlist, getWishlist, removeFromWishlist } from '../../services/api';
import { doBuyNowAction } from '../../redux/order/buyNowSlice';

const ViewDetail = (props) => {
    const { dataBook } = props;
    const [isOpenModalGallery, setIsOpenModalGallery] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentQuantity, setCurrentQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const refGallery = useRef(null);
    const images = dataBook?.items ?? [];
    const [wishlist, setWishlist] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    console.log(">>> dataBook: ", dataBook);

    useEffect(() => {
        // Simulate loading
        if (dataBook && dataBook.id) {
            console.log(">>> dataBook: ", dataBook.id);
            setTimeout(() => {
                setLoading(false);
            }, 500);
        }

        // Update document title
        if (dataBook && dataBook.name) {
            document.title = `${dataBook.name} | Food Shop`;
        }
    }, [dataBook]);
    const isInWishlist = dataBook ? wishlist.includes(dataBook.id) : false;
    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleOnClickImage = () => {
        setIsOpenModalGallery(true);
        setCurrentIndex(refGallery?.current?.getCurrentIndex() ?? 0);
    };

    const handleChangeButton = (type) => {
        if (type === 'MINUS') {
            if (currentQuantity - 1 <= 0) return;
            setCurrentQuantity(currentQuantity - 1);
        }
        if (type === 'PLUS') {
            if (currentQuantity === +dataBook.quantity) return; // max
            setCurrentQuantity(currentQuantity + 1);
        }
    };

    const handleChangeInput = (value) => {
        if (!isNaN(value)) {
            if (+value > 0 && +value < +dataBook.quantity) {
                setCurrentQuantity(+value);
            }
        }
    };

    const fetchWishlist = async () => {
        try {
            const res = await getWishlist();
            if (res?.data) {
                const productIds = res.data.list;
                setWishlist(productIds);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        }
    };


    const handleToggleWishlist = async (productId) => {
        try {
            const isInWishlist = wishlist.includes(productId);
            console.log(">>> check isInWishlist: ", isInWishlist)
            if (isInWishlist) {
                await removeFromWishlist(productId);
                setWishlist(prev => prev.filter(id => id !== productId));
                message.success('Đã xóa khỏi yêu thích');
            } else {
                await addToWishlist(productId);
                setWishlist(prev => [...prev, productId]);
                message.success('Đã thêm vào yêu thích');
            }
        } catch (error) {
            console.error("Wishlist action failed", error);
            message.error('Đã có lỗi xảy ra!');
        }
    };


    const handleAddToCart = (quantity, book) => {
        dispatch(doAddBookAction({ quantity, detail: book, id: book.id }));
        message.success(`Đã thêm ${quantity} ${book.name} vào giỏ hàng`);
    };

    const handleBuyNow = (quantity, book) => {
        localStorage.setItem('buyNowFromDetailPage', 'true');
        dispatch(doBuyNowAction({ quantity, detail: book, id: book.id }));
        navigate('/payment');
    };
    // const isInWishlist = wishlist.includes(dataBook.id);

    return (
        <div style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: "40px 0",
            minHeight: "100vh"
        }}>
            <div className='view-detail-book' style={{ maxWidth: 1200, margin: '0 auto', minHeight: "calc(100vh - 150px)", padding: "0 20px" }}>
                <Breadcrumb
                    style={{
                        margin: '0 0 20px 0',
                        padding: '15px 20px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                    }}
                    items={[
                        {
                            title: <Link to='/'><HomeOutlined style={{ color: 'white' }} /></Link>,
                        },
                        {
                            title: (
                                <Link style={{ color: 'white' }} to={'/'}>
                                    <span style={{ color: 'white' }}>Trang Chủ</span>
                                </Link>
                            ),
                        },
                        {
                            title: (
                                <span style={{ color: 'white' }}>{dataBook?.name || 'Chi tiết món ăn'}</span>
                            ),
                        }
                    ]}
                />

                <div style={{
                    padding: "30px",
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    {loading ? (
                        <Row gutter={[30, 30]}>
                            <Col md={10} sm={24} xs={24}>
                                <Skeleton.Image style={{ width: '100%', height: '400px' }} active />
                                <div style={{ marginTop: '20px' }}>
                                    <Row gutter={[10, 10]}>
                                        {[...Array(4)].map((_, index) => (
                                            <Col span={6} key={index}>
                                                <Skeleton.Image style={{ width: '100%', height: '80px' }} active />
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </Col>
                            <Col md={14} sm={24} xs={24}>
                                <Skeleton active paragraph={{ rows: 10 }} />
                            </Col>
                        </Row>
                    ) : (
                        dataBook && dataBook.id ? (
                            <Row gutter={[30, 30]}>
                                <Col md={10} sm={0} xs={0}>
                                    <div style={{
                                        border: '1px solid #f0f0f0',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                    }}>
                                        <ImageGallery
                                            ref={refGallery}
                                            items={images}
                                            showPlayButton={false}
                                            showFullscreenButton={false}
                                            renderLeftNav={() => <></>}
                                            renderRightNav={() => <></>}
                                            slideOnThumbnailOver={true}
                                            onClick={() => handleOnClickImage()}
                                            additionalClass="custom-image-gallery"
                                        />
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '15px',
                                        marginTop: '20px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {/* Chia sẻ */}
                                            <Tooltip title="Chia sẻ">
                                                <Button
                                                    shape="circle"
                                                    icon={<ShareAltOutlined />}
                                                    size="large"
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        backgroundColor: "#f5f5f5",
                                                        border: "none",
                                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                                        transition: "all 0.3s",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#e0e0e0";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                                                    }}
                                                />
                                            </Tooltip>

                                            {/* Yêu thích */}
                                            <Tooltip title={isInWishlist ? "Bỏ yêu thích" : "Yêu thích"}>
                                                <Button
                                                    shape="circle"
                                                    icon={
                                                        isInWishlist ? (
                                                            <HeartFilled style={{ color: "#ff4d4f" }} />
                                                        ) : (
                                                            <HeartOutlined style={{ color: "#666" }} />
                                                        )
                                                    }
                                                    size="large"
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        backgroundColor: isInWishlist ? "#fff0f0" : "#f5f5f5",
                                                        border: "none",
                                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                                        transition: "all 0.3s",
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleWishlist(dataBook.id);
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = isInWishlist ? "#ffe1e1" : "#e0e0e0";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = isInWishlist ? "#fff0f0" : "#f5f5f5";
                                                    }}
                                                />
                                            </Tooltip>

                                            {/* Xem thêm ảnh */}
                                            {/* <Tooltip title="Xem thêm ảnh">
                                                <Button
                                                    shape="round"
                                                    icon={<ExpandOutlined />}
                                                    size="large"
                                                    onClick={() => handleOnClickImage()}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        backgroundColor: "#f5f5f5",
                                                        border: "none",
                                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                                        transition: "all 0.3s",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#e0e0e0";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                                                    }}
                                                >
                                                    Xem thêm ảnh
                                                </Button>
                                            </Tooltip> */}
                                        </div>

                                    </div>
                                </Col>

                                <Col md={14} sm={24}>
                                    <Col md={0} sm={24} xs={24} style={{ marginBottom: '20px' }}>
                                        <div style={{
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                        }}>
                                            <ImageGallery
                                                ref={refGallery}
                                                items={images}
                                                showPlayButton={false}
                                                showFullscreenButton={false}
                                                renderLeftNav={() => <></>}
                                                renderRightNav={() => <></>}
                                                showThumbnails={false}
                                            />
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className='name' style={{
                                            fontSize: '28px',
                                            fontWeight: 'bold',
                                            marginBottom: '15px',
                                            color: '#222'
                                        }}>
                                            {dataBook?.name}
                                            {dataBook?.sold > 100 && (
                                                <Tag color="#f50" style={{ marginLeft: '10px', fontSize: '14px' }}>
                                                    Bán chạy
                                                </Tag>
                                            )}
                                        </div>

                                        {/* <div className='rating' style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '20px'
                                        }}>
                                            <Rate value={4.5} disabled style={{ color: '#ffce3d', fontSize: 16 }} />
                                            <span style={{ marginLeft: '10px', color: '#666' }}>
                                                4.5/5 ({Math.floor(Math.random() * 100) + 50} đánh giá)
                                            </span>
                                            <Divider type="vertical" style={{ margin: '0 15px' }} />
                                            <span className='sold' style={{ color: '#666' }}>
                                                Đã bán <strong>{dataBook.sold}</strong>
                                            </span>
                                        </div> */}

                                        <div className='price' style={{
                                            backgroundColor: '#fafafa',
                                            padding: '15px 20px',
                                            borderRadius: '8px',
                                            marginBottom: '20px'
                                        }}>
                                            <span className='currency' style={{
                                                fontSize: '28px',
                                                fontWeight: 'bold',
                                                color: '#ff4d4f'
                                            }}>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dataBook?.price ?? 0)}
                                            </span>
                                        </div>

                                        <div className='delivery' style={{
                                            marginBottom: '20px',
                                            padding: '15px 0',
                                            borderTop: '1px solid #f0f0f0',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span className='left-side' style={{
                                                    minWidth: '100px',
                                                    color: '#666'
                                                }}>
                                                    Vận chuyển
                                                </span>
                                                <span className='right-side' style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Tag color="green" icon={<SafetyCertificateOutlined />}>
                                                        Miễn phí vận chuyển
                                                    </Tag>
                                                </span>
                                            </div>
                                        </div>

                                        <div className='quantity' style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '30px'
                                        }}>
                                            <span className='left-side' style={{
                                                minWidth: '100px',
                                                color: '#666'
                                            }}>
                                                Số lượng
                                            </span>
                                            <span className='right-side' style={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <Button
                                                    icon={<MinusOutlined />}
                                                    onClick={() => handleChangeButton('MINUS')}
                                                    disabled={currentQuantity <= 1}
                                                    style={{ borderRadius: '4px 0 0 4px' }}
                                                />
                                                <input
                                                    onChange={(event) => handleChangeInput(event.target.value)}
                                                    value={currentQuantity}
                                                    style={{
                                                        width: '50px',
                                                        textAlign: 'center',
                                                        border: '1px solid #d9d9d9',
                                                        borderLeft: 'none',
                                                        borderRight: 'none',
                                                        height: '32px'
                                                    }}
                                                />
                                                <Button
                                                    icon={<PlusOutlined />}
                                                    onClick={() => handleChangeButton('PLUS')}
                                                    disabled={currentQuantity >= (dataBook.quantity || 99)}
                                                    style={{ borderRadius: '0 4px 4px 0' }}
                                                />
                                                <span style={{ marginLeft: '15px', color: '#999', fontSize: '13px' }}>
                                                    Còn {dataBook.quantity || 99} sản phẩm
                                                </span>
                                            </span>
                                        </div>

                                        <div className='buy' style={{
                                            display: 'flex',
                                            gap: '15px',
                                            marginBottom: '20px'
                                        }}>
                                            <Button
                                                size="large"
                                                icon={<ShoppingCartOutlined />}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    backgroundColor: '#fff',
                                                    color: '#ff4d4f',
                                                    borderColor: '#ff4d4f',
                                                    padding: '0 25px',
                                                    height: '45px',
                                                    fontSize: '16px',
                                                    borderRadius: '8px'
                                                }}
                                                onClick={() => handleAddToCart(currentQuantity, dataBook)}
                                            >
                                                Thêm vào giỏ hàng
                                            </Button>

                                            <Button
                                                size="large"
                                                icon={<ThunderboltOutlined />}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    backgroundColor: '#ff4d4f',
                                                    color: '#fff',
                                                    borderColor: '#ff4d4f',
                                                    padding: '0 30px',
                                                    height: '45px',
                                                    fontSize: '16px',
                                                    borderRadius: '8px'
                                                }}
                                                onClick={() => handleBuyNow(currentQuantity, dataBook)}
                                            >
                                                Mua ngay
                                            </Button>
                                        </div>

                                        <div style={{
                                            marginTop: '30px',
                                            padding: '20px',
                                            backgroundColor: '#f9f9f9',
                                            borderRadius: '8px',
                                            border: '1px solid #f0f0f0'
                                        }}>
                                            <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Thông tin món ăn:</h3>
                                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                                {dataBook?.description || 'Món ăn tươi ngon được chế biến từ những nguyên liệu tươi sạch, đảm bảo chất lượng và hương vị. Đây là một trong những món đặc trưng của nhà hàng chúng tôi, được rất nhiều khách hàng yêu thích.'}
                                            </p>
                                        </div>
                                    </Col>
                                </Col>
                            </Row>
                        ) : (
                            <BookLoader />
                        )
                    )}
                </div>
            </div>

            <ModalGallery
                isOpen={isOpenModalGallery}
                setIsOpen={setIsOpenModalGallery}
                currentIndex={currentIndex}
                items={images}
                title={dataBook?.name}
            />
        </div>
    );
};

// Define the ExpandOutlined icon since it's not directly imported
const ExpandOutlined = () => (
    <svg viewBox="64 64 896 896" focusable="false" data-icon="expand" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <path d="M342 88H120c-17.7 0-32 14.3-32 32v224c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V168h174c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16zm578 576h-48c-8.8 0-16 7.2-16 16v176H682c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h222c17.7 0 32-14.3 32-32V680c0-8.8-7.2-16-16-16zM342 856H168V680c0-8.8-7.2-16-16-16h-48c-8.8 0-16 7.2-16 16v224c0 17.7 14.3 32 32 32h222c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16zM904 88H682c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h174v176c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V120c0-17.7-14.3-32-32-32z"></path>
    </svg>
);

export default ViewDetail;