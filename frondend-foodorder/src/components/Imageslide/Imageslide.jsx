import React, { useState, useEffect } from "react";

const styles = {
  sliderContainer: {
    position: "relative",
    width: "100%",
    height: "400px",
    margin: "auto",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    borderRadius: "10px",
    background: "#000", // Thêm màu nền tối để tránh hiển thị trắng khi chuyển ảnh
  },
  slide: {
    position: "absolute",
    width: "100%",
    height: "400px",
    borderRadius: "10px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "all 1s ease-in-out",
    opacity: 0,
    transform: "scale(1.05)",
  },
  activeSlide: {
    opacity: 1,
    zIndex: 1,
    transform: "scale(1)",
  },
  leftArrow: {
    position: "absolute",
    top: "50%",
    left: "25px",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    color: "#fff",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "50%",
    zIndex: 2,
    cursor: "pointer",
    userSelect: "none",
    transform: "translateY(-50%)",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  },
  rightArrow: {
    position: "absolute",
    top: "50%",
    right: "25px",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    color: "#fff",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "50%",
    zIndex: 2,
    cursor: "pointer",
    userSelect: "none",
    transform: "translateY(-50%)",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  },
  dotsContainer: {
    position: "absolute",
    bottom: "20px",
    left: "0",
    right: "0",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    zIndex: 2,
  },
  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
  },
  activeDot: {
    backgroundColor: "#ffffff",
    transform: "scale(1.2)",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "150px",
    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
    zIndex: 1,
    pointerEvents: "none",
  },
  titleContainer: {
    position: "absolute",
    bottom: "50px",
    left: "0",
    right: "0",
    textAlign: "center",
    zIndex: 2,
    padding: "0 50px",
  },
  slideTitle: {
    color: "#fff",
    fontSize: "24px",
    fontWeight: "bold",
    textShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
    margin: 0,
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "4px",
    backgroundColor: "#fff",
    zIndex: 2,
    transition: "width 0.2s linear",
  },
  navButton: {
    ":hover": {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      transform: "translateY(-50%) scale(1.1)",
    },
  },
  noSlides: {
    textAlign: "center",
    padding: "50px",
    color: "#666",
    fontSize: "18px",
    fontWeight: "bold",
  },
};

export function Imageslide({ slides = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalTime = 3000;

  useEffect(() => {
    if (!slides || slides.length === 0) return;

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / intervalTime) * 10;
      });
    }, 10);

    // Slide change interval
    const slideInterval = setInterval(() => {
      setProgress(0);
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, intervalTime);

    return () => {
      clearInterval(slideInterval);
      clearInterval(progressInterval);
    };
  }, [slides, currentIndex]);

  const goToPrevious = () => {
    setProgress(0);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setProgress(0);
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (slideIndex) => {
    setProgress(0);
    setCurrentIndex(slideIndex);
  };

  if (!slides || slides.length === 0) {
    return (
      <div style={styles.sliderContainer}>
        <div style={styles.noSlides}>
          No slides available
        </div>
      </div>
    );
  }

  return (
    <div style={styles.sliderContainer}>
      <div
        style={styles.leftArrow}
        onClick={goToPrevious}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
          e.currentTarget.style.transform = "translateY(-50%)";
        }}
      >
        ❰
      </div>
      <div
        style={styles.rightArrow}
        onClick={goToNext}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
          e.currentTarget.style.transform = "translateY(-50%)";
        }}
      >
        ❱
      </div>

      {slides.map((slide, index) => (
        <div
          key={index}
          style={{
            ...styles.slide,
            ...(index === currentIndex ? styles.activeSlide : {}),
            backgroundImage: `url(${slide.url})`,
          }}
          loading="lazy"
        />
      ))}

      {/* Gradient Overlay */}
      <div style={styles.gradientOverlay}></div>

      {/* Title Display - Uncomment to use */}
      {/* 
      <div style={styles.titleContainer}>
        <h3 style={styles.slideTitle}>{slides[currentIndex].title}</h3>
      </div>
      */}

      {/* Progress Bar */}
      <div
        style={{
          ...styles.progressBar,
          width: `${progress}%`,
        }}
      ></div>

      <div style={styles.dotsContainer}>
        {slides.map((_, slideIndex) => (
          <div
            key={slideIndex}
            style={{
              ...styles.dot,
              ...(slideIndex === currentIndex ? styles.activeDot : {}),
            }}
            onClick={() => goToSlide(slideIndex)}
          />
        ))}
      </div>
    </div>
  );
}

export default Imageslide;