import React from "react";

import "./home.scss";

const HomeLandingPage = () => {
  return (
    <section id="home" className="home">
      <video
        className="homeVideoIntro"
        autoPlay
        muted
        loop
      >
        <source src="/assets/intro2.mp4" type="video/mp4" />
        Your browser is not supported
      </video>
      <div className="homeDetails">
        <div className="container">
          <div className="row">
            <div className="slogan">
              <h1>FoodOrder</h1>
              <p>Order your favorite food from your favorite restaurant</p>
              <div>
                <a href="http://localhost:3000/"><button>Order Now</button></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeLandingPage;
