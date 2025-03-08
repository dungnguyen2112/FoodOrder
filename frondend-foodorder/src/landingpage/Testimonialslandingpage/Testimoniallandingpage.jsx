import React from "react";
import "./testimonial.scss";

const Testimonial = () => {
  const testimonials = [
    {
      img: "/user/a.jpg",
      name: "Linh",
      text: "The service was outstanding, and the atmosphere was very welcoming. I really enjoyed my time here and would love to come back!"
    },
    {
      img: "/user/b.jpg",
      name: "Nam",
      text: "Great food and excellent service! The staff was very friendly and attentive. Highly recommended for a wonderful dining experience."
    },
    {
      img: "/user/c.jpg",
      name: "Hoa",
      text: "A perfect place for a family gathering. The ambiance was cozy, and the food was simply delicious. Definitely a five-star experience!"
    }
  ];

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <h1 className="testimonialsHeader">Testimonials</h1>
        <div className="testimonialsAll">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonialsDetails">
              <img className="bgImg" src={testimonial.img} alt={testimonial.name} />
              <h1>{testimonial.name}</h1>
              <p>{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
