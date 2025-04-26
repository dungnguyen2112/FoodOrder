import React, { useEffect, useState } from "react";

import "./menu.scss";
import bg from "./d.jpg";
import { callFetchCategory, callFetchCategoryPage, callFetchListFood, callFetchProductsByCategory } from "../../services/api";


const Menu = () => {
  const [products, setProducts] = useState([]);
  const [listCategory, setListCategory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(1);

  const transformCategoryData = (categories) => {
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchPageCategories = async () => {
      try {
        const res = await callFetchCategoryPage("size=6");
        if (res?.data) {
          setListCategory(transformCategoryData(res.data.result, true));
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
      className="foodMenu bgImg bgImgFixed"
      style={{ backgroundImage: `url('/u.jpg')` }}
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
                  <div className="foodMenuDetails" key={product.id}>
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