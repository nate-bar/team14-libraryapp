import { useParams } from "react-router";
import { useEffect, useState } from "react";
import "../ItemStyle.css";
import { type Media } from "~/services/api";
import { type CartItem } from "~/services/api";
import AddToCartButton from "~/components/buttons/addtocartbutton";

export default function MediaDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/itemdetail/${itemId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setMedia(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching book:", error);
        setError("Failed to load book details. Please try again.");
        setLoading(false);
      });
  }, [itemId]);

  if (loading) {
    return (
      <div className="item-container">
        <h2>Loading media details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="item-container">
        <h2>Error</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="item-container">
        <h2>Media not found</h2>
      </div>
    );
  }
  return (
    <div className="item-container">
      <h1 className="item-title">{media.Title}</h1>

      <div className="item-info">
        <div className="info-section">
          <p>
            <strong>Director:</strong> {media.Director}
          </p>
          <p>
            <strong>Leads:</strong> {media.Leads}
          </p>
          <p>
            <strong>Release Year:</strong> {media.ReleaseYear}
          </p>
          <p>
            <strong>MediaID:</strong> {media.MediaID}
          </p>
          <p>
            <strong>Genre:</strong> {media.GenreName}
          </p>
          <p>
            <strong>Language:</strong> {media.Language}
          </p>
        </div>

        <div className="info-section">
          <p>
            <strong>Status:</strong> {media.Status}
          </p>
        </div>
      </div>

      <div className="item-actions">
        <div className="item-actions">
          <AddToCartButton item={media} />
        </div>
      </div>
    </div>
  );
}
