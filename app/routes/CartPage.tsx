import React, { useState } from "react";
import { useCart } from "~/context/CartContext";
import { useOutletContext, Navigate, Link } from "react-router";
import { type AuthData, type CartItem } from "~/services/api";
import "../routes/CartStyle.css";
import "../routes/ItemStyle.css";

export default function CartPage() {
  // helper function to get the path for the item based on type
  // this is for routing to back to the itemdetail page from cart
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { isLoggedIn, memberID } = useOutletContext<AuthData>();

  // simple redirect if user is not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setCheckoutError("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      // prepare itemids for checkout api call
      const selectedItemIds = cartItems.map((item) => item.ItemID);

      // making the api call
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: selectedItemIds, memberID }),
      });

      // handle response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();

      // alert on successful checkout
      alert(`Successfully checked out ${cartItems.length} items`);
      clearCart(); // clear the cart using CartContext

      console.log("Checkout response:", data);
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-container">
      <h1>We hope you enjoy your books member #{memberID}</h1>

      <div className="cart-section">
        <h2>Shopping Cart ({cartItems.length} items)</h2>

        {checkoutError && <div className="error-message">{checkoutError}</div>}

        {cartItems.length > 0 ? (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.ItemID} className="cart-item">
                  <div className="item-details">
                    <p className="item-title">
                      {/* Item now holds link back to the item detail page */}
                      <Link to={getItemDetailPath(item)}>{item.Title}</Link>
                    </p>
                    <p className="item-type">{item.TypeName}</p>
                  </div>
                  {/* remove from cart button */}
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
    </div>
  );
}
