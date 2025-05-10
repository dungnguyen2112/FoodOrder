import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./menu.scss";
import bg from "./d.jpg";
import { callFetchCategory, callFetchCategoryPage, callFetchListFood, callFetchProductsByCategory } from "../../services/api";


const Menu = () => {
  const [products, setProducts] = useState([]);
  const [listCategory, setListCategory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(1);
  const navigate = useNavigate();

  const transformCategoryData = (categories) => {
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name
    }));
  };

  // Hàm chuyển đổi chuỗi có dấu thành không dấu
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

  // Hàm tạo slug từ tên sản phẩm
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

  // Hàm xử lý chuyển hướng đến trang chi tiết sản phẩm
  const handleProductClick = (product) => {
    const slug = convertSlug(product.name);
    navigate(`/book/${slug}?id=${product.id}`);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchPageCategories = async () => {
      try {
        const res = await callFetchCategoryPage("size=6");
        if (res?.data) {
          const categories = transformCategoryData(res.data.result, true);
          setListCategory(categories);
          if (categories.length > 0) {
            const defaultCategory = categories[0]; // lấy danh mục đầu tiên
            setSelectedCategory(defaultCategory.id); // set active tab
            fetchProducts(defaultCategory.id); // gọi API lấy sản phẩm
          }
        }
      } catch (error) {
        console.error("Error fetching page categories:", error);
      }
    };
    fetchPageCategories();
  }, []);

  // const fetchFood = async () => {
  //   setIsLoading(true);
  //   try {
  //     const res = await callFetchListFood("sort=sold,desc&size=4");
  //     if (res?.data) {
  //       setProducts(res.data.result);
  //       setTotal(res.data.meta.total);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching food:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const menuClickHandler = (category) => {
    setSelectedCategory(category);

    // Filter products by the selected category
    fetchProducts(category);
  };

  const fetchProducts = async (id) => {
    try {
      let query = `sort=sold,desc&size=4`;
      if (id === undefined) {
        id = selectedCategory;
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

  const fetchFoodByCategory = async (name) => {
    setIsLoading(true);
    try {
      const res = await callFetchListFood(`category=${name}&sort=sold,desc`);
      if (res?.data) {
        // Filter the results to only show items from the selected category
        const filteredProducts = res.data.result.filter(product => product.categoryName === name);
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error("Error fetching food by category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="menu"
      className="foodMenu"
    >
      <div className="container">
        <div className="row">
          <div className="foodMenuContainer">
            <h1 className="foodMenuContainerHeader">
              What will you eat today?
            </h1>
            <div className="foodMenuContainerList">
              {listCategory.map((category) => (
                <div
                  className={`foodMenuContainerItem ${selectedCategory === category.id ? 'active' : ''}`}
                  key={category.id}
                  onClick={() => menuClickHandler(category.id)}
                >
                  {category.name}
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="foodMenu">
                {products.map((product) => (
                  <div
                    className="foodMenuDetails"
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="foodMenuImg">
                      <img src={`${import.meta.env.VITE_CLOUDINARY_URL}/food/${product.image}`} alt={product.name} className="bgImg" />
                    </div>
                    <h1>{product.name}</h1>
                    <p>{`${product.price} đ`}</p>
                  </div>
                ))}
              </div>
            )}

            {products.length === 0 && !isLoading && (
              <div className="noProducts">No items found in this category</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Menu;