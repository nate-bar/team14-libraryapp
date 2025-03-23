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
  const { isLoggedIn, memberID } = useOutletContext<AuthData>();

  // if user is not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    // Get cart data from sessionStorage
    const cartData = sessionStorage.getItem("shoppingCart");
    setDebug(`Raw cart data: ${cartData}`);

    const cart: CartItem[] = JSON.parse(cartData || "[]");
    console.log("Cart items loaded:", cart); // Added console log
    setCartItems(cart);
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
        const updatedCart = cartItems.filter(
          (item) => item.Category === "On Hold"
        );
        setCartItems(updatedCart);
        sessionStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event("cartUpdated"));
        // CLEAR ITEMS FROM CART AND UPDATE

        alert(`Successfully processed ${cartItems.length} items`);
        console.log("Server response:", data);
      })
      .catch((error) => {
        console.error("Error sending items:", error);
        alert(`Error processing items: ${error.message}`);
      });
  };

  // Count items in each category for debugging
  const checkoutCount = cartItems.filter(
    (item) => item.Category === "In Cart"
  ).length;
  const holdCount = cartItems.filter(
    (item) => item.Category === "On Hold"
  ).length;

  return (
    <div className="cart-container">
      <h1>We hope you enjoy your books member #{memberID}</h1>
      <div className="cart-section">
        <h2>Shopping Cart</h2>
        {cartItems.filter((item) => item.Category === "In Cart").length ? (
          cartItems
            .filter((item) => item.Category === "In Cart")
            .map((item) => (
              <div key={item.ItemID} className="cart-item">
                <p>
                  {item.Title} ({item.TypeName})
                </p>
                <button
                  className="btn btn-danger"
                  onClick={() => removeFromCart(item.ItemID)}
                >
                  Remove
                </button>
              </div>
            ))
        ) : (
          <p>No items in cart</p>
        )}
      </div>

      <div className="cart-section">
        <h2>On Hold</h2>
        {cartItems.filter((item) => item.Category === "On Hold").length ? (
          cartItems
            .filter((item) => item.Category === "On Hold")
            .map((item) => (
              <div key={item.ItemID} className="cart-item">
                <p>
                  {item.Title} ({item.TypeName})
                </p>
                <button
                  className="btn btn-danger"
                  onClick={() => removeFromCart(item.ItemID)}
                >
                  Remove
                </button>
              </div>
            ))
        ) : (
          <p>No items on hold</p>
        )}
      </div>
      {cartItems.filter((item) => item.Category === "In Cart").length > 0 && (
        <div className="checkout-section">
          <button
            className="btn btn-primary checkout-button"
            onClick={handleCheckout}
          >
            Checkout (
            {cartItems.filter((item) => item.Category === "In Cart").length}{" "}
            items)
          </button>
        </div>
      )}
    </div>
  );
}
