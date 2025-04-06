import { useState, useEffect } from "react";
import "../routes/CartStyle.css";
import { type CartItem } from "~/services/api";
import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import { Navigate } from "react-router";
import "../routes/ItemStyle.css";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [debug, setDebug] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { isLoggedIn, memberID } = useOutletContext<AuthData>();

  // if user is not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    // Get cart data from sessionStorage
    const cartData = sessionStorage.getItem("shoppingCart");
    setDebug(`Raw cart data: ${cartData}`);

    // Parse cart data and filter out any "On Hold" items
    const allItems: CartItem[] = JSON.parse(cartData || "[]");
    const inCartItems = allItems.filter((item) => item.Category === "In Cart");

    console.log("Cart items loaded:", inCartItems);
    setCartItems(inCartItems);
  }, []);

  const removeFromCart = (itemId: number) => {
    const updatedCart = cartItems.filter((item) => item.ItemID !== itemId);
    setCartItems(updatedCart);
    sessionStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Function to process selected items
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Please select at least one item");
      return;
    }

    setIsSubmitting(true);

    // preparing item ids to send to server
    const selectedItemIds = cartItems.map((item) => item.ItemID);

    // api call
    fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: selectedItemIds, memberID }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // ON SUCCESSFUL CHECKOUT
        // Clear all items from cart
        setCartItems([]);
        sessionStorage.setItem("shoppingCart", JSON.stringify([]));
        window.dispatchEvent(new Event("cartUpdated"));

        alert(`Successfully processed ${cartItems.length} items`);
        console.log("Server response:", data);
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error("Error sending items:", error);
        alert(`Error processing items: ${error.message}`);
        setIsSubmitting(false);
      });
  };

  return (
    <div className="cart-container">
      <h1>We hope you enjoy your books member #{memberID}</h1>
      <div className="cart-section">
        <h2>Shopping Cart</h2>
        {cartItems.length ? (
          cartItems.map((item) => (
            <div key={item.ItemID} className="cart-item">
              <p>
                {item.Title} ({item.TypeName})
              </p>
              <button
                className="btn btn-danger"
                onClick={() => removeFromCart(item.ItemID)}
                disabled={isSubmitting}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No items in cart</p>
        )}
      </div>

      {cartItems.length > 0 && (
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
      )}
    </div>
  );
}
