import React, { useState, useEffect, useCallback } from 'react';
import {
    Row,
    Col,
    Spin,
    Empty,
    Pagination,
    Tabs,
    message,
    Button,
    Badge,
    Tooltip
} from 'antd';
import {
    HomeOutlined,
    CloseOutlined,
    FireOutlined,
    ShoppingCartOutlined,
    HeartOutlined,
    HeartFilled
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { addToWishlist, callFetchListFood, getWishlist, removeFromWishlist } from '../../services/api';
import { useDispatch } from 'react-redux';

const SearchResult = ({
    searchTerm: initialSearchTerm,
    setSearchTerm: setParentSearchTerm
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
    const [listBook, setListBook] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [total, setTotal] = useState(0);
    const [sortQuery, setSortQuery] = useState('sort=createdAt,desc');
    const [wishlist, setWishlist] = useState([]);

    // Styles tương tự như trong Home
    const styles = {
        container: {
            background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: "40px 0",
            minHeight: "100vh"
        },
        homepageContainer: { maxWidth: 1440, margin: '0 auto' },
        productContainer: {
            padding: "25px",
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            color: 'white'
        }
    };

    // Hàm fetch sách theo từ khóa
    const fetchSearchResults = useCallback(async () => {
        if (!searchTerm) return;

        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('page', current);
            queryParams.append('size', pageSize);
            queryParams.append('filter', `name ~ '${searchTerm}'`);

            if (sortQuery) {
                const sortParams = new URLSearchParams(sortQuery);
                for (const [key, value] of sortParams.entries()) {
                    queryParams.append(key, value);
                }
            }

            const res = await callFetchListFood(queryParams.toString());

            if (res?.data) {
                setListBook(res.data.result);
                setTotal(res.data.meta.total);
            }
        } catch (error) {
            console.error("Error fetching search results:", error);
            message.error('Không thể tải kết quả tìm kiếm');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, current, pageSize, sortQuery]);

    // Tab items configuration
    const items = [
        { key: "sort=createdAt,desc", label: "Hàng Mới", children: <></> },
        { key: "sort=sold,desc", label: "Phổ biến", children: <></> },
        { key: "sort=price,asc", label: "Giá Thấp Đến Cao", children: <></> },
        { key: "sort=price,desc", label: "Giá Cao Đến Thấp", children: <></> }
    ];

    // Effect fetch kết quả
    useEffect(() => {
        fetchSearchResults();
    }, [fetchSearchResults]);
    const nonAccentVietnamese = useCallback((str) => {
        const replacements = [
            [/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a"],
            [/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, "A"],
            [/[èéẹẻẽêềếệểễ]/g, "e"],
            [/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, "E"],
            [/[ìíịỉĩ]/g, "i"],
            [/[ÌÍỊỈĨ]/g, "I"],
            [/[òóọỏõôồốộổỗơờớợởỡ]/g, "o"],
            [/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, "O"],
            [/[ùúụủũưừứựửữ]/g, "u"],
            [/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, "U"],
            [/[ỳýỵỷỹ]/g, "y"],
            [/[ỲÝỴỶỸ]/g, "Y"],
            [/đ/g, "d"],
            [/Đ/g, "D"],
            [/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""],
            [/\u02C6|\u0306|\u031B/g, ""]
        ];
        return replacements.reduce((result, [regex, replacement]) =>
            result.replace(regex, replacement), str);
    }, []);

    const convertSlug = useCallback((str) => {
        return nonAccentVietnamese(str.trim().toLowerCase())
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }, [nonAccentVietnamese]);
    // Hàm quay về trang chủ
    const handleClearSearch = () => {
        setSearchTerm('');
        setParentSearchTerm('');
        navigate('/');
    };
    const handleRedirectBook = useCallback((book) => {
        const slug = convertSlug(book.name);
        navigate(`/book/${slug}?id=${book.id}`);
    }, [convertSlug, navigate]);

    const handleAddToCart = useCallback((quantity, book) => {
        dispatch(doAddBookAction({ quantity, detail: book, id: book.id }));
    }, [dispatch]);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await getWishlist();
                if (res?.data) {
                    setWishlist(res.data.list);
                }
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            }
        };
        fetchWishlist();
    }, []);

    const handleToggleWishlist = useCallback(async (productId) => {
        try {
            const isInWishlist = wishlist.includes(productId);
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
    }, [wishlist]);
    // Render sản phẩm
    const ProductItem = React.memo(({ item, wishlist, handleRedirectBook, handleAddToCart, handleToggleWishlist }) => {
        const isInWishlist = wishlist.includes(item.id);
        return (
            <div
                onClick={() => handleRedirectBook(item)}
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-10px)";
                    e.currentTarget.style.boxShadow = "0 15px 30px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.1)";
                }}
            >
                <div style={{ position: "relative" }}>
                    <img
                        src={`${import.meta.env.VITE_CLOUDINARY_URL}/food/${item.image}`}
                        alt={item.name}
                        style={{ width: "100%", height: "220px", objectFit: "cover" }}
                        loading="lazy"
                    />
                    {item.sold > 50 && (
                        <div style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            backgroundColor: "#ff4d4f",
                            color: "white",
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                        }}>
                            <FireOutlined /> Bán chạy
                        </div>
                    )}
                </div>
                <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ marginBottom: "auto" }}>
                        <h3 style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#333",
                            marginBottom: "8px",
                            minHeight: "48px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>
                            {item.name}
                        </h3>
                    </div>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "10px"
                    }}>
                        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#e53935" }}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item?.price ?? 0)}
                        </div>
                        <div style={{ fontSize: "14px", color: "#757575", display: "flex", alignItems: "center", gap: "5px" }}>
                            <Badge count={item.sold?.toLocaleString()
                                ?? 0} style={{ backgroundColor: "#faad14", color: "#fff" }} showZero />
                            <span>đã bán</span>
                        </div>
                    </div>
                    <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                        <Tooltip title="Thêm vào giỏ hàng">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(1, item);
                                }}
                                style={{
                                    flex: 3,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    backgroundColor: "#ff4d4f",
                                    color: "#fff",
                                    padding: "10px 15px",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                    transition: "background-color 0.3s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#d9363e"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ff4d4f"}
                            >
                                <ShoppingCartOutlined style={{ fontSize: "16px" }} /> Thêm vào giỏ
                            </button>
                        </Tooltip>
                        <Tooltip title={isInWishlist ? "Bỏ yêu thích" : "Yêu thích"}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleWishlist(item.id);
                                }}
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: isInWishlist ? "#fff0f0" : "#f5f5f5",
                                    color: isInWishlist ? "#ff4d4f" : "#666",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.3s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isInWishlist ? "#ffe1e1" : "#e0e0e0"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isInWishlist ? "#fff0f0" : "#f5f5f5"}
                            >
                                {isInWishlist ? (
                                    <HeartFilled style={{ fontSize: "18px", color: "#ff4d4f" }} />
                                ) : (
                                    <HeartOutlined style={{ fontSize: "18px", color: "#666" }} />
                                )}
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div style={styles.container}>
            <div className="homepage-container" style={styles.homepageContainer}>
                <Row gutter={[30, 20]}>
                    <Col span={24}>
                        <Spin spinning={isLoading} tip="Đang tìm kiếm...">
                            <div style={styles.productContainer}>
                                <Row>
                                    <Tabs
                                        defaultActiveKey="sort=createdAt,desc"
                                        items={items}
                                        onChange={(value) => setSortQuery(value)}
                                        style={{
                                            overflowX: "auto",
                                            width: '100%',
                                            marginBottom: '0px',
                                            color: 'white'
                                        }}
                                        tabBarStyle={{
                                            fontWeight: '500',
                                            fontSize: '16px'
                                        }}
                                    />
                                </Row>
                                <Row
                                    className="customize-row"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                        gap: '25px',
                                        margin: '10px 0'
                                    }}
                                >
                                    {listBook.map((item) => (
                                        <ProductItem
                                            key={item.id}
                                            item={item}
                                            wishlist={wishlist}
                                            handleRedirectBook={handleRedirectBook}
                                            handleAddToCart={handleAddToCart}
                                            handleToggleWishlist={handleToggleWishlist}
                                        />
                                    ))}

                                    {listBook.length === 0 && (
                                        <div style={{
                                            width: "100%",
                                            margin: "0 auto",
                                            gridColumn: '1 / -1'
                                        }}>
                                            <Empty
                                                description={
                                                    <span style={{ color: '#666', fontSize: '16px' }}>
                                                        Không tìm thấy kết quả cho "{searchTerm}"
                                                    </span>
                                                }
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                style={{
                                                    padding: '50px 0',
                                                    background: 'white',
                                                    borderRadius: '12px'
                                                }}
                                            />
                                        </div>
                                    )}
                                </Row>

                                <div style={{
                                    marginTop: "50px",
                                    display: "flex",
                                    justifyContent: "center"
                                }}>
                                    <div style={{
                                        backgroundColor: "#fff",
                                        padding: "12px 25px",
                                        borderRadius: "50px",
                                        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)"
                                    }}>
                                        <Pagination
                                            current={current}
                                            total={total}
                                            pageSize={pageSize}
                                            responsive
                                            onChange={(page, pageSize) => {
                                                setCurrent(page);
                                                setPageSize(pageSize);
                                            }}
                                            style={{ fontSize: '16px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Spin>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default SearchResult;
