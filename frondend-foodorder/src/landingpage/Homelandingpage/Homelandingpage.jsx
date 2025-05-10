import React from "react";
import { Link } from "react-router-dom";

import "./home.scss";

const HomeLandingPage = () => {
  return (
    <section id="home" className="home">
      <div className="homeDetails">
        <div className="container">
          <div className="row">
            <div className="slogan">
              <h1>FoodOrder</h1>
              <p>Order your favorite food from your favorite restaurant</p>
              <div>
                <Link to="/">
                  <button>Order Now</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeLandingPage;
