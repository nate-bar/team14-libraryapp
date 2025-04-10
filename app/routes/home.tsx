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
      link: "/events/event1",
    },
    {
      src: "/Memorial.jpg",
      caption: "Honor Our Troops for Memorial Day",
      link: "/events/event2",
    },
    {
      src: "/Juneteenth.jpg",
      caption: "Juneteenth! Freedom and Equality For All",
      link: "/events/event3",
    },
    {
      src: "/4th.jpg",
      caption: "Celebrate Liberty and Independence",
      link: "/events/event4",
    },
  ];

  // Images for Scrolling Gallery
  const images2 = [
    { id: "books", src: "/D-Book.jpg", alt: "Books",
      description: "We proudly keep our collection of books well stocked, with a wide selection of various genres, ranging from manga to educational materials!",
    },
    //{ id: "magazines", src: "/Magazines.jpg", alt: "Magazines" },
    { id: "films", src: "/Films.jpg", alt: "Films",
      description: "Watch thought-provoking documentaries, blockbuster hits, and indie gems in our film archive, guaranteed to satisfy any film enthusiast or casual viewer!",
    },
    { id: "tech", src: "/Tech.jpg", alt: "Technology",
      description: "Dreaming of producing your own indie film or starting a podcast? Or perhaps you're just looking for devices to help you study! Access our latest tech devices and educational tools to support your learning and creativity.",
    },
  ];

  const HomePage: React.FC = () => {
    const { memberID } = useOutletContext<AuthData>();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Moves the slider by two slides
    const moveSlider = (direction: number) => {
      let newSlide = currentSlide + (2*direction);
      
      if (direction > 0) { //Moving right
        if (newSlide >= images.length) {
          newSlide = 0; // Loop to start
        }
      }
      else { //Moving left
        if (newSlide < 0) {
          newSlide = images.length - 1; // Loop to end
        }
      }
      setCurrentSlide(newSlide);
    };

    // For the right button
const handleRightClick = () => {
  moveSlider(1);
};

// For the left button
const handleLeftClick = () => {
  moveSlider(-1);
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

            {/* Navigation Buttons*/}
            <div className="slider-buttons">
              <button 
              className="slider-button slider-button-left" 
              onClick={handleLeftClick}
              aria-label="Previous slide"
              >&lt; 
              </button>

              <button 
              className="slider-button slider-button-right" 
              onClick={handleRightClick}
              aria-label="Next slide"
              >&gt;
              </button>
            </div>
          </div>
        </div>

        {/* Scrolling Gallery Below */}
        <ScrollingGallery />
      </div>
    );
  };

  type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    content: {
      src: string;
      alt: string;
      description?: string;
    } | null;
  };

  //Scrolling Gallery Popup "Modal" Component
  const PopupModal: React.FC<ModalProps> = ({ isOpen, onClose, content }) => {
    if (!isOpen || !content) return null;

    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <button
            className="modal-close-button" onClick={onClose}>
            &times;
          </button>
          <img src={content.src} alt={content.alt} />
          <h2>{content.alt}</h2>
          <p>{content.description || "No description provided for this category."}</p>
        </div>
      </div>
    );
  };

  // Scrolling Gallery Component
  const ScrollingGallery: React.FC = () => {
    const galleryRef = useRef<HTMLDivElement>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{
      src: string;
      alt: string;
      description?: string;
    } | null>(null);

    const handleImageClick = (img: { src: string; alt: string; description?: string }) => {
      setSelectedImage(img);
      setModalOpen(true);
    };

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
        <p className="gallery-subheader">Click to find out more!</p>

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
            {images2.map(({ id, src, alt, description }) => (
              <div key={id} id={id} className="gallery-item">
                <img
                  src={src}
                  alt={alt}
                  onClick={() =>
                    handleImageClick({
                      src,
                      alt,
                      description,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Popup Window */}
        <PopupModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          content={selectedImage}
        />
      </div>
    );
  };

  export default HomePage;
