import { FilterTwoTone, ReloadOutlined, HomeOutlined, UserOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Row, Col, Form, Checkbox, Divider, InputNumber, Button, Rate, Tabs, Pagination, Spin, Empty, Breadcrumb } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { callFetchCategory, callFetchListFood } from '../../services/api';
import './home.scss';
import MobileFilter from './MobileFilter';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { doAddBookAction } from '../../redux/order/orderSlice';
import { useDispatch } from 'react-redux';

const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
            },
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
            },
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
            },
        },
    ],
};

const Home = () => {
    const [searchTerm, setSearchTerm] = useOutletContext();

    const [listCategory, setListCategory] = useState([]);

    const [listBook, setListBook] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [total, setTotal] = useState(0);
    const [sliderBooks, setSliderBooks] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("");
    const dispatch = useDispatch();
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        const initCategory = async () => {
            const res = await callFetchCategory();
            if (res && res.data) {
                const d = res.data.map(item => {
                    return { label: item, value: item }
                })
                setListCategory(d);
            }
        }
        initCategory();
    }, []);


    useEffect(() => {
        const fetchSliderBooks = async () => {
            const res = await callFetchListFood("sort=sold,desc&size=6"); // Lấy 10 sản phẩm bán chạy nhất
            if (res && res.data) {
                setSliderBooks(res.data.result);
            }
        };
        fetchSliderBooks();
    }, []);


    useEffect(() => {
        fetchBook();
    }, [current, pageSize, filter, sortQuery, searchTerm]);

    const fetchBook = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        if (searchTerm) {
            query += `&filter=name ~ '${searchTerm}'`;
        }

        const res = await callFetchListFood(query);
        if (res && res.data) {
            setListBook(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }

    const handleAddToCart = (quantity, book) => {
        dispatch(doAddBookAction({ quantity, detail: book, id: book.id }))
    }

    const handleOnchangePage = (pagination) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }

    }

    const handleChangeFilter = (changedValues, values) => {
        // console.log(">>> check changedValues, values: ", changedValues, values)

        //only fire if category changes
        if (changedValues.category) {
            const cate = values.category;
            if (cate && cate.length > 0) {
                const f = cate.join(`' or categoryName ~ '`);
                setFilter(`filter=categoryName ~ '${f}'`);
            } else {
                //reset data -> fetch all
                setFilter('');
            }
        }

    }

    const onFinish = (values) => {
        // console.log('>> check values: ', values)

        if (values?.range?.from >= 0 && values?.range?.to >= 0) {
            let f = `filter=price >: ${values?.range?.from} and price <: ${values?.range?.to}`;
            if (values?.category?.length) {
                const cate = values?.category?.join(`' or categoryName ~ '`);
                f += `&filter=categoryName ~ '${cate}'`;
            }
            setFilter(f);
        }
    }

    const items = [
        {
            key: "sort=sold,desc",
            label: `Phổ biến`,
            children: <></>,
        },
        {
            key: 'sort=createdAt,desc',
            label: `Hàng Mới`,
            children: <></>,
        },
        {
            key: 'sort=price,asc',
            label: `Giá Thấp Đến Cao`,
            children: <></>,
        },
        {
            key: 'sort=price,desc',
            label: `Giá Cao Đến Thấp`,
            children: <></>,
        },
    ];

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
        // Some system encode vietnamese combining accent as individual utf-8 characters
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
        str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
        return str;
    }

    const convertSlug = (str) => {
        str = nonAccentVietnamese(str);
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();

        // remove accents, swap ñ for n, etc
        const from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;";
        const to = "AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------";
        for (let i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes

        return str;
    }

    const handleRedirectBook = (book) => {
        const slug = convertSlug(book.name);
        navigate(`/book/${slug}?id=${book.id}`)
    }

    return (
        <>


            <div style={{ background: '#efefef', padding: "20px 0" }}>
                <div className="homepage-container" style={{ maxWidth: 1440, margin: '0 auto' }}>
                    <Breadcrumb
                        style={{ margin: '5px 0' }}
                        items={[
                            {
                                // href: '#',
                                title: <HomeOutlined />,
                            },
                            {
                                title: (
                                    <Link to={'/'}>
                                        <span>Trang Chủ</span>
                                    </Link>
                                ),
                            }
                        ]}
                    />
                    <Row gutter={[20, 20]}>
                        <Col md={4} sm={24} xs={24}>
                            <div className="filter-container">
                                {/* Header */}
                                <div className="filter-header">
                                    <span className="filter-title">
                                        <FilterTwoTone /> <span>Bộ lọc tìm kiếm</span>
                                    </span>
                                    <ReloadOutlined
                                        className="reset-icon"
                                        title="Reset"
                                        onClick={() => {
                                            form.resetFields();
                                            setFilter('');
                                            setSearchTerm('');
                                        }}
                                    />
                                </div>

                                <Divider />

                                <Form
                                    form={form}
                                    onFinish={onFinish}
                                    onValuesChange={(changedValues, values) => handleChangeFilter(changedValues, values)}
                                >
                                    {/* Danh mục sản phẩm */}
                                    <Form.Item name="category" label="Danh mục sản phẩm" labelCol={{ span: 24 }}>
                                        <Checkbox.Group>
                                            <Row>
                                                {listCategory?.map((item, index) => (
                                                    <Col span={24} key={`category-${index}`} className="filter-checkbox">
                                                        <Checkbox value={item.value}>{item.label}</Checkbox>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Checkbox.Group>
                                    </Form.Item>

                                    <Divider />

                                    {/* Khoảng giá */}
                                    <Form.Item label="Khoảng giá" labelCol={{ span: 24 }}>
                                        <Row gutter={[10, 10]} align="middle">
                                            <Col span={11}>
                                                <Form.Item name={["range", "from"]}>
                                                    <InputNumber
                                                        min={0}
                                                        placeholder="đ TỪ"
                                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        className="filter-input"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            {/* Dấu "-" căn giữa */}
                                            {/* <Col span={2} className="filter-divider">
                                                <span>-</span>
                                            </Col> */}

                                            <Col span={11}>
                                                <Form.Item name={["range", "to"]}>
                                                    <InputNumber
                                                        min={0}
                                                        placeholder="đ ĐẾN"
                                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        className="filter-input"
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Button onClick={() => form.submit()} type="primary" block>
                                            Áp dụng
                                        </Button>
                                    </Form.Item>

                                    <Divider />

                                    {/* Đánh giá */}
                                    <Form.Item label="Đánh giá" labelCol={{ span: 24 }}>
                                        {[5, 4, 3, 2, 1].map((value) => (
                                            <div key={`rating-${value}`} className="rating-item">
                                                <Rate value={value} disabled className="rating-stars" />
                                                {value < 5 && <span className="rating-text">trở lên</span>}
                                            </div>
                                        ))}
                                    </Form.Item>
                                </Form>
                            </div>
                        </Col>

                        <Col md={20} xs={24} >
                            <Spin spinning={isLoading} tip="Loading...">
                                {/* Slider ở trên danh sách sản phẩm */}
                                <div className="product-slider">
                                    <h2>Sản phẩm nổi bật</h2>
                                    <Slider {...sliderSettings}>
                                        {sliderBooks.map((book) => (
                                            <div key={book.id} className="product-item">
                                                <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/food/${book.image}`} alt={book.name} />
                                                <h3>{book.name}</h3>
                                                <p>Giá: {book.price}đ</p>
                                            </div>
                                        ))}
                                    </Slider>
                                </div>
                                <div style={{ padding: "20px", background: '#fff', borderRadius: 5 }}>
                                    <Row >
                                        <Tabs
                                            defaultActiveKey="sort=sold,asc"
                                            items={items}
                                            onChange={(value) => { setSortQuery(value) }}
                                            style={{ overflowX: "auto" }}
                                        />
                                        <Col xs={24} md={0}>
                                            <div style={{ marginBottom: 20 }} >
                                                <span onClick={() => setShowMobileFilter(true)}>
                                                    <FilterTwoTone />
                                                    <span style={{ fontWeight: 500 }}> Lọc</span>
                                                </span>

                                            </div>
                                        </Col>
                                        <br />
                                    </Row>
                                    <Row className='customize-row'>
                                        {listBook?.map((item, index) => {
                                            return (
                                                <div className="column" key={`book-${index}`} onClick={() => handleRedirectBook(item)}>
                                                    <div className='wrapper'>
                                                        <div className='thumbnail'>
                                                            <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/food/${item.image}`} alt="thumbnail book" />
                                                        </div>
                                                        <div className='name' title={item.name}>{item.name}</div>
                                                        <div className='price'>
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item?.price ?? 0)}
                                                        </div>
                                                        <div className='rating'>
                                                            {/* <Rate value={5} disabled style={{ color: '#ffce3d', fontSize: 10 }} /> */}
                                                            <span>Đã bán {item.sold}</span>
                                                        </div>
                                                        <div className="add-to-cart" onClick={(e) => {
                                                            e.stopPropagation(); // Ngăn chặn redirect khi bấm vào icon
                                                            handleAddToCart(1, item);
                                                        }}>
                                                            <PlusCircleOutlined style={{ fontSize: "20px", color: "#ff4d4f", cursor: "pointer" }} />
                                                        </div>

                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {listBook.length === 0 &&
                                            <div style={{ width: "100%", margin: "0 auto" }}>
                                                <Empty
                                                    description="Không có dữ liệu"
                                                />
                                            </div>

                                        }
                                    </Row>
                                    <div style={{ marginTop: 30 }}></div>
                                    <Row style={{ display: "flex", justifyContent: "center" }}>
                                        <Pagination
                                            current={current}
                                            total={total}
                                            pageSize={pageSize}
                                            responsive
                                            onChange={(p, s) => handleOnchangePage({ current: p, pageSize: s })}
                                        />
                                    </Row>
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
        </>
    )
}

export default Home;