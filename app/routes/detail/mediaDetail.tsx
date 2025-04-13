import { useParams } from "react-router";
import { useEffect, useState } from "react";
import "../ItemStyle.css";
import { type Media } from "~/services/api";
import AddToCartButton from "~/components/buttons/addtocartbutton";
import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import WarningPopup from "./WarningPopup";
import SuccessPopup from "./SucessPopup";

export default function MediaDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const authData = useOutletContext<AuthData>();
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/itemdetail/${itemId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setMedia(data);
      } catch (error) {
        console.error("Error fetching media:", error);
        setError("Failed to load media details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchMediaDetails();
    }
  }, [itemId]);

  const handleHoldRequest = async () => {
    if (!authData.isLoggedIn) {
      setShowLoginWarning(true);
      return;
    }

    try {
      const response = await fetch("/api/holdrequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemid: media?.ItemID,
          memberid: authData.memberID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            data.error || "You already have a hold request for this media"
          );
        }
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }

      setPopupMessage("Hold request submitted successfully");
    } catch (error) {
      console.error("Error submitting hold request:", error);
      setPopupMessage(
        error instanceof Error ? error.message : "Error submitting hold request"
      );
    }
  };

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
          {media.Photo ? (
            <img
              src={`data:image/jpeg;base64,${media.Photo}`}
              alt={media.Title}
              className="w-full h-48 object-contain rounded-lg mb-2"
            />
          ) : (
            <p className="text-gray-500">No Photo Available</p>
          )}
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
            <strong>Format:</strong> {media.Format}
          </p>
          <p>
            <strong>Rating:</strong> {media.Rating}/10
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
        {media.Status === "Available" && <AddToCartButton item={media} />}
        {media.Status === "Checked Out" && (
          <button
            className="btn btn-secondary hold-button"
            onClick={handleHoldRequest}
          >
            Place Hold Request
          </button>
        )}

        {showLoginWarning && (
          <WarningPopup
            message="You must be logged in to place a hold request."
            onClose={() => setShowLoginWarning(false)}
          />
        )}

        {popupMessage && (
          <SuccessPopup
            message={popupMessage}
            onClose={() => setPopupMessage(null)}
          />
        )}
      </div>
    </div>
  );
}
