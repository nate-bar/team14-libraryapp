import { useParams } from "react-router";
import { useEffect, useState } from "react";
import "../ItemStyle.css";
import { type Book } from "~/services/api";
import { type CartItem } from "~/services/api";

export default function BookDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bookdetail/${itemId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching book:", error);
        setError("Failed to load book details. Please try again.");
        setLoading(false);
      });
  }, [itemId]);

  const handleAction = (action: "In Cart" | "On Hold") => {
    if (!book) return;

    try {
      // Get current cart or initialize empty array
      let cart: CartItem[] = [];
      const cartData = sessionStorage.getItem("shoppingCart");

      if (cartData) {
        cart = JSON.parse(cartData);
        console.log("Existing cart loaded:", cart);
      }

      // Check if item already exists
      if (!cart.some((item) => item.ItemID === book.ItemID)) {
        // Create a simplified item object
        const newItem: CartItem = {
          ItemID: book.ItemID,
          Title: book.Title,
          TypeName: book.TypeName,
          Status: book.Status,
          Category: action,
        };

        cart.push(newItem);
        const newCartString = JSON.stringify(cart);
        sessionStorage.setItem("shoppingCart", newCartString);
        window.dispatchEvent(new Event("cartUpdated"));
        console.log("Item added, new cart:", cart);
        alert(`${book.Title} added to ${action}`);
      } else {
        alert(`${book.Title} is already in the cart`);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      alert("There was an error adding the item to cart");
    }
  };

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

  return (
    <div className="item-container">
      <h1 className="item-title">{book.Title}</h1>

      <div className="item-info">
        <div className="info-section">
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
        </div>

        <div className="info-section">
          <p>
            <strong>Status:</strong> {book.Status}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="item-actions">
        {/* Checkout/Hold Button Based on Status */}
        {book.Status === "Available" ? (
          <button
            className="btn btn-primary"
            onClick={() => handleAction("In Cart")}
          >
            Add to Cart
          </button>
        ) : book.Status === "Checked Out" ? (
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
