import { Row, Col, Rate, Divider, Button, Breadcrumb, Skeleton, Tag, Tooltip, Badge, message, Card } from 'antd';
import './book.scss';
import ImageGallery from 'react-image-gallery';
import { useRef, useState, useEffect, useMemo } from 'react';
import ModalGallery from './ModalGallery';
import { MinusOutlined, PlusOutlined, HomeOutlined, ShoppingCartOutlined, ThunderboltOutlined, HeartOutlined, ShareAltOutlined, SafetyCertificateOutlined, HeartFilled, LeftOutlined, RightOutlined, FireOutlined } from '@ant-design/icons';
import { BsCartPlus } from 'react-icons/bs';
import BookLoader from './BookLoader';
import { useDispatch, useSelector } from 'react-redux';
import { doAddBookAction } from '../../redux/order/orderSlice';
import { Link, useNavigate } from 'react-router-dom';
import { addToWishlist, getWishlist, removeFromWishlist, callGetTopSellingProducts } from '../../services/api';
import { doBuyNowAction } from '../../redux/order/buyNowSlice';

const ViewDetail = (props) => {
    const { dataBook } = props;
    const [isOpenModalGallery, setIsOpenModalGallery] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentQuantity, setCurrentQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [loadingRecommended, setLoadingRecommended] = useState(true);
    const refGallery = useRef(null);
    const images = useMemo(() => {
        if (!dataBook || !dataBook.image) return [];

        // Tạo mảng images với ảnh chính là phần tử đầu tiên
        const imageArray = [{
            original: `${import.meta.env.VITE_CLOUDINARY_URL}/food/${dataBook.image}`,
            thumbnail: `${import.meta.env.VITE_CLOUDINARY_URL}/food/${dataBook.image}`,
            originalAlt: dataBook.name,
            thumbnailAlt: dataBook.name,
            loading: 'lazy'
        }];

        // Thêm các hình ảnh phụ nếu có
        if (dataBook.additionalImages && dataBook.additionalImages.length > 0) {
            const additionalImages = dataBook.additionalImages
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map(img => ({
                    original: `${import.meta.env.VITE_CLOUDINARY_URL}/food/${img.imageUrl}`,
                    thumbnail: `${import.meta.env.VITE_CLOUDINARY_URL}/food/${img.imageUrl}`,
                    originalAlt: img.alt || dataBook.name,
                    thumbnailAlt: img.alt || dataBook.name,
                    loading: 'lazy'
                }));

            // Kết hợp ảnh chính và ảnh phụ
            imageArray.push(...additionalImages);
        }

        return imageArray;
    }, [dataBook]);
    const [wishlist, setWishlist] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(state => state.account.isAuthenticated);
    console.log(">>> dataBook: ", dataBook);

    // Define the nonAccentVietnamese function
    const nonAccentVietnamese = (str) => {
        str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/Đ/g, "D");
        str = str.replace(/đ/g, "d");
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
        str = str.replace(/\u02C6|\u0306|\u031B/g, "");
        return str;
    }

    // Define the convertSlug function
    const convertSlug = (str) => {
        str = nonAccentVietnamese(str);
        str = str.trim().toLowerCase();

        const from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;";
        const to = "AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------";
        for (let i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        return str.replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    useEffect(() => {
        // Simulate loading
        if (dataBook && dataBook.id) {
            console.log(">>> dataBook: ", dataBook.id);
            setTimeout(() => {
                setLoading(false);
            }, 500);

            // Fetch top selling products for recommendations
            fetchTopSellingProducts();
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

    const fetchTopSellingProducts = async () => {
        try {
            setLoadingRecommended(true);
            const res = await callGetTopSellingProducts(4, dataBook?.id);
            if (res && res.data) {
                setTopSellingProducts(res.data);
            }
            setLoadingRecommended(false);
        } catch (error) {
            console.error("Failed to fetch top selling products", error);
            setLoadingRecommended(false);
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
        // Check if user is authenticated
        const localAuth = localStorage.getItem("isAuthenticated") === "true";

        if (isAuthenticated || localAuth) {
            dispatch(doAddBookAction({ quantity, detail: book, id: book.id }));
            message.success(`Đã thêm ${quantity} ${book.name} vào giỏ hàng`);
        } else {
            message.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
            // Optionally redirect to login page
            // navigate('/login');
        }
    };

    const handleBuyNow = (quantity, book) => {
        localStorage.setItem('buyNowFromDetailPage', 'true');
        dispatch(doBuyNowAction({ quantity, detail: book, id: book.id }));
        navigate('/payment');
    };

    return (
        <div style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: "40px 0",
            minHeight: "100vh"
        }}>
            <div className='view-detail-book' style={{
                maxWidth: 1200,
                margin: '0 auto',
                minHeight: "calc(100vh - 150px)",
                padding: "0 20px",
                animation: "fadeIn 0.5s ease-out"
            }}>
                <Breadcrumb
                    style={{
                        margin: '0 0 20px 0',
                        padding: '15px 20px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease'
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
                    borderRadius: '20px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    animation: "slideUp 0.6s ease-out"
                }}>
                    {loading ? (
                        <Row gutter={[30, 30]}>
                            <Col md={10} sm={24} xs={24}>
                                <Skeleton.Image style={{ width: '100%', height: '400px', borderRadius: '12px' }} active />
                                <div style={{ marginTop: '20px' }}>
                                    <Row gutter={[10, 10]}>
                                        {[...Array(4)].map((_, index) => (
                                            <Col span={6} key={index}>
                                                <Skeleton.Image style={{ width: '100%', height: '80px', borderRadius: '8px' }} active />
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
                                        border: '1px solid rgba(240,240,240,0.8)',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                                        }}>
                                        <ImageGallery
                                            ref={refGallery}
                                            items={images}
                                            showPlayButton={false}
                                            showFullscreenButton={false}
                                            showNav={true}
                                            renderLeftNav={(onClick, disabled) => (
                                                <button
                                                    className="image-gallery-left-nav"
                                                    disabled={disabled}
                                                    onClick={onClick}
                                                    aria-label="Previous Slide"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.5)',
                                                        borderRadius: '50%',
                                                        width: '40px',
                                                        height: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        position: 'absolute',
                                                        left: '10px',
                                                        zIndex: 4,
                                                        opacity: 0.7
                                                    }}
                                                >
                                                    <LeftOutlined style={{ fontSize: '18px', color: '#333' }} />
                                                </button>
                                            )}
                                            renderRightNav={(onClick, disabled) => (
                                                <button
                                                    className="image-gallery-right-nav"
                                                    disabled={disabled}
                                                    onClick={onClick}
                                                    aria-label="Next Slide"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.5)',
                                                        borderRadius: '50%',
                                                        width: '40px',
                                                        height: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        position: 'absolute',
                                                        right: '10px',
                                                        zIndex: 4,
                                                        opacity: 0.7
                                                    }}
                                                >
                                                    <RightOutlined style={{ fontSize: '18px', color: '#333' }} />
                                                </button>
                                            )}
                                            additionalClass="custom-image-gallery"
                                            slideOnThumbnailOver={false}
                                            onClick={() => handleOnClickImage()}
                                            useBrowserFullscreen={false}
                                            showThumbnails={images.length > 1}
                                            lazyLoad={true}
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
                                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                                        transition: "all 0.3s",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#e0e0e0";
                                                        e.currentTarget.style.transform = "translateY(-3px)";
                                                        e.currentTarget.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.15)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                                                        e.currentTarget.style.transform = "translateY(0)";
                                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
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
                                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                                        transition: "all 0.3s",
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleWishlist(dataBook.id);
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = isInWishlist ? "#ffe1e1" : "#e0e0e0";
                                                        e.currentTarget.style.transform = "translateY(-3px)";
                                                        e.currentTarget.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.15)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = isInWishlist ? "#fff0f0" : "#f5f5f5";
                                                        e.currentTarget.style.transform = "translateY(0)";
                                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                                                    }}
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={14} sm={24}>
                                    <Col md={0} sm={24} xs={24} style={{ marginBottom: '20px' }}>
                                        <div style={{
                                            border: '1px solid rgba(240,240,240,0.8)',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                                        }}>
                                            <ImageGallery
                                                ref={refGallery}
                                                items={images}
                                                showPlayButton={false}
                                                showFullscreenButton={false}
                                                showNav={true}
                                                renderLeftNav={(onClick, disabled) => (
                                                    <button
                                                        className="image-gallery-left-nav"
                                                        disabled={disabled}
                                                        onClick={onClick}
                                                        aria-label="Previous Slide"
                                                        style={{
                                                            background: 'rgba(255,255,255,0.5)',
                                                            borderRadius: '50%',
                                                            width: '40px',
                                                            height: '40px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            position: 'absolute',
                                                            left: '10px',
                                                            zIndex: 4,
                                                            opacity: 0.7
                                                        }}
                                                    >
                                                        <LeftOutlined style={{ fontSize: '18px', color: '#333' }} />
                                                    </button>
                                                )}
                                                renderRightNav={(onClick, disabled) => (
                                                    <button
                                                        className="image-gallery-right-nav"
                                                        disabled={disabled}
                                                        onClick={onClick}
                                                        aria-label="Next Slide"
                                                        style={{
                                                            background: 'rgba(255,255,255,0.5)',
                                                            borderRadius: '50%',
                                                            width: '40px',
                                                            height: '40px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            position: 'absolute',
                                                            right: '10px',
                                                            zIndex: 4,
                                                            opacity: 0.7
                                                        }}
                                                    >
                                                        <RightOutlined style={{ fontSize: '18px', color: '#333' }} />
                                                    </button>
                                                )}
                                                showThumbnails={false}
                                            />
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <div className='name' style={{
                                            fontSize: '30px',
                                            fontWeight: 'bold',
                                            marginBottom: '15px',
                                            color: '#222',
                                            borderLeft: '4px solid #ff4d4f',
                                            paddingLeft: '15px',
                                            lineHeight: '1.2',
                                            animation: 'fadeIn 0.8s ease-out'
                                        }}>
                                            {dataBook?.name}
                                            {dataBook?.sold > 100 && (
                                                <Tag color="#f50" style={{
                                                    marginLeft: '10px',
                                                    fontSize: '14px',
                                                    padding: '2px 10px',
                                                    borderRadius: '4px'
                                                }}>
                                                    Bán chạy
                                                </Tag>
                                            )}
                                        </div>

                                        <div className='sold-info' style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '20px',
                                            animation: 'fadeIn 0.9s ease-out'
                                        }}>
                                            <span className='sold' style={{ color: '#666' }}>
                                                Đã bán <strong>{dataBook.sold}</strong>
                                            </span>
                                        </div>

                                        <div className='price' style={{
                                            backgroundColor: 'rgba(245, 245, 245, 0.8)',
                                            padding: '20px 25px',
                                            borderRadius: '12px',
                                            marginBottom: '25px',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            animation: 'slideRight 1s ease-out'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '5px',
                                                height: '100%',
                                                background: '#ff4d4f'
                                            }}></div>
                                            <span className='currency' style={{
                                                fontSize: '32px',
                                                fontWeight: 'bold',
                                                color: '#ff4d4f',
                                                display: 'block',
                                                animation: 'pulse 2s infinite'
                                            }}>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dataBook?.price ?? 0)}
                                            </span>
                                        </div>

                                        <div className='delivery' style={{
                                            marginBottom: '25px',
                                            padding: '15px',
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(245, 245, 245, 0.5)',
                                            animation: 'slideLeft 1.1s ease-out'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span className='left-side' style={{
                                                    minWidth: '100px',
                                                    color: '#666',
                                                    fontWeight: '500'
                                                }}>
                                                    Vận chuyển
                                                </span>
                                                <span className='right-side' style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Tag color="green" icon={<SafetyCertificateOutlined />} style={{
                                                        padding: '5px 10px',
                                                        fontSize: '14px',
                                                        borderRadius: '6px'
                                                    }}>
                                                        Miễn phí vận chuyển
                                                    </Tag>
                                                </span>
                                            </div>
                                        </div>

                                        <div className='quantity' style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '30px',
                                            animation: 'fadeIn 1.2s ease-out'
                                        }}>
                                            <span className='left-side' style={{
                                                minWidth: '100px',
                                                color: '#666',
                                                fontWeight: '500'
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
                                                    style={{
                                                        borderRadius: '8px 0 0 8px',
                                                        height: '38px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
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
                                                        height: '38px',
                                                        fontSize: '15px'
                                                    }}
                                                />
                                                <Button
                                                    icon={<PlusOutlined />}
                                                    onClick={() => handleChangeButton('PLUS')}
                                                    disabled={currentQuantity >= (dataBook.quantity || 99)}
                                                    style={{
                                                        borderRadius: '0 8px 8px 0',
                                                        height: '38px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                />
                                                <span style={{
                                                    marginLeft: '15px',
                                                    color: '#999',
                                                    fontSize: '14px',
                                                    background: 'rgba(240, 240, 240, 0.5)',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px'
                                                }}>
                                                    Còn {dataBook.quantity || 99} sản phẩm
                                                </span>
                                            </span>
                                        </div>

                                        <div className='buy' style={{
                                            display: 'flex',
                                            gap: '15px',
                                            marginBottom: '30px',
                                            animation: 'slideUp 1.3s ease-out'
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
                                                    height: '48px',
                                                    fontSize: '16px',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 4px 10px rgba(255, 77, 79, 0.2)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onClick={() => handleAddToCart(currentQuantity, dataBook)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#fff8f8';
                                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(255, 77, 79, 0.3)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#fff';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(255, 77, 79, 0.2)';
                                                }}
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
                                                    height: '48px',
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 4px 15px rgba(255, 77, 79, 0.3)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onClick={() => handleBuyNow(currentQuantity, dataBook)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#ff3434';
                                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 77, 79, 0.4)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#ff4d4f';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 77, 79, 0.3)';
                                                }}
                                            >
                                                Mua ngay
                                            </Button>
                                        </div>

                                        <div style={{
                                            marginTop: '30px',
                                            padding: '25px',
                                            backgroundColor: 'rgba(249, 249, 249, 0.7)',
                                            borderRadius: '12px',
                                            border: '1px solid #f0f0f0',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                                            animation: 'fadeIn 1.4s ease-out',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '4px',
                                                height: '100%',
                                                background: 'linear-gradient(to bottom, #ff4d4f, #ff7875)'
                                            }}></div>
                                            <h3 style={{
                                                marginBottom: '15px',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                color: '#333'
                                            }}>Thông tin món ăn:</h3>
                                            <p style={{
                                                color: '#666',
                                                lineHeight: '1.7',
                                                fontSize: '15px'
                                            }}>
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

                {/* New recommended products section */}
                <div style={{
                    padding: "30px",
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    animation: "slideUp 0.6s ease-out",
                    marginTop: '30px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '20px'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: '#222',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <FireOutlined style={{ color: '#ff4d4f' }} /> Món ăn được yêu thích
                        </h2>
                        <Link to="/" style={{
                            color: '#ff4d4f',
                            fontWeight: '500',
                            fontSize: '15px',
                            transition: 'all 0.3s'
                        }}>
                            Xem tất cả
                        </Link>
                    </div>

                    {loadingRecommended ? (
                        <Row gutter={[16, 16]}>
                            {[...Array(4)].map((_, index) => (
                                <Col key={index} xs={24} sm={12} md={6}>
                                    <Skeleton.Image style={{ width: '100%', height: '180px', borderRadius: '12px' }} active />
                                    <Skeleton active paragraph={{ rows: 2 }} />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Row gutter={[16, 16]}>
                            {topSellingProducts.map(product => (
                                <Col key={product.id} xs={24} sm={12} md={6}>
                                    <Link to={`/book/${convertSlug(product.name)}?id=${product.id}`}>
                                        <Card
                                            hoverable
                                            cover={
                                                <div style={{
                                                    height: '180px',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderTopLeftRadius: '12px',
                                                    borderTopRightRadius: '12px'
                                                }}>
                                                    <img
                                                        alt={product.name}
                                                        src={`${import.meta.env.VITE_CLOUDINARY_URL}/food/${product.image}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            transition: 'transform 0.5s ease'
                                                        }}
                                                        className="product-image"
                                                    />
                                                </div>
                                            }
                                            style={{
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                transition: 'all 0.3s ease',
                                                height: '100%'
                                            }}
                                            bodyStyle={{ padding: '15px' }}
                                        >
                                            <div style={{ height: '100%' }}>
                                                <h3 style={{
                                                    fontSize: '16px',
                                                    fontWeight: 'bold',
                                                    marginBottom: '8px',
                                                    color: '#333',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    lineHeight: '1.3'
                                                }}>
                                                    {product.name}
                                                </h3>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <span style={{
                                                        color: '#ff4d4f',
                                                        fontWeight: 'bold',
                                                        fontSize: '16px'
                                                    }}>
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        color: '#999'
                                                    }}>
                                                        Đã bán {product.sold}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                </Col>
                            ))}
                        </Row>
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

            <style jsx="true">{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slideLeft {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.85; }
                    100% { opacity: 1; }
                }
                
                .image-gallery {
                    width: 100%;
                }
                
                .image-gallery-slide {
                    background-color: #f0f0f0;
                    border-radius: 12px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 400px;
                }
                
                .image-gallery-image {
                    object-fit: contain !important;
                    width: 100%;
                    height: 100%;
                    max-height: 400px;
                }
                
                .image-gallery-thumbnails-container {
                    display: flex;
                    justify-content: center;
                    margin-top: 15px;
                }
                
                .image-gallery-thumbnail {
                    border-radius: 8px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    margin: 0 5px;
                }
                
                .image-gallery-thumbnail:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                
                .image-gallery-thumbnail.active {
                    border: 2px solid #ff4d4f;
                }
                
                .image-gallery-thumbnail-image {
                    object-fit: cover;
                    height: 60px;
                    width: 80px;
                }
                
                .product-image:hover {
                    transform: scale(1.05);
                }
            `}</style>
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