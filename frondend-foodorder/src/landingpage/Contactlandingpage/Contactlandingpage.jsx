import React from "react";
import Form from "./Form/Formlandingpage";
import ZaloContact from "../../components/ZaloContact";

import { TiLocationOutline } from 'react-icons/ti';
import { FaMobileAlt } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';
import { BsChatSquare } from 'react-icons/bs';
import { AiFillFacebook } from 'react-icons/ai';
import { AiOutlineWhatsApp } from 'react-icons/ai';
import { FaInstagram } from 'react-icons/fa';
import "./contact.scss";

const Contact = () => {
  return (
    <section id="contact" className="contact">
      <div className="container">
        <h1 className="contactHeader">Contact us</h1>
        <div className="contactAddress">
          <div className="contactAddressDetails">
            <h2><TiLocationOutline /></h2>
            <h1>Location</h1>
            <p>PTIT</p>
          </div>
          <div className="contactAddressDetails">
            <h2><FaMobileAlt /></h2>
            <h1>phone</h1>
            <p>0978025217</p>
          </div>
          <div className="contactAddressDetails">
            <h2><AiOutlineMail /></h2>
            <h1>Email</h1>
            <p>nguyentridung20044@gmail.com</p>
          </div>
          <div className="contactAddressDetails">
            <h2><BsChatSquare /></h2>
            <h1>Chat</h1>
            <div className="social">
              <a href="https://www.facebook.com/">
                <AiFillFacebook />
              </a>
              <a href="https://www.whatsapp.com/">
                <AiOutlineWhatsApp />
              </a>
              <a href="https://www.instagram.com/">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <Form />

        <ZaloContact />
      </div>
    </section>
  );
};

export default Contact;
