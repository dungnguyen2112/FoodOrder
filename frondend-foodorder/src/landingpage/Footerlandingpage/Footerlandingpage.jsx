import React from "react";

import "./footer.scss";
import bg from './l.jpg';


const FooterLandingPage = () => {
  return (
    <footer
      className="footer bgImg bgImgFixed"
      style={{ backgroundImage: `url('/l.jpg')` }}
    >
      <div className="container">
        <div className="footerInfo">
          <div className="footerDetails">
            <h1>Services</h1>
            <a href="#home">
              <p>Delivery</p>
            </a>
            <a href="#menu">
              <p>Pricing</p>
            </a>
          </div>
          <div className="footerDetails">
            <h1>Information</h1>
            <a href="#contact">
              <p>Contact us</p>
            </a>
            <a href="#home">
              <p>Terms of services</p>
            </a>
          </div>
          <div className="footerDetails" >
            <iframe title="our location map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.699661607711!2d105.7848416!3d20.980913!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135accdd8a1ad71%3A0xa2f9b16036648187!2sHọc%20Viện%20Công%20Nghệ%20Bưu%20Chính%20Viễn%20Thông%20(PTIT)!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s">
            </iframe>
          </div>
        </div>
        <p className="license">copyright 2025 &#169; FoodOrder</p>
      </div>
    </footer>
  );
};

export default FooterLandingPage;
