import React, { useState, useEffect } from "react";
import { AiOutlineHome } from 'react-icons/ai';
import { SiAboutdotme } from 'react-icons/si';
import { MdRestaurantMenu } from 'react-icons/md';
import { MdRateReview } from 'react-icons/md';
import { FaCommentDots } from 'react-icons/fa';

import "./header.scss";

const HeaderLandingPage = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      // Check if page has scrolled more than 50px
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Determine which section is currently in view
      const sections = ["home", "about", "menu", "testimonials", "contact"];
      let currentSection = "home";

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the top of the element is less than 30% of the viewport height, it's in view
          if (rect.top <= window.innerHeight * 0.3) {
            currentSection = section;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <nav className="navbar">
        <a href="#home">
          <div className="logo">FoodOrder</div>
        </a>
        <div className="menuItems">
          <a href="#home">
            <div className={`menuItem ${activeSection === "home" ? "active" : ""}`}>Home</div>
          </a>
          <a href="#about">
            <div className={`menuItem ${activeSection === "about" ? "active" : ""}`}>About</div>
          </a>
          <a href="#menu">
            <div className={`menuItem ${activeSection === "menu" ? "active" : ""}`}>Menu</div>
          </a>
          <a href="#testimonials">
            <div className={`menuItem ${activeSection === "testimonials" ? "active" : ""}`}>Testimonials</div>
          </a>
          <a href="#contact">
            <div className={`menuItem ${activeSection === "contact" ? "active" : ""}`}>Contact us</div>
          </a>
        </div>
      </nav>

      <nav className="mobileNavbar">
        <div className="mobileItems">
          <a href="#home">
            <div className={`mobileItem ${activeSection === "home" ? "active" : ""}`}>
              <AiOutlineHome />
            </div>
          </a>
          <a href="#about">
            <div className={`mobileItem ${activeSection === "about" ? "active" : ""}`}>
              <SiAboutdotme />
            </div>
          </a>
          <a href="#menu">
            <div className={`mobileItem ${activeSection === "menu" ? "active" : ""}`}>
              <MdRestaurantMenu />
            </div>
          </a>
          <a href="#testimonials">
            <div className={`mobileItem ${activeSection === "testimonials" ? "active" : ""}`}>
              <MdRateReview />
            </div>
          </a>
          <a href="#contact">
            <div className={`mobileItem ${activeSection === "contact" ? "active" : ""}`}>
              <FaCommentDots />
            </div>
          </a>
        </div>
      </nav>
    </header>
  );
};

export default HeaderLandingPage;

