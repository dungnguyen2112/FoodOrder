import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { callFetchCategoryById, callFetchProductsByCategory, addToWishlist, removeFromWishlist, getWishlist } from "../../services/api";
import { ShoppingCartOutlined, HeartOutlined, FireOutlined, HomeOutlined, DollarOutlined, SortAscendingOutlined, FilterOutlined, HeartFilled } from "@ant-design/icons";
import { Pagination, Skeleton, Empty, Tag, Tooltip, Badge, Breadcrumb, message } from "antd";
import { doAddBookAction } from "../../redux/order/orderSlice";
import { useDispatch, useSelector } from "react-redux";

const CategoryDetail = () => {
    const [category, setCategory] = useState([]);
    const [products, setProducts] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("");
    const [wishlist, setWishlist] = useState([]);
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(state => state.account.isAuthenticated);
    const location = useLocation();
    const navigate = useNavigate();
    const user = useSelector(state => state.account.user);

    const params = new URLSearchParams(location.search);
    const id = params?.get("id");

    useEffect(() => {
        if (id) {
            setLoading(true);
            Promise.all([fetchCategory(id), fetchProducts(id)])
                .finally(() => setLoading(false));
        }
    }, [id, current, pageSize, sortQuery]);

    // Fetch wishlist
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

    const fetchCategory = async (id) => {
        try {
            const res = await callFetchCategoryById(id);
            if (res && res.data) {
                setCategory(res.data);
                // Set page title dynamically
                document.title = `${res.data.name} | Food Shop`;
            }
            return res;
        } catch (error) {
            console.error("Error fetching category:", error);
        }
    };

    const handleAddToCart = (quantity, book) => {
        // Check if user is authenticated
        const localAuth = localStorage.getItem("isAuthenticated") === "true";

        if (isAuthenticated || localAuth) {
            dispatch(doAddBookAction({ quantity, detail: book, id: book.id }));
            message.success(`Đã thêm sản phẩm vào giỏ hàng`);
        } else {
            message.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
            // Optionally redirect to login page
            // navigate('/login');
        }
    }

    // Handle toggle wishlist (add/remove)
    const handleToggleWishlist = async (productId) => {
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
    };

    const fetchProducts = async (id) => {
        try {
            let query = `page=${current}&size=${pageSize}`;

            // Add sorting parameter if available
            if (sortQuery) {
                query += `&${sortQuery}`;
            }

            const res = await callFetchProductsByCategory(id, query);
            if (res && res.data) {
                setProducts(res.data.result);
                setTotal(res.data.total);
            }
            return res;
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleOnchangePage = (page, size) => {
        setCurrent(page);
        if (size !== pageSize) {
            setPageSize(size);
            setCurrent(1);
        }
        // Scroll to top on page change
        window.scrollTo(0, 0);
    }

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

    const handleRedirectBook = (book) => {
        const slug = convertSlug(book.name);
        navigate(`/book/${slug}?id=${book.id}`);
    }

    // Updated function to handle filter click and apply sorting
    const handleFilterClick = (filterType) => {
        setActiveFilter(filterType);

        // Set appropriate sort query based on filter type
        switch (filterType) {
            case "newest":
                setSortQuery("sort=createdAt,desc");
                break;
            case "bestseller":
                setSortQuery("sort=sold,desc");
                break;
            case "lowPrice":
                setSortQuery("sort=price,asc");
                break;
            case "highPrice":
                setSortQuery("sort=price,desc");
                break;
            default:
                setSortQuery("");
                break;
        }

        // Reset to first page when applying a new filter
        setCurrent(1);
    };

    if (!id) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Empty description="Không tìm thấy danh mục" />
        </div>
    );

    return (
        <div
            style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                padding: "40px 0",
                minHeight: "100vh"
            }}
        >
            {/* Breadcrumb Navigation */}
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto 30px",
                padding: "0 20px",
            }}>
                <Breadcrumb
                    items={[
                        {
                            title: (
                                <Link to="/" style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                                    <HomeOutlined style={{ marginRight: '5px' }} /> Trang chủ
                                </Link>
                            ),
                        },
                        {
                            title: loading ? <Skeleton.Button active size="small" /> : (
                                <span style={{ color: 'white', fontWeight: '500' }}>{category.name}</span>
                            ),
                        },
                    ]}
                    style={{
                        padding: '12px 20px',
                        background: 'rgba(0,0,0,0.5)',
                        borderRadius: '10px',
                        backdropFilter: 'blur(8px)',
                        fontSize: '16px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        width: 'fit-content'
                    }}
                    separator={<span style={{ color: 'rgba(255,255,255,0.8)', margin: '0 8px' }}>/</span>}
                />
            </div>

            {/* Category Header */}
            <div style={{
                textAlign: "center",
                marginBottom: "40px",
                color: "#fff",
                padding: "30px 20px",
                maxWidth: "1200px",
                margin: "0 auto",
                position: "relative"
            }}>
                {loading ? (
                    <Skeleton active paragraph={{ rows: 1 }} />
                ) : (
                    <>
                        <div style={{
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: "16px",
                            boxShadow: "0 20px 35px rgba(0,0,0,0.4)",
                            margin: "0 auto 40px",
                            maxWidth: "1000px"
                        }}>
                            <img
                                src={`${import.meta.env.VITE_CLOUDINARY_URL}/category/${category.image}`}
                                alt={category.name}
                                style={{
                                    width: "100%",
                                    height: "400px",
                                    objectFit: "cover",
                                    transition: "transform 0.8s ease",
                                    filter: "brightness(0.9)"
                                }}
                                onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                            />
                            <div style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4), transparent)",
                                padding: "50px 20px 20px",
                                textAlign: "center"
                            }}>
                                <h1 style={{
                                    fontSize: "48px",
                                    fontWeight: "bold",
                                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                                    margin: "0 0 15px 0",
                                    letterSpacing: "1px"
                                }}>
                                    {category.name}
                                </h1>
                                <p style={{
                                    fontSize: "18px",
                                    maxWidth: "800px",
                                    margin: "0 auto",
                                    opacity: "0.9",
                                    lineHeight: "1.6"
                                }}>
                                    Khám phá các món ăn tuyệt vời từ danh mục {category.name} của chúng tôi.
                                    Tất cả đều được chuẩn bị từ nguyên liệu tươi ngon nhất.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Products Section */}
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 20px"
            }}>
                {/* Redesigned Filter options */}
                {!loading && products.length > 0 && (
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 245, 245, 0.95))",
                        padding: "16px 25px",
                        borderRadius: "12px",
                        marginBottom: "30px",
                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                        flexWrap: "wrap",
                        gap: "15px",
                        border: "1px solid rgba(255, 77, 79, 0.1)"
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            background: "rgba(255, 77, 79, 0.09)",
                            padding: "8px 15px",
                            borderRadius: "8px"
                        }}>
                            <FilterOutlined style={{ marginRight: "8px", color: "#ff4d4f" }} />
                            <span style={{
                                fontWeight: "600",
                                color: "#333",
                                fontSize: "15px"
                            }}>
                                {total} món ăn có sẵn
                            </span>
                        </div>

                        <div style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            alignItems: "center"
                        }}>
                            <span style={{
                                fontWeight: "500",
                                color: "#666",
                                marginRight: "5px",
                                fontSize: "14px"
                            }}>
                                <SortAscendingOutlined style={{ marginRight: "5px" }} />
                                Sắp xếp:
                            </span>

                            <button
                                style={{
                                    background: activeFilter === "newest" ? "linear-gradient(135deg, #ff4d4f, #ff7875)" : "white",
                                    border: activeFilter === "newest" ? "none" : "1px solid #eee",
                                    padding: "8px 15px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    color: activeFilter === "newest" ? "white" : "#555",
                                    fontWeight: "500",
                                    transition: "all 0.3s ease",
                                    boxShadow: activeFilter === "newest" ? "0 4px 10px rgba(255, 77, 79, 0.3)" : "0 2px 5px rgba(0, 0, 0, 0.05)"
                                }}
                                onClick={() => handleFilterClick("newest")}
                                onMouseEnter={(e) => {
                                    if (activeFilter !== "newest") {
                                        e.target.style.backgroundColor = "#f9f9f9";
                                        e.target.style.borderColor = "#ddd";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeFilter !== "newest") {
                                        e.target.style.backgroundColor = "white";
                                        e.target.style.borderColor = "#eee";
                                    }
                                }}>
                                Mới nhất
                            </button>

                            <button
                                style={{
                                    background: activeFilter === "bestseller" ? "linear-gradient(135deg, #ff4d4f, #ff7875)" : "white",
                                    border: activeFilter === "bestseller" ? "none" : "1px solid #eee",
                                    padding: "8px 15px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    color: activeFilter === "bestseller" ? "white" : "#555",
                                    fontWeight: "500",
                                    transition: "all 0.3s ease",
                                    boxShadow: activeFilter === "bestseller" ? "0 4px 10px rgba(255, 77, 79, 0.3)" : "0 2px 5px rgba(0, 0, 0, 0.05)"
                                }}
                                onClick={() => handleFilterClick("bestseller")}
                                onMouseEnter={(e) => {
                                    if (activeFilter !== "bestseller") {
                                        e.target.style.backgroundColor = "#f9f9f9";
                                        e.target.style.borderColor = "#ddd";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeFilter !== "bestseller") {
                                        e.target.style.backgroundColor = "white";
                                        e.target.style.borderColor = "#eee";
                                    }
                                }}>
                                <FireOutlined style={{ marginRight: "5px", fontSize: "14px" }} />
                                Bán chạy
                            </button>

                            <div style={{
                                width: "1px",
                                height: "25px",
                                backgroundColor: "#ddd",
                                margin: "0 5px"
                            }}></div>

                            <button
                                style={{
                                    background: activeFilter === "lowPrice" ? "linear-gradient(135deg, #ff4d4f, #ff7875)" : "white",
                                    border: activeFilter === "lowPrice" ? "none" : "1px solid #eee",
                                    padding: "8px 15px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    color: activeFilter === "lowPrice" ? "white" : "#555",
                                    fontWeight: "500",
                                    transition: "all 0.3s ease",
                                    boxShadow: activeFilter === "lowPrice" ? "0 4px 10px rgba(255, 77, 79, 0.3)" : "0 2px 5px rgba(0, 0, 0, 0.05)"
                                }}
                                onClick={() => handleFilterClick("lowPrice")}
                                onMouseEnter={(e) => {
                                    if (activeFilter !== "lowPrice") {
                                        e.target.style.backgroundColor = "#f9f9f9";
                                        e.target.style.borderColor = "#ddd";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeFilter !== "lowPrice") {
                                        e.target.style.backgroundColor = "white";
                                        e.target.style.borderColor = "#eee";
                                    }
                                }}>
                                <DollarOutlined style={{ marginRight: "5px", fontSize: "14px" }} />
                                Giá thấp
                            </button>

                            <button
                                style={{
                                    background: activeFilter === "highPrice" ? "linear-gradient(135deg, #ff4d4f, #ff7875)" : "white",
                                    border: activeFilter === "highPrice" ? "none" : "1px solid #eee",
                                    padding: "8px 15px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    color: activeFilter === "highPrice" ? "white" : "#555",
                                    fontWeight: "500",
                                    transition: "all 0.3s ease",
                                    boxShadow: activeFilter === "highPrice" ? "0 4px 10px rgba(255, 77, 79, 0.3)" : "0 2px 5px rgba(0, 0, 0, 0.05)"
                                }}
                                onClick={() => handleFilterClick("highPrice")}
                                onMouseEnter={(e) => {
                                    if (activeFilter !== "highPrice") {
                                        e.target.style.backgroundColor = "#f9f9f9";
                                        e.target.style.borderColor = "#ddd";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeFilter !== "highPrice") {
                                        e.target.style.backgroundColor = "white";
                                        e.target.style.borderColor = "#eee";
                                    }
                                }}>
                                <DollarOutlined style={{ marginRight: "5px", fontSize: "14px" }} />
                                Giá cao
                            </button>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: "20px",
                        margin: "0 auto",
                    }}>
                        {[...Array(4)].map((_, index) => (
                            <Skeleton key={index} active paragraph={{ rows: 4 }} />
                        ))}
                    </div>
                ) : (
                    <>
                        {products.length === 0 ? (
                            <div style={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                padding: "40px",
                                textAlign: "center"
                            }}>
                                <Empty
                                    description="Không có sản phẩm nào trong danh mục này"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            </div>
                        ) : (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                                gap: "20px",
                                width: "100%",
                                margin: "0 auto",
                            }}>
                                {products.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleRedirectBook(item)}
                                        style={{
                                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                                            transition: "all 0.3s ease",
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            height: "100%",
                                            border: "1px solid rgba(0,0,0,0.05)"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-8px)";
                                            e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.15)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
                                        }}
                                    >
                                        <div style={{ position: "relative", overflow: "hidden" }}>
                                            <img
                                                src={`${import.meta.env.VITE_CLOUDINARY_URL}/food/${item.image}`}
                                                alt={item.name}
                                                style={{
                                                    width: "100%",
                                                    height: "200px",
                                                    objectFit: "cover",
                                                    transition: "transform 0.5s ease"
                                                }}
                                                onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                                                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
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
                                                    gap: "4px",
                                                    boxShadow: "0 2px 6px rgba(255, 77, 79, 0.4)"
                                                }}>
                                                    <FireOutlined /> Bán chạy
                                                </div>
                                            )}
                                            {/* Price tag */}
                                            <div style={{
                                                position: "absolute",
                                                bottom: "10px",
                                                left: "10px",
                                                backgroundColor: "rgba(0, 0, 0, 0.7)",
                                                color: "white",
                                                padding: "5px 10px",
                                                borderRadius: "8px",
                                                fontSize: "15px",
                                                fontWeight: "bold",
                                                backdropFilter: "blur(4px)"
                                            }}>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item?.price ?? 0)}
                                            </div>
                                        </div>

                                        <div style={{
                                            padding: "15px",
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between"
                                        }}>
                                            <div>
                                                <h3 style={{
                                                    fontSize: "16px",
                                                    fontWeight: "600",
                                                    color: "#333",
                                                    marginBottom: "8px",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    height: "40px"
                                                }}>
                                                    {item.name}
                                                </h3>
                                            </div>

                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginTop: "8px"
                                            }}>
                                                <Tag color="#f50" style={{
                                                    fontSize: "12px",
                                                    padding: "2px 6px",
                                                    border: "none",
                                                    borderRadius: "4px"
                                                }}>
                                                    {item.categoryName}
                                                </Tag>

                                                <div style={{
                                                    fontSize: "13px",
                                                    color: "#757575",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "3px"
                                                }}>
                                                    <Badge count={item.sold} color="#faad14" overflowCount={999} />
                                                    <span>đã bán</span>
                                                </div>
                                            </div>

                                            <div style={{
                                                marginTop: "12px",
                                                display: "flex",
                                                gap: "8px"
                                            }}>
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
                                                            gap: "6px",
                                                            backgroundColor: "#ff4d4f",
                                                            color: "#fff",
                                                            padding: "8px 10px",
                                                            borderRadius: "6px",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            fontWeight: "500",
                                                            fontSize: "14px",
                                                            transition: "background-color 0.3s",
                                                            boxShadow: "0 2px 6px rgba(255, 77, 79, 0.2)"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = "#d9363e";
                                                            e.currentTarget.style.boxShadow = "0 4px 8px rgba(255, 77, 79, 0.3)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = "#ff4d4f";
                                                            e.currentTarget.style.boxShadow = "0 2px 6px rgba(255, 77, 79, 0.2)";
                                                        }}
                                                    >
                                                        <ShoppingCartOutlined style={{ fontSize: "14px" }} /> Thêm vào giỏ
                                                    </button>
                                                </Tooltip>

                                                <Tooltip title={wishlist.includes(item.id) ? "Bỏ yêu thích" : "Yêu thích"}>
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
                                                            backgroundColor: wishlist.includes(item.id) ? "#fff0f0" : "#f5f5f5",
                                                            color: wishlist.includes(item.id) ? "#ff4d4f" : "#666",
                                                            padding: "8px",
                                                            borderRadius: "6px",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            transition: "all 0.3s",
                                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.06)"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = wishlist.includes(item.id) ? "#ffe1e1" : "#fff0f0";
                                                            e.currentTarget.style.color = "#ff4d4f";
                                                            e.currentTarget.style.boxShadow = "0 3px 8px rgba(255, 77, 79, 0.15)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = wishlist.includes(item.id) ? "#fff0f0" : "#f5f5f5";
                                                            e.currentTarget.style.color = wishlist.includes(item.id) ? "#ff4d4f" : "#666";
                                                            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.06)";
                                                        }}
                                                    >
                                                        {wishlist.includes(item.id) ? (
                                                            <HeartFilled style={{ fontSize: "16px" }} />
                                                        ) : (
                                                            <HeartOutlined style={{ fontSize: "16px" }} />
                                                        )}
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Pagination */}
                {!loading && products.length > 0 && (
                    <div
                        style={{
                            marginTop: "40px",
                            display: "flex",
                            justifyContent: "center",
                            padding: "20px 0",
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                padding: "15px 25px",
                                borderRadius: "12px",
                                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                                backdropFilter: "blur(10px)"
                            }}
                        >
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={handleOnchangePage}
                                showSizeChanger
                                pageSizeOptions={['8', '12', '20', '40']}
                                style={{ fontSize: "16px" }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryDetail;