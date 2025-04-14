    // HomePage.tsx
    import React, { useState, useEffect , useRef} from "react";
    import { useOutletContext } from "react-router";
    import { type AuthData , type Event, type GalleryImage} from "~/services/api";
    import "./home.css"; // Import the CSS file


    // Images for Scrolling Gallery
    const images2 = [
      { id: "books", src: "/D-Book.jpg", alt: "Books",
        description: (
          <>
          We proudly keep our collection of books well stocked, with a wide selection of various genres, ranging from manga to educational materials!{" "}
          <a href="/quickcatalog/books" className="modal-link">
            Explore our books &rarr;
          </a>
        </>
        ),
      },
      //{ id: "magazines", src: "/Magazines.jpg", alt: "Magazines" },
      { id: "films", src: "/Films.jpg", alt: "Films",
        description: (
          <>
          Watch thought-provoking documentaries, blockbuster hits, and indie gems in our film archive, guaranteed to satisfy any film enthusiast or casual viewer!{" "}
          <a href="/quickcatalog/media" className="modal-link">
            Watch now &rarr;
          </a>
        </>
      ),
      },
      { id: "tech", src: "/Tech.jpg", alt: "Technology",
        description: (
          <>
          Dreaming of producing your own indie film or starting a podcast? Or perhaps you're just looking for devices to help you study! Access our latest tech devices and educational tools to support your learning and creativity.{" "}
          <a href="/quickcatalog/devices" className="modal-link">
            See available tech &rarr;
          </a>
        </>
      ),
      },
    ];

    const HomePage: React.FC = () => {
      const { memberID } = useOutletContext<AuthData>();
      const [currentSlide, setCurrentSlide] = useState(0);
      const [events, setEvents] = useState<Event[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

      useEffect(() => {
        const fetchEvents = async () => {
          setLoading(true);
          setError(null);
          try {
            // Replace '/api/events' with the actual endpoint to fetch your events data
            const response = await fetch('/api/events');
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Event[] = await response.json();
            setEvents(data);
          } catch (e: any) {
            setError(e.message);
          } finally {
            setLoading(false);
          }
        };
    
        fetchEvents();
      }, []);
    
      useEffect(() => {
        // Filter events based on the current date
        const currentDate = new Date();
        const activeEvents = events.filter(event => {
          const startDate = new Date(event.StartDate);
          const endDate = new Date(event.EndDate);
          return startDate <= currentDate && currentDate <= endDate;
        });
    
        // Transform the active events into the format expected by the gallery
        const formattedImages: GalleryImage[] = activeEvents.map(event => ({
          src: event.EventPhoto, // Assuming EventPhoto holds the path to the image
          caption: event.EventName,
          link: `/eventpage/${event.EventID}`, // Adjust the link as needed
        }));
    
        setGalleryImages(formattedImages);
        setCurrentSlide(0); // Reset the slide when the events change
      }, [events]);
    
      // Moves the slider by two slides
      const moveSlider = (direction: number) => {
        if (galleryImages.length === 0) {
          return; // Don't move if there are no images
        }
        let newSlide = currentSlide + (2 * direction);
    
        if (direction > 0) { // Moving right
          if (newSlide >= galleryImages.length) {
            newSlide = 0; // Loop to start
          }
        } else { // Moving left
          if (newSlide < 0) {
            newSlide = galleryImages.length - 1; // Loop to end
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
    
      if (loading) {
        return <div>Loading upcoming events...</div>;
      }
    
      if (error) {
        return <div>Error loading events: {error}</div>;
      }

      return (
        <div>
          <div className="welcome-container">
            <h2 className="welcome-title">Dive Into A Sea of Knowledge</h2>
          </div>

          {/* Featured Picks Section */}
          <div className="gallery-slider">
            <div className="slider-left">
              <h2 className="featured-title">Library Events</h2>
              <p className="featured-description">
                Specially selected books and films to inspire and engage individuals
                in anticipation of the upcoming event.
              </p>
            </div>
            <div className="slider-right">
              {/* Image Container */}
              <div className="slider-images-container">
              {galleryImages.length > 0 ? (
              <div
                className="slider-images"
                style={{ transform: `translateX(-${(currentSlide / 2) * 100}%)` }}
              >
                {galleryImages.map((image, index) => (
                  <div className="slider-image" key={index}>
                    <a href={image.link}>
                      <img src={image.src} alt={image.caption} />
                      <div className="slider-caption">{image.caption}</div>
                    </a>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="no-events">No upcoming events at this time.</div>
            )}
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
        description?: React.ReactNode;
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
        description?: React.ReactNode;
      } | null>(null);

      const handleImageClick = (img: { src: string; alt: string; description?: React.ReactNode }) => {
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
    