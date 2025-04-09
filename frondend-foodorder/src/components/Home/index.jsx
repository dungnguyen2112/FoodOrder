import { FilterTwoTone, ReloadOutlined, HomeOutlined, UserOutlined, PlusCircleOutlined, HeartOutlined, ShoppingCartOutlined, FireOutlined, HeartFilled } from '@ant-design/icons';
import { Row, Col, Form, Checkbox, Divider, InputNumber, Button, Rate, Tabs, Pagination, Spin, Empty, Breadcrumb, Tooltip, Badge } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { addToWishlist, callFetchCategory, callFetchCategoryPage, callFetchListFood, getWishlist, removeFromWishlist } from '../../services/api';
import './home.scss';
import MobileFilter from './MobileFilter';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { doAddBookAction } from '../../redux/order/orderSlice';
import { useDispatch, useSelector } from 'react-redux';
import Imageslide from '../Imageslide/Imageslide';
import { use } from 'react';
import { message } from 'antd';
import debounce from 'lodash/debounce';
import SearchResult from './SearchResult';




const Home = () => {
    const [searchTerm, setSearchTerm] = useOutletContext();
    const [listCategory, setListCategory] = useState([]);
    const [dataListCategory, setDataListCategory] = useState([]);
    const [listBook, setListBook] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [total, setTotal] = useState(0);
    const [sliderBooks, setSliderBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("");
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [wishlist, setWishlist] = useState([]);
    const [form] = Form.useForm();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.account.user);

    // Memoized helper functions
    const transformCategoryData = useCallback((data, isPageData = false) => {
        return data.map(item => ({
            id: isPageData ? item.id : undefined,
            label: isPageData ? item.name : item,
            value: isPageData ? item.name : item,
            image: isPageData ? item.image : item
        }));
    }, []);

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

    // Initial fetch with Promise.all
    useEffect(() => {
        const initFetch = async () => {
            try {
                const [pageCategories, categories, sliderBooks] = await Promise.all([
                    callFetchCategoryPage(),
                    callFetchCategory(),
                    callFetchListFood("sort=sold,desc&size=6")
                ]);

                if (pageCategories?.data) {
                    setDataListCategory(transformCategoryData(pageCategories.data.result, true));
                }
                if (categories?.data) {
                    setListCategory(transformCategoryData(categories.data));
                }
                if (sliderBooks?.data) {
                    setSliderBooks(sliderBooks.data.result);
                }
            } catch (error) {
                console.error("Error in initial fetch:", error);
            }
        };
        initFetch();
    }, [transformCategoryData]);

    // Thay đổi nhỏ trong phần debounce
    const debouncedFetchBook = useCallback(debounce(async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('page', current);
            queryParams.append('size', pageSize);

            if (filter) {
                const filterParams = new URLSearchParams(filter);
                for (const [key, value] of filterParams.entries()) {
                    queryParams.append(key, value);
                }
            }

            if (sortQuery) {
                const sortParams = new URLSearchParams(sortQuery);
                for (const [key, value] of sortParams.entries()) {
                    queryParams.append(key, value);
                }
            }

            if (searchTerm) {
                queryParams.append('filter', `name ~ '${searchTerm}'`);
            }

            const res = await callFetchListFood(queryParams.toString());
            if (res?.data) {
                setListBook(res.data.result);
                setTotal(res.data.meta.total);
            }
        } catch (error) {
            console.error("Error fetching books:", error);
            message.error('Không thể tải sách');
        } finally {
            setIsLoading(false);
        }
    }, 500), [current, pageSize, filter, sortQuery, searchTerm]);

    // Thêm cleanup cho debounce
    useEffect(() => {
        return () => {
            debouncedFetchBook.cancel();
        };
    }, [debouncedFetchBook]);

    // Gọi debounce khi các dependency thay đổi
    useEffect(() => {
        debouncedFetchBook();
    }, [debouncedFetchBook]);


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

    // Optimized handlers
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

    const handleAddToCart = useCallback((quantity, book) => {
        dispatch(doAddBookAction({ quantity, detail: book, id: book.id }));
    }, [dispatch]);

    const handleOnchangePage = useCallback((pagination) => {
        if (pagination?.current !== current) {
            setCurrent(pagination.current);
        }
        if (pagination?.pageSize !== pageSize) {
            setPageSize(pagination.pageSize);
            setCurrent(1);
        }
    }, [current, pageSize]);

    // Thêm state mới
    const [isFilterLoading, setIsFilterLoading] = useState(false);

    // Điều chỉnh handleChangeFilter
    const handleChangeFilter = useCallback((changedValues, values) => {
        if (changedValues.category) {
            setIsFilterLoading(true);
            if (values.category?.length > 0) {
                const categories = values.category.join(`' or categoryName ~ '`);
                setFilter(`filter=categoryName ~ '${categories}'`);
            } else {
                setFilter('');
            }

            // Đặt timeout để tắt loading
            setTimeout(() => {
                setIsFilterLoading(false);
            }, 500);
        }
    }, []);

    // Điều chỉnh onFinish
    const onFinish = useCallback((values) => {
        setIsFilterLoading(true);
        if (values?.range?.from >= 0 && values?.range?.to >= 0) {
            const filters = [`price >: ${values.range.from}`, `price <: ${values.range.to}`];
            if (values?.category?.length) {
                const categories = values.category.join(`' or categoryName ~ '`);
                filters.push(`categoryName ~ '${categories}'`);
            }
            setFilter(`filter=${filters.join(' and ')}`);

            // Đặt timeout để tắt loading
            setTimeout(() => {
                setIsFilterLoading(false);
            }, 500);
        }
    }, []);

    const handleRedirectBook = useCallback((book) => {
        const slug = convertSlug(book.name);
        navigate(`/book/${slug}?id=${book.id}`);
    }, [convertSlug, navigate]);

    // Tab items configuration
    const items = [
        { key: "sort=sold,desc", label: "Phổ biến", children: <></> },
        { key: "sort=createdAt,desc", label: "Hàng Mới", children: <></> },
        { key: "sort=price,asc", label: "Giá Thấp Đến Cao", children: <></> },
        { key: "sort=price,desc", label: "Giá Cao Đến Thấp", children: <></> }
    ];

    // Remember to return your component JSX here
    // The return statement was missing in the original code
    // Định nghĩa styles để tái sử dụng
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
        breadcrumb: {
            margin: '10px 0',
            color: 'white',
            background: 'rgba(0,0,0,0.3)',
            padding: '8px 15px',
            borderRadius: '8px',
            backdropFilter: 'blur(5px)'
        },
        banner: {
            width: "100%",
            color: "white",
            marginBottom: 30,
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        },
        bannerInner: { maxWidth: 1440, margin: "0 auto" },
        categoryContainer: {
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '25px',
            flexWrap: 'wrap',
            marginBottom: '40px',
            width: '100%',
            maxWidth: '1500px',
            margin: '40px auto'
        },
        categoryLink: {
            flex: '1 1 150px',
            position: 'relative',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            textDecoration: 'none',
            transition: 'transform 0.4s ease, box-shadow 0.4s ease',
            maxWidth: '220px'
        },
        categoryImg: {
            width: '100%',
            height: '220px',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.6s ease, filter 0.6s ease'
        },
        filterContainer: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            position: 'sticky',
            top: '20px'
        },
        productContainer: {
            padding: "25px",
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            color: 'white'
        }
    };

    // Component CategoryItem với memo hóa
    const CategoryItem = React.memo(({ category, convertSlug }) => (
        <Link
            to={`/category/${convertSlug(category.label)}?id=${category.id}`}
            style={styles.categoryLink}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            }}
        >
            <img
                src={`${import.meta.env.VITE_BACKEND_URL}/storage/category/${category.image}`}
                alt={category.label}
                style={styles.categoryImg}
                loading="lazy"
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.filter = 'brightness(1)';
                }}
            />
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: '18px 15px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)',
                color: '#fff',
                fontSize: '18px',
                fontWeight: '600',
                textAlign: 'center',
                backdropFilter: 'blur(4px)',
                transition: 'padding 0.3s ease'
            }}>
                {category.label}
            </div>
        </Link>
    ));

    // Component ProductItem với memo hóa
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
                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/food/${item.image}`}
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
        searchTerm ? (
            <SearchResult
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
        ) : (
            <div style={styles.container}>
                <div className="homepage-container" style={styles.homepageContainer}>
                    <Breadcrumb
                        style={styles.breadcrumb}
                        items={[
                            { title: <HomeOutlined style={{ fontSize: '16px' }} /> },
                            { title: <Link to={'/'}><span style={{ color: 'white', fontWeight: 500 }}>Trang Chủ</span></Link> }
                        ]}
                    />

                    <div style={styles.banner}>
                        <div style={styles.bannerInner}>
                            <div style={{ width: "100%", height: "450px", border: "none", boxShadow: "none" }}>
                                <Imageslide
                                    slides={
                                        sliderBooks.length > 0
                                            ? sliderBooks.map((book) => ({
                                                url: `${import.meta.env.VITE_BACKEND_URL}/storage/food/${book.image}`,
                                                title: book.name,
                                            }))
                                            : []
                                    }
                                    style={{ border: "none", boxShadow: "none" }}
                                    captionStyle={{
                                        border: "none",
                                        borderBottom: "none",
                                        boxShadow: "none",
                                        textAlign: "center",
                                        fontWeight: "bold",
                                        fontSize: "24px",
                                        padding: "15px",
                                        background: "rgba(0,0,0,0.5)",
                                        backdropFilter: "blur(5px)",
                                        marginTop: 0
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={styles.categoryContainer}>
                        {dataListCategory?.map((category, index) => (
                            <CategoryItem key={`category-link-${index}`} category={category} convertSlug={convertSlug} />
                        ))}
                    </div>

                    <Row gutter={[30, 20]}>
                        <Col md={5} sm={24} xs={24}>
                            <div className="filter-container" style={styles.filterContainer}>
                                <div className="filter-header" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '15px',
                                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                                    paddingBottom: '15px'
                                }}>
                                    <span className="filter-title" style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
                                        <FilterTwoTone twoToneColor="#ff4d4f" /> <span>Bộ lọc tìm kiếm</span>
                                    </span>
                                    <ReloadOutlined
                                        className="reset-icon"
                                        title="Reset"
                                        style={{ fontSize: '16px', cursor: 'pointer', color: '#666', transition: 'all 0.3s ease' }}
                                        onClick={() => {
                                            form.resetFields();
                                            setFilter('');
                                            setSearchTerm('');
                                        }}
                                    />
                                </div>
                                <Form
                                    form={form}
                                    onFinish={onFinish}
                                    onValuesChange={(changedValues, values) => handleChangeFilter(changedValues, values)}
                                    layout="vertical"
                                >
                                    <Spin spinning={isFilterLoading} tip="Đang lọc...">
                                        {/* Nội dung form như cũ */}
                                        <Form.Item
                                            name="category"
                                            label={<span style={{ fontWeight: 500, fontSize: '16px' }}>Danh mục sản phẩm</span>}
                                            labelCol={{ span: 24 }}
                                        >
                                            <Checkbox.Group style={{ width: '100%' }}>
                                                <Row>
                                                    {listCategory?.map((item, index) => (
                                                        <Col span={24} key={`category-${index}`} className="filter-checkbox" style={{ marginBottom: '10px' }}>
                                                            <Checkbox value={item.value} style={{ fontSize: '15px' }}>
                                                                {item.label}
                                                            </Checkbox>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </Checkbox.Group>
                                        </Form.Item>
                                        <Divider style={{ margin: '15px 0' }} />
                                        <Form.Item
                                            label={<span style={{ fontWeight: 500, fontSize: '16px' }}>Khoảng giá</span>}
                                            labelCol={{ span: 24 }}
                                        >
                                            <Row gutter={[10, 10]} align="middle">
                                                <Col span={11}>
                                                    <Form.Item name={["range", "from"]} noStyle>
                                                        <InputNumber
                                                            min={0}
                                                            placeholder="đ TỪ"
                                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                            className="filter-input"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={2} style={{ textAlign: 'center' }}><span>-</span></Col>
                                                <Col span={11}>
                                                    <Form.Item name={["range", "to"]} noStyle>
                                                        <InputNumber
                                                            min={0}
                                                            placeholder="đ ĐẾN"
                                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                            className="filter-input"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Button
                                                onClick={() => form.submit()}
                                                type="primary"
                                                block
                                                style={{
                                                    marginTop: '15px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    fontSize: '15px',
                                                    fontWeight: '500',
                                                    background: '#ff4d4f',
                                                    border: 'none'
                                                }}
                                            >
                                                Áp dụng
                                            </Button>
                                        </Form.Item>
                                    </Spin>
                                </Form>
                            </div>
                        </Col>

                        <Col md={19} xs={24}>
                            <Spin spinning={isLoading} tip="Loading...">
                                <div style={styles.productContainer}>
                                    <Row>
                                        <Tabs
                                            defaultActiveKey="sort=sold,asc"
                                            items={items}
                                            onChange={(value) => setSortQuery(value)}
                                            style={{ overflowX: "auto", width: '100%', marginBottom: '0px', color: 'white' }}
                                            tabBarStyle={{ fontWeight: '500', fontSize: '16px' }}
                                        />
                                        <Col xs={24} md={0}>
                                            <div
                                                style={{
                                                    marginBottom: 20,
                                                    background: '#ff4d4f',
                                                    padding: '10px 15px',
                                                    borderRadius: '8px',
                                                    display: 'inline-block',
                                                    boxShadow: '0 4px 12px rgba(255, 77, 79, 0.2)',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setShowMobileFilter(true)}
                                            >
                                                <FilterTwoTone twoToneColor="#fff" />
                                                <span style={{ fontWeight: 500, color: 'white', marginLeft: '5px' }}> Lọc</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="customize-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px', margin: '10px 0' }}>
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
                                        {listBook?.length === 0 && (
                                            <div style={{ width: "100%", margin: "0 auto", gridColumn: '1 / -1' }}>
                                                <Empty
                                                    description={<span style={{ color: '#666', fontSize: '16px' }}>Không có dữ liệu</span>}
                                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                    style={{ padding: '50px 0', background: 'white', borderRadius: '12px' }}
                                                />
                                            </div>
                                        )}
                                    </Row>
                                    <div style={{ marginTop: "50px", display: "flex", justifyContent: "center" }}>
                                        <div style={{ backgroundColor: "#fff", padding: "12px 25px", borderRadius: "50px", boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" }}>
                                            <Pagination
                                                current={current}
                                                total={total}
                                                pageSize={pageSize}
                                                responsive
                                                onChange={handleOnchangePage}
                                                style={{ fontSize: '16px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Spin>
                        </Col>
                    </Row>

                    <MobileFilter
                        isOpen={showMobileFilter}
                        setIsOpen={setShowMobileFilter}
                        handleChangeFilter={handleChangeFilter}
                        listCategory={listCategory}
                        onFinish={onFinish}
                    />
                </div>
            </div>
        )
    );
}

export default Home;