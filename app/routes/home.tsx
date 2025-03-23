// HomePage.tsx
import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import "./home.css"; // Import the CSS file

// Images for Sliding Gallery
const images = [
  {
    src: "/Rodeo.jpg",
    caption: "Rodeo Season! Tales of the Wild West",
    link: "https://example.com/image1",
  },
  {
    src: "/Memorial.jpg",
    caption: "Honor Our Troops for Memorial Day",
    link: "https://example.com/image2",
  },
  {
    src: "/Juneteenth.jpg",
    caption: "Juneteenth! Freedom and Equality For All",
    link: "https://example.com/image3",
  },
  {
    src: "/4th.jpg",
    caption: "Celebrate Liberty and Independence",
    link: "https://example.com/image4",
  },
];

// Images for Scrolling Gallery
const images2 = [
  { id: "books", src: "/D-Book.jpg", alt: "Books" },
  { id: "magazines", src: "/Magazines.jpg", alt: "Magazines" },
  { id: "films", src: "/Films.jpg", alt: "Films" },
  { id: "tech", src: "/Tech.jpg", alt: "Technology" },
];

const HomePage: React.FC = () => {
  const { memberID } = useOutletContext<AuthData>();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Moves the slider forward by two slides
  const moveSlider = () => {
    let newSlide = currentSlide + 2;
    if (newSlide >= images.length) newSlide = 0; // Loop to start
    setCurrentSlide(newSlide);
  };

  return (
    <div>
      <div className="welcome-container">
        <h2 className="welcome-title">Dive Into A Sea of Knowledge</h2>
      </div>

      {/* Featured Picks Section */}
      <div className="gallery-slider">
        <div className="slider-left">
          <h2 className="featured-title">Featured Staff Picks</h2>
          <p className="featured-description">
            Specially selected books and films to inspire and engage individuals
            in anticipation of the upcoming event.
          </p>
        </div>
        <div className="slider-right">
          {/* Image Container */}
          <div className="slider-images-container">
            <div
              className="slider-images"
              style={{ transform: `translateX(-${(currentSlide / 2) * 100}%)` }}
            >
              {images.map((image, index) => (
                <div className="slider-image" key={index}>
                  <a
                    href={image.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={image.src} alt={`Slide ${index + 1}`} />
                    <div className="slider-caption">{image.caption}</div>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Button (Only Right) */}
          <div
            className="slider-button slider-button-right"
            onClick={moveSlider}
          >
            &#10095;
          </div>
        </div>
      </div>

      {/* Scrolling Gallery Below */}
      <ScrollingGallery />
    </div>
  );
};

// Scrolling Gallery Component
const ScrollingGallery: React.FC = () => {
  const galleryRef = useRef<HTMLDivElement>(null);

  // Scrolls the gallery to the specified item
  const scrollToItem = (itemId: string) => {
    const item = document.getElementById(itemId);
    if (item && galleryRef.current) {
      galleryRef.current.scrollTo({
        top: item.offsetTop - galleryRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="scrolling-gallery">
      {/* Header */}
      <h2 className="gallery-header">Catalog At A Glance</h2>

      <div className="gallery-container">
        {/* Left Column: Text Navigation */}
        <div className="gallery-nav">
          {images2.map(({ id, alt }) => (
            <button key={id} onClick={() => scrollToItem(id)}>
              {alt}
            </button>
          ))}
        </div>

        {/* Right Column: Images */}
        <div className="gallery-content" ref={galleryRef}>
          {images2.map(({ id, src, alt }) => (
            <div key={id} id={id} className="gallery-item">
              <img src={src} alt={alt} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
