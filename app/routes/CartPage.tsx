import { useState, useEffect } from "react";
import "../routes/CartStyle.css";

interface CartItem {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  Category: "Bookmark" | "Check Out" | "On Hold";
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("shoppingCart") || "[]");
    setCartItems(cart);
  }, []);

  // Remove item from cart
  const removeFromCart = (itemId: number) => {
    const updatedCart = cartItems.filter((item) => item.ItemID !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
  };

  // Handle checkout
  const handleCheckout = async () => {
    try {
      const sessionRes = await fetch("/api/session");
      if (!sessionRes.ok) throw new Error("Not logged in");

      // Save cart to session
      await fetch("/api/cart/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cartItems }),
      });

      // Trigger checkout
      const checkoutRes = await fetch("/api/cart/checkout", {
        method: "POST",
      });

      const result = await checkoutRes.json();
      if (checkoutRes.ok) {
        alert("Checkout successful!");
        localStorage.removeItem("shoppingCart");
        setCartItems([]);
      } else {
        alert(result.error || "Checkout failed.");
      }
    } catch (err) {
      alert("You must be logged in to check out.");
    }
  };

  const renderSection = (title: string, category: CartItem["Category"]) => {
    const items = cartItems.filter(item => item.Category === category);
    return (
      <div className="cart-section">
        <h2>{title}</h2>
        {items.length ? (
          items.map(item => (
            <div key={item.ItemID} className="cart-item">
              <p>{item.Title} ({item.TypeName})</p>
              <button className="btn btn-danger" onClick={() => removeFromCart(item.ItemID)}>Remove</button>
            </div>
          ))
        ) : (
          <p>No {title.toLowerCase()}</p>
        )}
      </div>
    );
  };

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      {renderSection("Bookmarked", "Bookmark")}
      {renderSection("Checked Out", "Check Out")}
      {renderSection("On Hold", "On Hold")}

      {/* Checkout button */}
      {cartItems.some(item => item.Category === "Check Out") && (
        <div className="checkout-section">
          <button className="btn btn-success" onClick={handleCheckout}>
            Checkout All
          </button>
        </div>
      )}
    </div>
  );
}
