import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { callFetchCategoryById, callFetchProductsByCategory } from "../../services/api";
import { ShoppingCartOutlined, HeartOutlined, FireOutlined } from "@ant-design/icons";
import { Pagination, Skeleton, Empty, Tag, Rate, Tooltip, Badge } from "antd";
import { doAddBookAction } from "../../redux/order/orderSlice";
import { useDispatch } from "react-redux";

const CategoryDetail = () => {
    const [category, setCategory] = useState([]);
    const [products, setProducts] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const id = params?.get("id");

    useEffect(() => {
        if (id) {
            setLoading(true);
            Promise.all([fetchCategory(id), fetchProducts(id)])
                .finally(() => setLoading(false));
        }
    }, [id, current, pageSize]);

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
        dispatch(doAddBookAction({ quantity, detail: book, id: book.id }));
        // Show toast notification here if you have one
    }

    const fetchProducts = async (id) => {
        try {
            let query = `page=${current}&size=${pageSize}`;
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

    // Random rating for demonstration purposes
    const getRandomRating = () => {
        return (Math.floor(Math.random() * 10) + 35) / 10; // Random rating between 3.5 and 5.0
    };

    if (!id) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Empty description="Không tìm thấy danh mục" />
        </div>
    );

    return (
        <div
            style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                padding: "40px 0",
                minHeight: "100vh"
            }}
        >
            {/* Category Header */}
            <div style={{
                textAlign: "center",
                marginBottom: "40px",
                color: "#fff",
                padding: "30px 20px",
                maxWidth: "1200px",
                margin: "0 auto"
            }}>
                {loading ? (
                    <Skeleton active paragraph={{ rows: 1 }} />
                ) : (
                    <>
                        <h1 style={{
                            fontSize: "42px",
                            fontWeight: "bold",
                            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                            marginBottom: "20px"
                        }}>
                            {category.name}
                        </h1>
                        <p style={{
                            fontSize: "18px",
                            maxWidth: "800px",
                            margin: "0 auto 30px",
                            opacity: "0.9",
                            lineHeight: "1.6"
                        }}>
                            Khám phá các món ăn tuyệt vời từ danh mục {category.name} của chúng tôi.
                            Tất cả đều được chuẩn bị từ nguyên liệu tươi ngon nhất.
                        </p>
                        <div style={{ position: "relative", overflow: "hidden", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
                            <img
                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/category/${category.image}`}
                                alt={category.name}
                                style={{
                                    width: "100%",
                                    maxHeight: "400px",
                                    objectFit: "cover",
                                    transition: "transform 0.5s ease",
                                }}
                                onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                            />
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
                {/* Filter options could be added here */}

                {/* Products Grid */}
                {loading ? (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "24px",
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
                                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                                gap: "24px",
                                width: "100%",
                                margin: "0 auto",
                            }}>
                                {products.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleRedirectBook(item)}
                                        style={{
                                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                                            borderRadius: "16px",
                                            overflow: "hidden",
                                            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
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
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/food/${item.image}`}
                                                alt={item.name}
                                                style={{
                                                    width: "100%",
                                                    height: "220px",
                                                    objectFit: "cover",
                                                }}
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

                                                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                                                    <Rate
                                                        disabled
                                                        defaultValue={getRandomRating()}
                                                        allowHalf
                                                        style={{ fontSize: "14px" }}
                                                    />
                                                    <span style={{ marginLeft: "5px", color: "#999", fontSize: "12px" }}>
                                                        ({Math.floor(Math.random() * 100) + 10})
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginTop: "10px"
                                            }}>
                                                <div style={{
                                                    fontSize: "18px",
                                                    fontWeight: "bold",
                                                    color: "#e53935"
                                                }}>
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item?.price ?? 0)}
                                                </div>

                                                <div style={{
                                                    fontSize: "14px",
                                                    color: "#757575",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "5px"
                                                }}>
                                                    <Badge count={item.sold} color="#faad14" overflowCount={999} />
                                                    <span>đã bán</span>
                                                </div>
                                            </div>

                                            <div style={{
                                                marginTop: "15px",
                                                display: "flex",
                                                gap: "10px"
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

                                                <Tooltip title="Yêu thích">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Add wishlist functionality here
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            backgroundColor: "#f5f5f5",
                                                            color: "#666",
                                                            padding: "10px",
                                                            borderRadius: "8px",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            transition: "background-color 0.3s"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = "#e0e0e0";
                                                            e.currentTarget.style.color = "#ff4d4f";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = "#f5f5f5";
                                                            e.currentTarget.style.color = "#666";
                                                        }}
                                                    >
                                                        <HeartOutlined style={{ fontSize: "18px" }} />
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
                            }}
                        >
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={handleOnchangePage}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryDetail;