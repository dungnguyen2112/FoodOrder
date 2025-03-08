import React from "react";
import "./about.scss";
import bg from "./g.jpg";

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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                tincidunt, nisl non fringilla aliquet, urna est lacinia eros, id
                varius libero odio sit amet mi. Nullam euismod, nisl nec
                scelerisque tincidunt, nunc felis ultricies sapien, nec
                accumsan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
