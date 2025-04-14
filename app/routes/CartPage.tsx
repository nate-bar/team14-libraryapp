import React, { useState } from "react";
import { useCart } from "~/context/CartContext";
import { useOutletContext, Navigate, Link } from "react-router";
import { type AuthData, type CartItem } from "~/services/api";
import AlertPopup from "~/components/buttons/AlertPopup";
import "../routes/CartStyle.css";
import "../routes/ItemStyle.css";

export default function CartPage() {
  const getItemDetailPath = (item: CartItem): string => {
    switch (item.TypeName) {
      case "Book":
        return `/book/${item.ItemID}`;
      case "Media":
        return `/media/${item.ItemID}`;
      case "Device":
        return `/device/${item.ItemID}`;
      default:
        return `/items/${item.ItemID}`;
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null); // 👈 for popup
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { isLoggedIn, memberID } = useOutletContext<AuthData>();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setPopupMessage("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedItemIds = cartItems.map((item) => item.ItemID);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItemIds, memberID }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();

      setPopupMessage(`Successfully checked out ${cartItems.length} items`);
      clearCart();
      console.log("Checkout response:", data);
    } catch (error) {
      console.error("Checkout error:", error);
      setPopupMessage(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-container">
      <h1>We hope you enjoy your books, member #{memberID}</h1>

      <div className="cart-section">
        <h2>Shopping Cart ({cartItems.length} items)</h2>

        {cartItems.length > 0 ? (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.ItemID} className="cart-item">
                  <div className="item-details">
                    <p className="item-title">
                      <Link to={getItemDetailPath(item)}>{item.Title}</Link>
                    </p>
                    <p className="item-type">{item.TypeName}</p>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => removeFromCart(item.ItemID)}
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="checkout-section">
              <button
                className="btn btn-primary checkout-button"
                onClick={handleCheckout}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing..."
                  : `Checkout (${cartItems.length} items)`}
              </button>
            </div>
          </>
        ) : (
          <p className="empty-cart-message">Your cart is empty</p>
        )}
      </div>

      {popupMessage && (
        <AlertPopup
          message={popupMessage}
          onClose={() => setPopupMessage(null)}
        />
      )}
    </div>
  );
}
