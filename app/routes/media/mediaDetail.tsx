import { useParams } from "react-router";
import { useEffect, useState } from "react";
import "../ItemStyle.css";
import { type Media } from "~/services/api";
import { type CartItem } from "~/services/api";

export default function MediaDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/mediadetail/${itemId}`)
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

  const handleAction = (action: "In Cart" | "On Hold") => {
    if (!media) return;

    try {
      // Get current cart or initialize empty array
      let cart: CartItem[] = [];
      const cartData = sessionStorage.getItem("shoppingCart");

      if (cartData) {
        cart = JSON.parse(cartData);
        console.log("Existing cart loaded:", cart);
      }

      // Check if item already exists
      if (!cart.some((item) => item.ItemID === media.ItemID)) {
        // Create a simplified item object
        const newItem: CartItem = {
          ItemID: media.ItemID,
          Title: media.Title,
          TypeName: media.TypeName,
          Status: media.Status,
          Category: action,
        };

        cart.push(newItem);
        const newCartString = JSON.stringify(cart);
        sessionStorage.setItem("shoppingCart", newCartString);
        window.dispatchEvent(new Event("cartUpdated"));
        console.log("Item added, new cart:", cart);
        alert(`${media.Title} added to ${action}`);
      } else {
        alert(`${media.Title} is already in the cart`);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      alert("There was an error adding the item to cart");
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

      {/* Action Buttons */}
      <div className="item-actions">
        {/* Checkout/Hold Button Based on Status */}
        {media.Status === "Available" ? (
          <button
            className="btn btn-primary"
            onClick={() => handleAction("In Cart")}
          >
            Add to Cart
          </button>
        ) : media.Status === "Checked Out" ? (
          <button
            className="btn btn-warning"
            onClick={() => handleAction("On Hold")}
          >
            Place on Hold
          </button>
        ) : (
          <button className="btn btn-disabled" disabled>
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
}
