import React, { useState } from "react";

import "./menu.scss";
import bg from "./d.jpg";

import { burgers } from "../Datalandingpage/burger";
import { combo } from "../Datalandingpage/combo";
import { others } from "../Datalandingpage/others";
import { pizza } from "../Datalandingpage/pizza";
import { chicken } from "../Datalandingpage/chicken";

const Menu = () => {
  const [products, setProducts] = useState(combo);

  const menu = [
    {
      id: 1,
      name: "Combo",
    },
    {
      id: 2,
      name: "Burger",
    },
    {
      id: 3,
      name: "Pizza",
    },
    {
      id: 4,
      name: "Chicken",
    },
    {
      id: 5,
      name: "Drinks & others",
    },
  ];

  const menuClickHandler = (data) => {
    if (data.name === "Combo") {
      setProducts(combo);
    } else if (data.name === "Burger") {
      setProducts(burgers);
    } else if (data.name === "Pizza") {
      setProducts(pizza);
    } else if (data.name === "Chicken") {
      setProducts(chicken);
    } else if (data.name === "Drinks & others") {
      setProducts(others);
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
              {menu.map((m) => (
                <div
                  className="foodMenuContainerItem"
                  key={m.id}
                  onClick={() => menuClickHandler(m)}
                >
                  {m.name}
                </div>
              ))}
            </div>
            <div className="foodMenu">
              {products.map((p) => (
                <div className="foodMenuDetails" key={p.id}>
                  <div className="foodMenuImg">
                    <img src={p.imageUrl} alt={p.name} className="bgImg" />
                  </div>
                  <h1>{p.name}</h1>
                  <p>{`${p.price} $`}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Menu;
