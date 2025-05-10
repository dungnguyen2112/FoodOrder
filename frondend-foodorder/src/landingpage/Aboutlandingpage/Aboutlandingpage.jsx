import React from "react";
import "./about.scss";

const About = () => {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="row">
          <div className="aboutContainer">
            <div
              style={{ backgroundImage: `url('/p.jpg')` }}
              className="aboutContainerImg bgImg"
            ></div>

            <div className="aboutContainerDetails">
              <h1>
                About <span>Us</span>
              </h1>
              <p>
                Welcome to FoodOrder, where culinary excellence meets convenience.
                Our platform connects you with the finest restaurants and their delectable offerings,
                all at the touch of a button. Experience seamless ordering, swift delivery, and
                exceptional taste with every meal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
