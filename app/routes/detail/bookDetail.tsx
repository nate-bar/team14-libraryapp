import { useParams } from "react-router";
import { useEffect, useState } from "react";
import "../ItemStyle.css";
import { type Book } from "~/services/api";
import AddToCartButton from "~/components/buttons/addtocartbutton";
import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import WarningPopup from "./WarningPopup";
import SuccessPopup from "./SucessPopup";

export default function BookDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const authData = useOutletContext<AuthData>();
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);


  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/itemdetail/${itemId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setBook(data);
      } catch (error) {
        console.error("Error fetching book:", error);
        setError("Failed to load book details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchBookDetails();
    }
  }, [itemId]);

  if (loading) {
    return (
      <div className="item-container">
        <h2>Loading book details...</h2>
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

  if (!book) {
    return (
      <div className="item-container">
        <h2>Book not found</h2>
      </div>
    );
  }

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
          itemid: book.ItemID,
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
        error instanceof Error
          ? error.message
          : "Error submitting hold request"
      );
    }
  };

  return (
    <div className="item-container">
      <h1 className="item-title">{book.Title}</h1>

      <div className="item-info">
        <div className="info-section">
          {book.Photo ? (
            <img
              src={`data:image/jpeg;base64,${book.Photo}`}
              alt={book.Title}
              className="w-full h-48 object-contain rounded-lg mb-2"
            />
          ) : (
            <p className="text-gray-500">No Photo Available</p>
          )}
          {/* added summary */}
          <p className="item-summary">{book.Summary}</p>
          <p>
            <strong>Author:</strong> {book.Authors}
          </p>
          <p>
            <strong>Publisher:</strong> {book.Publisher}
          </p>
          <p>
            <strong>Publication Year:</strong> {book.PublicationYear}
          </p>
          <p>
            <strong>ISBN:</strong> {book.ISBN}
          </p>
          <p>
            <strong>Genre:</strong> {book.GenreName}
          </p>
          <p>
            <strong>Language:</strong> {book.Language}
          </p>
        </div>
      </div>

      <div className="item-actions">
        {/* if book is available, show add to cart button */}
        {book.Status === "Available" && <AddToCartButton item={book} />}

        {/* if book is checked out, show put on hold button */}
        {book.Status === "Checked Out" && (
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
